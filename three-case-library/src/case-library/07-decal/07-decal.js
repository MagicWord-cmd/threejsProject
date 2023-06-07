import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


//todo 引入DecalGeometry
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';


let renderer, camera, stats, controls;

let scene = new THREE.Scene();

const gui = new GUI();

let model;

//  Decal
let decalMaterial;
let decalPosition = new THREE.Vector3();
let decalOrientation = new THREE.Euler();
let decalSize = new THREE.Vector3(2, 1, 1);



//todo声明变量参数集，用于设置BLOOM的GUI参数
const params = {

    bloomStrength: 0.4,

    bloomThreshold: 1,

    bloomRadius: 0.85,

    emissiveMultiply: 1

};



//gltfLoader
const gltfLoader = new GLTFLoader().setPath('/src/assets/models/gltf/');
gltfLoader.load('cxswzt2.glb',

    //!所有的匿名函数都可以写成箭头函数（onLoad完成开始执行）
    gltf => {

        // console.log(gltf.scene);
        model = gltf.scene;
        scene.add(model);

        model.traverse(function (object) {

            if (object.isMesh) {
                //!遍历gltf,为每个物体设置贴图的色彩空间以得到正确的PBR物理材质效果
                //map
                if (object.material.map) {
                    object.material.map.colorSpace = THREE.SRGBColorSpace;
                }
                //emissiveMap
                if (object.material.emissive || object.material.emissiveMap) {

                    object.material.emissiveIntensity = params.emissiveMultiply;
                    if (object.material.emissiveMap) {
                        object.material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                    }
                }
                //lightMap
                if (object.material.lightMap) {
                    object.material.lightMap.colorSpace = THREE.SRGBColorSpace;
                }
                //aoMap
                if (object.material.aoMap) {
                    object.material.aoMap.colorSpace = THREE.NoColorSpace;
                    object.material.aoMapIntensity = 0.65;        //!ao强度
                }
                //metalnessMap
                if (object.material.metalnessMap) {
                    object.material.metalnessMap.colorSpace = THREE.NoColorSpace;
                }
                //roughnessMap
                if (object.material.roughnessMap) {
                    object.material.roughnessMap.colorSpace = THREE.NoColorSpace;
                }
                //normalMap
                if (object.material.normalMap) {
                    object.material.normalMap.colorSpace = THREE.NoColorSpace;
                    object.material.normalScale = new THREE.Vector2(1, -1);    //!法线强度
                }

            }

        });




        //!Box3,三维包围盒，用于获取物体的最外围尺寸并取出最大值
        let bbox = new THREE.Box3().setFromObject(model);
        let vector3 = new THREE.Vector3;
        let box3Center = new THREE.Vector3;

        bbox.getSize(vector3);
        // console.log('vector3', vector3);
        bbox.getCenter(box3Center);
        // console.log('box3Center', box3Center);


        //!获取包围盒尺寸的最大值
        let minBox3Size = (Math.min(vector3.x, vector3.y, vector3.z)).toFixed(2);

        //!获取包围盒尺寸的最大值
        let maxBox3Size = (Math.max(vector3.x, vector3.y, vector3.z)).toFixed(2);



        //!闭包函数，向外传输局部变量
        let closure = function () {

            return {

                'minBox3Size': minBox3Size,
                'maxBox3Size': maxBox3Size,
                'box3Center': box3Center,
                'vector3': vector3,
            };

        }

        //!闭包向函数init()传值
        init(closure);

    });


//init
function init(closured) {

    //!声明对象来接收传入的值
    let obj = closured();
    // console.log(obj);

    //camera
    //!给场景添加透视相机,通过包围盒尺寸动态设置相机位置和视锥体以适配不同尺寸的模型
    camera = new THREE.PerspectiveCamera(

        60,

        window.innerWidth / window.innerHeight,

        obj.minBox3Size / 100,

        obj.maxBox3Size * 10

    );

    //!动态设置相机位置
    camera.position.set(-obj.maxBox3Size, obj.vector3.y / 2, obj.maxBox3Size);

    //!动态设置相机目标点为为外包盒中心，场景中有轨道控制器的话也需要同步修改
    camera.lookAt(obj.box3Center.x, obj.box3Center.y, obj.box3Center.z);




    //!动态设置坐标辅助控件大小
    scene.add(new THREE.AxesHelper(obj.maxBox3Size));



    //stats
    stats = new Stats();
    document.body.appendChild(stats.dom);



    //!HDR
    const rgbeLoader = new RGBELoader();    //实例化一个HDR加载器

    rgbeLoader.loadAsync("../../assets/textures/ninomaru_teien_2k.hdr").then((hdrTexture) => {

        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

        //!设置HDR的色彩空间
        hdrTexture.colorSpace = THREE.NoColorSpace;

        scene.background = new THREE.Color(0x000606);

        //!该属性不能够覆盖已存在的、已分配给MeshStandardMaterial.envMap的贴图
        scene.environment = hdrTexture;

    });


    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    //!toneMapping能够塑造更真实的物理效果
    renderer.toneMapping = THREE.CineonToneMapping;

    //!设置toneMapping曝光度
    renderer.toneMappingExposure = 1;

    document.body.appendChild(renderer.domElement);


    //controls
    //创建一个轨道控制器控件
    controls = new OrbitControls(camera, renderer.domElement);

    //设置控制器阻尼惯性，需要在渲染循环中更新controls
    controls.enableDamping = true;

    //!若场景中有轨道控制器，那么它的目标点要与相机lookAt参数保持一致
    controls.target.set(

        obj.box3Center.x,

        obj.box3Center.y,

        obj.box3Center.z

    );


    //!动态设置controls的可控范围
    controls.maxPolarAngle = Math.PI * 2;
    controls.minDistance = obj.maxBox3Size / 5;
    controls.maxDistance = obj.maxBox3Size * 5;



    //todo 添加后期bloom光晕
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);


    //todo  raycaster
    let recayster = new THREE.Raycaster();
    const mousePosition = new THREE.Vector2();
    let intersects = [];
    let firstIntersectObject, firstIntersectPoint, firstIntersectNormal


    let mouseHelper, mouseHelperLine;





    //onWindowResize
    //onresize事件会在窗口大小被调整时调用，用以实现窗口的自适应变化
    window.onresize = function () {

        //重设渲染画布canvas输出尺寸
        renderer.setSize(window.innerWidth, window.innerHeight);

        //只设置画布尺寸，不设置相机宽高比并更新，会造成画面拉伸
        //重设相机宽高比aspect为窗口宽高比
        camera.aspect = window.innerWidth / window.innerHeight;

        //渲染器执行render方法时会读取相机对象的投影矩阵属性projectionMatrix
        //但为了节省资源并不会每帧读取一次
        //因此在相机的一些属性发生变化时需要更新相机对象的投影矩阵属性projectionMatrix
        camera.updateProjectionMatrix();

        //todo 重设后期渲染尺寸
        composer.setSize(window.innerWidth, window.innerHeight);
    };


    //todo  窗口侦听鼠标移动
    window.onpointermove = function (event) {

        if (event.isPrimary) {
            handleIntersection(event.clientX, event.clientY);
        }

    };

    //todo  窗口侦听鼠标点击
    window.onpointerdown = function (event) {
        //  判断射线检测是否为空，不为空执行
        if (intersects.length > 0) {
            handleIntersection();
            shootDecal();
        }

    };




    //todo  初始化mouseHelper和mouseHelperLine
    function initIndicator() {

        //  mouseHelperLine
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setFromPoints(
            [
                new THREE.Vector3(),
                new THREE.Vector3(),
            ]
        );
        mouseHelperLine = new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0xff0000 })
        );
        scene.add(mouseHelperLine);

        //  mouseHelper
        mouseHelper = new THREE.Mesh(
            new THREE.BoxGeometry(
                obj.maxBox3Size / 100,
                obj.maxBox3Size / 100,
                obj.maxBox3Size / 20,
            ),
            new THREE.MeshNormalMaterial()
        );
        scene.add(mouseHelper);
    };

    initIndicator();

    //todo  根据鼠标检测到的模型位置和法线重新绘制mouseHelperLine
    function handleIntersection(x, y) {
        //  判断模型是否已加载，以防止报错
        if (model === undefined) return;
        //  将鼠标位置转换成以屏幕中心为坐标原点的算法
        mousePosition.x = (x / window.innerWidth) * 2 - 1;
        mousePosition.y = -(y / window.innerHeight) * 2 + 1;
        //  recayster
        recayster.setFromCamera(mousePosition, camera);

        intersects.length = 0;
        recayster.intersectObject(model, true, intersects);

        // 如果射线检测结果不为空，则重设mouseHelper和mouseHelperLine的位置和朝向
        if (intersects.length > 0) {

            firstIntersectObject = intersects[0];
            firstIntersectPoint = firstIntersectObject.point;
            firstIntersectNormal = firstIntersectObject.face.normal.clone();
            firstIntersectNormal.transformDirection(model.matrixWorld);
            firstIntersectNormal.add(firstIntersectPoint);

            const linePosition = mouseHelperLine.geometry.attributes.position;
            linePosition.setXYZ(0, firstIntersectPoint.x, firstIntersectPoint.y, firstIntersectPoint.z);
            linePosition.setXYZ(1, firstIntersectNormal.x, firstIntersectNormal.y, firstIntersectNormal.z);
            linePosition.needsUpdate = true;

            mouseHelper.position.copy(firstIntersectPoint);
            mouseHelper.lookAt(firstIntersectNormal);

            // 重设decalOrientation
            decalOrientation = mouseHelper.rotation;
            decalPosition = mouseHelper.position;
        }
    };


    //todo   initDecal()
    function initDecal() {
        const decalDiffuse = new THREE.TextureLoader().load(
            "../../assets/textures/decalTest.jpg"
        );
        // const decalNormal = new THREE.TextureLoader().load(
        //     "../../assets/textures/decal-normal.jpg"
        // );
        decalMaterial = new THREE.MeshBasicMaterial({
            map: decalDiffuse,
            // normalMap: decalNormal,
            // normalScale: new THREE.Vector2(1, 1),
            // transparent: true,
            // depthTest: true,
            // depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            wireframe: false
        });

    };
    initDecal();


    //todo   shootDecal()
    function shootDecal() {
        console.log('firstIntersectObject', firstIntersectObject);
        const shootedMaterial = decalMaterial.clone();
        // shootedMaterial.color.setHex(Math.random() * 0xffffff);
        const decalMesh = new THREE.Mesh(
            new DecalGeometry(
                firstIntersectObject.object,
                decalPosition,
                decalOrientation,
                decalSize
            ),
            shootedMaterial
        );
        scene.add(decalMesh);
        console.log('decalMesh', decalMesh);
    };



    //animate
    function animate() {

        renderer.render(scene, camera);

        requestAnimationFrame(animate);

        stats.update();

        controls.update();

        //更新后期渲染
        composer.render();

    };

    animate();


    //渲染器toneMapping模式gui
    gui
        .add(renderer, "toneMapping")



    //场景曝光度gui
    gui
        .add(
            renderer,                //对象
            "toneMappingExposure",   //对象属性
            0, 5, 0.1               //最小值，最大值，滑杆刻度
        )


    //todo bloom控制器gui
    gui.add(params, 'bloomThreshold', 0.0, 1.0, 0.001).onChange(function (value) {

        bloomPass.threshold = Number(value);

    });

    gui.add(params, 'bloomStrength', 0.0, 5, 0.001).onChange(function (value) {

        bloomPass.strength = Number(value);

    });

    gui.add(params, 'bloomRadius', 0, 5, 0.001).onChange(function (value) {

        bloomPass.radius = Number(value);

    });

    //todo 为有灯光的材质添加灯光强度倍增GUI
    gui.add(params, 'emissiveMultiply', 0, 50, 0.001).onChange(function (value) {

        model.traverse(function (object) {

            if (object.isMesh) {
                //emissiveMap
                if (object.material.emissive || object.material.emissiveMap) {
                    object.material.emissiveIntensity = Number(value);
                }
            }
        });
    });
}

// scene.background  GUI
const params2 = {
    color: "#000606)",
};
gui
    .addColor(params2, "color")
    .name("background")
    .onChange((value) => { scene.background.set(value); });

