import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';

import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';



let renderer, camera, stats, controls;

let scene = new THREE.Scene();

const gui = new GUI();

let model;


//todo声明变量参数集，用于设置BLOOM的GUI参数
const params = {

    bloomStrength: 0.4,

    bloomThreshold: 1,

    bloomRadius: 0.85,

    emissiveMultiply: 1

};



//gltfLoader
const gltfLoader = new GLTFLoader().setPath('/models/gltf/');
gltfLoader.load('lightMapAutoConfigure.glb',

    //!所有的匿名函数都可以写成箭头函数（onLoad完成开始执行）
    gltf => {

        console.log(gltf.scene);
        model = gltf.scene;
        scene.add(model);

        model.traverse(function (object) {

            if (object.isMesh) {
                //!遍历gltf,为每个物体设置贴图的色彩空间以得到正确的PBR物理材质效果
                //map
                if (object.material.map) {
                    object.material.map.colorSpace = THREE.SRGBColorSpace;
                }

                //lightMap
                if (object.material.clearcoatMap) {
                    object.material.clearcoatMap.colorSpace = THREE.SRGBColorSpace;

                    //todo 拷贝emissiveMap赋值于lightMap，并设置lightMapIntensity和envMapIntensity的值。
                    object.material.lightMap = object.material.clearcoatMap.clone();
                    object.material.clearcoatMap = null;
                    object.material.clearcoatRoughness = 1;
                    object.material.lightMapIntensity = 3;
                    object.material.envMapIntensity = 0.075;
                }

                //emissiveMap
                if (object.material.emissiveMap) {
                    object.material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                }
                //aoMap
                if (object.material.aoMap) {
                    object.material.aoMap.colorSpace = THREE.NoColorSpace;
                    object.material.aoMapIntensity = 0.65;
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




        //todo Box3,三维包围盒，用于获取物体的最外围尺寸并取出最大值
        let box3 = new THREE.Box3();
        let vector3 = new THREE.Vector3;
        let box3Center = new THREE.Vector3;
        box3.expandByObject(gltf.scene);
        box3.getSize(vector3);
        box3.getCenter(box3Center);

        //todo 获取包围盒尺寸的最小值
        let minBox3Size = Math.max(vector3.x, vector3.y, vector3.z);


        //todo 获取包围盒尺寸的最大值
        let maxBox3Size = Math.min(vector3.x, vector3.y, vector3.z);;

        //todo 闭包函数，向外传输局部变量
        let closure = function () {
            return {

                'minBox3Size': minBox3Size,
                'maxBox3Size': maxBox3Size,
                'box3Center': box3Center,
                'vector3': vector3,
                'model': model
            };

        }
        init(closure);

    });


//init
function init(closured) {

    //todo 声明对象来接收传入的值
    let obj = closured();

    //camera
    //todo 通过包围盒尺寸动态设置相机位置和视锥体以适配不同尺寸的模型
    camera = new THREE.PerspectiveCamera(

        60,

        window.innerWidth / window.innerHeight,

        obj.minBox3Size / 100, obj.maxBox3Size * 10

    );

    //todo 动态设置相机位置
    camera.position.set(-obj.maxBox3Size, obj.vector3.y / 2, obj.maxBox3Size);

    //todo 动态设置相机目标点为为外包盒中心，场景中有轨道控制器的话也需要同步修改
    camera.lookAt(obj.box3Center.x, obj.box3Center.y, obj.box3Center.z);

    //todo 动态设置坐标辅助控件大小
    scene.add(new THREE.AxesHelper(obj.maxBox3Size));

    //stats
    stats = new Stats();
    document.body.appendChild(stats.dom);


    //HDR
    const rgbeLoader = new RGBELoader();

    rgbeLoader.loadAsync("/src/assets/textures/ninomaru_teien_2k.hdr").then((hdrTexture) => {

        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

        //todo 设置HDR的色彩空间
        hdrTexture.colorSpace = THREE.NoColorSpace;

        scene.background = new THREE.Color(0x000606);

        //!该属性不能够覆盖已存在的、已分配给MeshStandardMaterial.envMap的贴图
        scene.environment = hdrTexture;

    });


    //renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.colorSpace = THREE.SRGBColorSpace;

    //!toneMapping能够塑造更真实的物理效果
    renderer.toneMapping = THREE.LinearToneMapping;

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
    }


    //animate
    function animate() {

        renderer.render(scene, camera);

        requestAnimationFrame(animate);

        stats.update();

        controls.update();

        //更新后期渲染
        composer.render();

    }

    animate()


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

