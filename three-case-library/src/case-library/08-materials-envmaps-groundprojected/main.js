import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const params = {
    skyboxHeight: 16,
    skyboxRadius: 140,
    sceneRotation: 0
};

let camera, scene, renderer, envMap, skybox;

init().then(render);    //  async函数内部return语句返回的值，会成为then方法回调函数的参数。

async function init() {

    //todo  async函数 https://es6.ruanyifeng.com/#docs/async

    camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.set(- 20, 7, 20);
    camera.lookAt(0, 4, 0);

    scene = new THREE.Scene();

    const hdrLoader = new RGBELoader();
    envMap = await hdrLoader.loadAsync('/textures/skidpan_2k.hdr');

    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.needsUpdate = true;
    skybox = new GroundProjectedSkybox(envMap);
    skybox.scale.setScalar(100);
    scene.add(skybox);
    scene.environment = envMap;

    /*  Draco 是一种库，用于压缩和解压缩 3D 几何网格（geometric mesh）和点云（point cloud）。
        换句话说，它显著缩小了 3D 图形文件的大小，同时对 3D 图形的观看者来说又根本不严重影响视
        觉效果。它还旨在改善 3D 图形的压缩和传输。  */
    //! blender导出glb勾选压缩后必须使用 DRACOLoader() 才能加载，未压缩的文件也可以用其加载
    const dracoLoader = new DRACOLoader();
    //todo  这里必须设置DRACOLoader的依赖的加载路径
    dracoLoader.setDecoderPath('../../../node_modules/three/examples/jsm/libs/draco/gltf/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const shadow = new THREE.TextureLoader().load('/textures/ferrari_ao.png');

    loader.load('/models/gltf/ferrari.glb', function (gltf) {

        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000, metalness: 1.0, roughness: 0.8,
            clearcoat: 1.0, clearcoatRoughness: 0.15
        });

        const detailsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff, metalness: 1.0, roughness: 0.5
        });

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
        });

        const carModel = gltf.scene.children[0];
        carModel.scale.multiplyScalar(4);
        carModel.rotation.y = Math.PI;

        //todo  通过名称设置材质
        carModel.getObjectByName('body').material = bodyMaterial;
        carModel.getObjectByName('rim_fl').material = detailsMaterial;
        carModel.getObjectByName('rim_fr').material = detailsMaterial;
        carModel.getObjectByName('rim_rr').material = detailsMaterial;
        carModel.getObjectByName('rim_rl').material = detailsMaterial;
        carModel.getObjectByName('trim').material = detailsMaterial;
        carModel.getObjectByName('glass').material = glassMaterial;

        // shadowPlane
        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
            new THREE.MeshBasicMaterial({
                map: shadow,
                blending: THREE.MultiplyBlending,
                toneMapped: false,
                transparent: true
            })
        );
        shadowPlane.rotation.x = - Math.PI / 2;
        /*  Object3D.renderOrder : Number
            这个值将使得scene graph（场景图）中默认的的渲染顺序被覆盖， 使不透明对象和透明对象保持独立顺序。
            渲染顺序是由低到高来排序的，默认值为0。  */
        shadowPlane.renderOrder = 2;
        carModel.add(shadowPlane);
        scene.add(carModel);

        render();
    });

    //  renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    //  controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.target.set(0, 2, 0);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(90);
    controls.maxDistance = 80;
    controls.minDistance = 20;
    controls.enablePan = false;
    controls.update();
    console.log(controls);

    //  gui
    const gui = new GUI();
    gui.add(params, 'skyboxHeight', 5, 50, 0.1).name('Skybox height').onChange(render);
    gui.add(params, 'skyboxRadius', 0, 1000, 0.1).name('Skybox radius').onChange(render);
    gui.add(params, 'sceneRotation', 0, 360, 1).name('Scene rotation').onChange(render);

    //  DOM
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);

}

//  WindowResize
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

//  render
function render() {
    renderer.render(scene, camera);
    skybox.radius = params.skyboxRadius;
    skybox.height = params.skyboxHeight;

    //! 通过旋转场景来改变车头朝向，以匹配HDR（因为没办法直接旋转HDR）
    scene.rotation.y=(2*Math.PI*params.sceneRotation)/360;
}