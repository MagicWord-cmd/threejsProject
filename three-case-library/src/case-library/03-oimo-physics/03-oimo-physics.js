import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OimoPhysics } from './OimoPhysics';
import Stats from 'three/addons/libs/stats.module.js';

/* 001  声明基础对象 */
let camera, scene, renderer, stats;
let boxes, spheres;


/* 003  声明全局变量 */
//!在init函数外声明下面的变量可以避免报错
let physics = await OimoPhysics();
let position = new THREE.Vector3();
let index, count;


/* 004  声明函数 */
init();
//!在async异步函数中定义animate()函数可避免报错
//animate();

//!async异步函数
async function init() {

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(- 1, 1.5, 2);
    camera.lookAt(0, 0.5, 0);

    scene = new THREE.Scene();
    //!设置场景背景颜色
    scene.background = new THREE.Color(0x666666);

    const hemiLight = new THREE.HemisphereLight();
    hemiLight.intensity = 0.35;
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight();
    dirLight.position.set(5, 5, 5);
    //!平行光开启灯光阴影
    dirLight.castShadow = true;
    //!
    dirLight.shadow.camera.zoom = 2;

    scene.add(dirLight);

    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 10),
        //!此材质可以接收阴影，但在其他方面完全透明
        new THREE.ShadowMaterial({ color: 0x111111 })
    );
    floor.position.y = - 2.5;
    floor.receiveShadow = true;
    scene.add(floor);
    //!添加floor到物理系统
    physics.addMesh(floor);



    const material = new THREE.MeshLambertMaterial();

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();


    const geometryBox = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    boxes = new THREE.InstancedMesh(geometryBox, material, 100);

    //!定义用于优化目的的数据存储的预期使用模式。
    //!对应WebGLRenderingContext.bufferData（）的用法参数。默认为StaticDrawUsage。
    boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame

    boxes.castShadow = true;
    boxes.receiveShadow = true;
    scene.add(boxes);

    for (let i = 0; i < boxes.count; i++) {

        matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
        boxes.setMatrixAt(i, matrix);
        boxes.setColorAt(i, color.setHex(0xffffff * Math.random()));

    }

    //!
    physics.addMesh(boxes, 1);


    // Spheres

    const geometrySphere = new THREE.IcosahedronGeometry(0.075, 3);
    spheres = new THREE.InstancedMesh(geometrySphere, material, 100);

    //!
    spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame

    spheres.castShadow = true;
    spheres.receiveShadow = true;
    scene.add(spheres);

    for (let i = 0; i < spheres.count; i++) {

        matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
        spheres.setMatrixAt(i, matrix);
        spheres.setColorAt(i, color.setHex(0xffffff * Math.random()));

    }

    physics.addMesh(spheres, 1);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    //

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.y = 0.5;
    controls.update();


    count = boxes.count;//!animation()函数中直接调用boxes.count会报错；因此赋值给一个变量
    animate();  //!在这里声明可避免报错

}


/* 006  视窗尺寸的自适应变化函数 */

//!浏览器提供的视窗尺寸重设（下文用于视窗尺寸的自适应变化）
window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    //!重设相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight;

    //!更新相机矩阵
    camera.updateProjectionMatrix();

    //!重设渲染尺寸
    renderer.setSize(window.innerWidth, window.innerHeight);

}


function animate() {

    requestAnimationFrame(animate);

    let randomNum = Math.random() + 1;


    //

    index = Math.floor(Math.random() * count);

    position.set(0, randomNum, 0);
    physics.setMeshPosition(spheres, position, index);

    renderer.render(scene, camera);

    stats.update();

}
