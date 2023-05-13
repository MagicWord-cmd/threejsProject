import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


/* 001  声明基础对象 */
let camera, scene, mesh, controls;



/* 002  定义一个可供gui控制的对象 */
let paramsObj = {
    amount: 10,       //!行列数，存入amount属性，以便gui调用
};
let colered;
let count;


/* 003  声明全局变量 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(1, 1);
const color = new THREE.Color();
const white = new THREE.Color().setHex(0xffffff);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const stats = new Stats();


/* 004  声明函数 */
init();
animate();


/* 005  初始化函数  在gui修改时用来初始化计数板/场景/相机/实例网格体/实例矩阵/颜色清零 */
function init() {

    colered = 0;

    count = Math.pow(paramsObj.amount, 3);  //!3次方运算，用于计算实例网格体的总数量

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

    //!根据物体大小设置相机的位置，使物体总是以适当的比例被渲染
    camera.position.set(paramsObj.amount, paramsObj.amount, paramsObj.amount);

    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();

    const light = new THREE.HemisphereLight(0xffffff, 0x888888);

    light.position.set(0, 1, 0);

    scene.add(light);

    const geometry = new THREE.IcosahedronGeometry(0.5, 3);

    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    mesh = new THREE.InstancedMesh(geometry, material, count);//!实例化创建网格体

    let i = 0;  //!用于instanceMesh的索引

    const offset = (paramsObj.amount - 1) / 2;//!通过数学运算使小球分布对称的分布到原点周围

    const matrix = new THREE.Matrix4();//!四维转换矩阵

    //!循环嵌套设置网格位置/矩阵/颜色
    for (let x = 0; x < paramsObj.amount; x++) {

        for (let y = 0; y < paramsObj.amount; y++) {

            for (let z = 0; z < paramsObj.amount; z++) {

                matrix.setPosition(offset - x, offset - y, offset - z);

                mesh.setMatrixAt(i, matrix);

                mesh.setColorAt(i, white);  //!设置成white,防止二次生产时初始化颜色不可控

                i++;

            }

        }

    }

    scene.add(mesh);

    //!初始化计数板
    document.querySelector('div.status').innerHTML = colered + '/' + count;

    //!轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;  //!启用了惯性阻尼
    controls.enableZoom = false;    //!禁用了缩放
    controls.enablePan = false;     //!禁用了鼠标平移
}



/* 006  视窗尺寸的自适应变化函数 */
function onWindowResize() {

    //!重设相机宽高比
    camera.aspect = window.innerWidth / window.innerHeight;

    //!更新相机矩阵
    camera.updateProjectionMatrix();

    //!重设渲染尺寸
    renderer.setSize(window.innerWidth, window.innerHeight);

}


/* 007  生产鼠标在屏幕上的位置函数 */
function onMouseMove(event) {

    event.preventDefault();

    //!以画布中心位原点的坐标轴
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

}



/* 008  渲染函数 */
function render() {

    renderer.render(scene, camera);

}


/* 009  渲染器输出到浏览器相关 */
document.body.appendChild(renderer.domElement);

//!如果您没有此标记,则innerWidth和innerHeight值将大于您的设备需求,
//!从而创建更大的帧缓冲区,这会降低您的帧速率.
renderer.setPixelRatio(window.devicePixelRatio);

//!渲染尺寸=视窗尺寸
renderer.setSize(window.innerWidth, window.innerHeight);
// console.log('window.innerWidth',window.innerWidth);
// console.log('window.innerHeight',window.innerHeight);
//!性能监视器控件
document.body.appendChild(stats.dom);
// console.log('stats', stats);

//!浏览器提供的视窗尺寸重设（下文用于视窗尺寸的自适应变化）
window.addEventListener('resize', onWindowResize);
//!浏览器提供的功能鼠标侦听（下文中用于生产鼠标在屏幕上的位置）
document.addEventListener('mousemove', onMouseMove);



/* 009  循环动画函数 */
function animate() {

    //!请求动画帧，默认每秒执行60次，受设备影响
    requestAnimationFrame(animate);

    //!更新轨道控制器
    controls.update();

    //!从摄像机向鼠标所在坐标点（近裁切面上的点）创建射线，射线透过近裁切面指向3D场景（就这么理解）
    raycaster.setFromCamera(mouse, camera);

    //!检测与射线有交集的物体并返回一个数组
    const intersection = raycaster.intersectObject(mesh);

    //!检测到物体进行判断
    if (intersection.length > 0) {

        //!获取射线检测到的第一个实例网格体的ID
        const instanceId = intersection[0].instanceId;

        //!获取每次检测到的第一个物体的颜色
        mesh.getColorAt(instanceId, color);

        //!与white进行比对，是白色则更改其颜色
        if (color.equals(white)) {

            mesh.setColorAt(instanceId, color.setHex(Math.random() * 0xffffff));
            //!颜色更改后需要执行更新操作才生效
            mesh.instanceColor.needsUpdate = true;

            colered++;
        }


        document.querySelector('div.status').innerHTML = colered + '/' + count;

    }

    render();   //!调用渲染函数

    stats.update(); //!更新性能监视器

}

/* 009  GUI */
const gui = new GUI();
gui
    .add(paramsObj, 'amount', 0, 20, 1)    //!gui滑块的设置方法

    .name("行列数")               //名称

    .onChange((value) => {      //!值变化时的函数

        //console.log("值正在被修改为", value);   //鼠标拖动未抬起时每次返回一个值

        paramsObj.amount = value;    //返回的value值设置为mesh01的材质颜色

        //console.log(paramsObj.amount, 'paramsObj.amount');


        //!gui修改参数时初始化场景
        init();

    });






