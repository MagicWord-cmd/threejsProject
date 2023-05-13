import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//!引入八叉树 Octree
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

//!引入胶囊体Capsule
import { Capsule } from 'three/addons/math/Capsule.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


let renderer = new THREE.WebGLRenderer({ antialias: true });

let camera = new THREE.PerspectiveCamera(

	70,

	window.innerWidth / window.innerHeight,

	0.1,

	1000

);
//!为摄像机设置父级，以实现摄像机绕焦点旋转
const cameraControls = new THREE.Group();
cameraControls.add(camera);
camera.position.set(0, 1, 3);


let scene = new THREE.Scene();
let stats = new Stats();


//!键盘状态的结构体
let keyStates = {};

//!重力
let GRAVITY = 30;

//!world
const worldOctree = new Octree();


//clock
let clock = new THREE.Clock();

//playerCollider
const playerCollider = {

	//胶囊碰撞体
	geometry: new Capsule(
		//start
		new THREE.Vector3(0, 1.35, 0),
		//end
		new THREE.Vector3(0, 2, 0),
		//radius
		0.35
	),
	//速度
	velocity: new THREE.Vector3(),
	//面向
	direction: new THREE.Vector3(),
	//是否接触地面
	onFloor: false
}


/*    capsuleHelper    */
//!THREE.CapsuleGeometry和胶囊体Capsule的尺寸算法不同
const geometry = new THREE.CapsuleGeometry(0.35, 1.35, 1, 5);
const material = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true
});
let capsuleHelper = new THREE.Mesh(geometry, material);
//!角色组
const characterGroup = new THREE.Group();
characterGroup.add(capsuleHelper);
capsuleHelper.position.set(0,1,0);


init();
loadModel();
loadCharacter();

animate();



/*	 loadModel	*/
function loadModel() {

	const loader = new GLTFLoader().setPath('./models/gltf/');

	loader.load(

		'collision-world.glb',

		gltf => {	//!所有的匿名函数都可以简写成箭头函数

			scene.add(gltf.scene);

			gltf.scene.traverse(child => {

				//console.log(child);

				if (child.isMesh) {

					//!开启阴影
					child.castShadow = true;
					child.receiveShadow = true;

				}


				//!场景加载完成创建八叉树Octree
				worldOctree.fromGraphNode(gltf.scene);
				const octreeHelper = new OctreeHelper(worldOctree);
				octreeHelper.visible = false;
				scene.add(octreeHelper);

			});

		}

	)

}


// 创建文字精灵
let getTextCanvas = function (text) {
	let option = {
		fontFamily: 'Arial',
		fontSize: 30,
		fontWeight: 'bold',
		color: '#ffffff',
		actualFontSize: 0.08,
	},
		canvas, context, textWidth, texture, materialObj, spriteObj;
	canvas = document.createElement('canvas');
	context = canvas.getContext('2d');
	// 先设置字体大小后获取文本宽度
	context.font = option.fontWeight + ' ' + option.fontSize + 'px ' + option.fontFamily;
	textWidth = context.measureText(text).width;

	canvas.width = textWidth;
	canvas.height = option.fontSize;

	context.textAlign = "center";
	context.textBaseline = "middle";
	context.fillStyle = option.color;
	context.font = option.fontWeight + ' ' + option.fontSize + 'px ' + option.fontFamily;
	context.fillText(text, textWidth / 2, option.fontSize / 1.8);

	texture = new THREE.CanvasTexture(canvas);
	materialObj = new THREE.SpriteMaterial({
		map: texture
	});
	spriteObj = new THREE.Sprite(materialObj);
	spriteObj.scale.set(textWidth / option.fontSize * option.actualFontSize, option.actualFontSize, option
		.actualFontSize);

	return spriteObj;
}


function loadCharacter() {

	const loader = new GLTFLoader().setPath('./models/gltf/');

	loader.load(

		'Character_Grandma.glb',

		gltf => {	//!所有的匿名函数都可以简写成箭头函数

			characterGroup.add(gltf.scene.children[0]);

			scene.add(cameraControls);
			//console.log(cameraControls);


			characterGroup.traverse(child => {

				//console.log(child);

				if (child.isMesh) {

					//!开启阴影
					child.castShadow = true;
					child.receiveShadow = true;

				}

			});

			//!设置贴图的色彩空间以得到正确的PBR物理材质效果
			characterGroup.children[1].children[0].material.map.encoding = THREE.sRGBEncoding;
			characterGroup.children[1].children[0].material.metalnessMap.encoding = THREE.LinearEncoding;
			characterGroup.children[1].children[0].material.roughnessMap.encoding = THREE.LinearEncoding;
			characterGroup.children[1].children[0].material.normalMap.encoding = THREE.LinearEncoding;
			characterGroup.children[1].children[0].material.normalScale = new THREE.Vector2(1, -1);    //!法线强度	



			// 主人物名字
			let spriteText = getTextCanvas("Character_Grandma");
			characterGroup.add(spriteText);
			spriteText.position.set(0, 2.1, 0);

			const bbox = new THREE.Box3().setFromObject(characterGroup.children[0]);

			// 获取包围盒的中心点
			const center = new THREE.Vector3();
			bbox.getCenter(center);

			// 将物体移动到中心点
			characterGroup.position.sub(center);

			// 组合对象添加到场景中
			scene.add(characterGroup);
			scene.add(cameraControls);
			// mixer = new THREE.AnimationMixer(characterGroup);
			// mixerArray.push(mixer)
			// activeAction = mixer.clipAction(characterAnimations[1]);
			// activeAction.play();

			characterGroup.traverse(child => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;

					if (child.material.map) {
						child.material.map.anisotropy = 4;
					}
				}
			});

		}

	)

}





/*	 init	*/
function init() {




	//renderer

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.VSMShadowMap;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.toneMaping = THREE.ACESFilmicToneMapping;
	document.body.appendChild(renderer.domElement);


	//camera
	//!锁定翻滚角度，避免mousemove事件时画面倾斜
	cameraControls.rotation.order = 'YXZ';


	//scene

	scene.background = new THREE.Color(0x6699aa);
	scene.add(new THREE.AxesHelper(10));


	//stats

	document.body.appendChild(stats.dom);

	/*    controls    */

	// controls.enableDamping = true;//设置控制器阻尼惯性，需要在渲染循环中更新controls
	// controls.target.set(0, 0, 0);//若场景中有轨道控制器，那么它的目标点要与相机lookAt参数保持一致




	//hemisphereLight
	const hemisphereLight = new THREE.HemisphereLight(	//!半球光（不能投射阴影）
		0xffffff,	//天空
		0x002244,	//地面
		0.75			//强度
	);
	hemisphereLight.position.set(2, 1, 1);
	scene.add(hemisphereLight);


	//directionalLight
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

	directionalLight.position.set(-15, 25, 15);

	directionalLight.castShadow = true;

	directionalLight.shadow.camera.near = 0.01;
	directionalLight.shadow.camera.far = 50;
	directionalLight.shadow.camera.right = 30;
	directionalLight.shadow.camera.left = - 30;
	directionalLight.shadow.camera.top = 30;
	directionalLight.shadow.camera.bottom = - 30;

	directionalLight.shadow.radius = 2;
	directionalLight.shadow.bias = - 0.0004;
	directionalLight.shadow.mapSize.set(4096, 4096);//!设置阴影贴图分辨率

	scene.add(directionalLight);

	// scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

	//窗口监听事件
	window.addEventListener('resize', onWindowResize);




	/*    鼠标事件    */
	//mousedown <=> Esc键，对鼠标控制权的切换
	document.addEventListener('mousedown', event => {

		document.body.requestPointerLock();

	});


	//mousemove事件,实现视图控制
	document.addEventListener('mousemove', event => {

		//需要先判断鼠标是否可用
		if (document.pointerLockElement === document.body) {

			//鼠标在视窗横向（X）移动时，影响playerCollider的偏航角度（cameraControls.rotation.y）
			cameraControls.rotation.y -= event.movementX / 500;

			//鼠标在视窗纵向（Y）移动时，影响playerCollider的俯仰角度（cameraControls.rotation.x）
			cameraControls.rotation.x -= event.movementY / 500;

		}

	});



	//!键盘key，实现角色移动跳跃控制
	document.addEventListener('keydown', event => {

		//键盘状态改变的事件判断
		keyStates[event.code] = true;

	});

	document.addEventListener('keyup', event => {

		//键盘状态改变的事件判断
		keyStates[event.code] = false;

	});

}


/*	  onWindowResize 	*/
function onWindowResize() {

	//重设渲染画布canvas输出尺寸
	renderer.setSize(window.innerWidth, window.innerHeight);

	//只设置画布尺寸，不设置相机宽高比并更新，会造成画面拉伸
	//重设相机宽高比aspect为窗口宽高比
	camera.aspect = window.innerWidth / window.innerHeight;

	//渲染器执行render方法时会读取相机对象的投影矩阵属性projectionMatrix
	//但为了节省资源并不会每帧读取一次
	//因此在相机的一些属性发生变化时需要更新相机对象的投影矩阵属性projectionMatrix
	camera.updateProjectionMatrix();

}


/*	  animate 	*/
function animate() {

	//!需要根据键盘按下的时间来计算处理的程度，需要一个时间的变量
	const deltaTime = Math.min(0.05, clock.getDelta());//!为避免为0，指定最小值

	handleControls(deltaTime);//!调用键盘控制相关

	updatePlayer(deltaTime);//!角色被操控后需要更新Player

	renderer.render(scene, camera);

	requestAnimationFrame(animate);

	stats.update();

	// controls.update();

}

function handleControls(deltaTime) {


	//!每次时间变化后速度的改变情况
	//!判断playerCollider是接触地面，使接地速度大于滞空速度
	const speedDelta = deltaTime * (playerCollider.onFloor ? 20 : 8);


	/*  W（前进）  */
	if (keyStates['KeyW']) {

		//!前进的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getForwardVoctor().multiplyScalar(-speedDelta))

	}
	/*  S（后退）  */
	if (keyStates['KeyS']) {

		//!后退的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getForwardVoctor().multiplyScalar(speedDelta))

	}
	/*  A（左平移）  */
	if (keyStates['KeyA']) {

		//!左平移的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getSideVoctor().multiplyScalar(speedDelta))

	}
	/*  S（右平移）  */
	if (keyStates['KeyD']) {

		//!右平移的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getSideVoctor().multiplyScalar(-speedDelta))

	}
	/*  onFloor则跳跃可用，并设置角色跳跃速度    */
	if (playerCollider.onFloor) {


		if (keyStates['Space']) {

			playerCollider.velocity.y = 8;

		}
	}

}



//!获取playerCollider前进后退的方向
function getForwardVoctor() {

	//!获取相机朝向来设置玩家playerCollider的朝向
	cameraControls.getWorldDirection(playerCollider.direction);
	playerCollider.direction.y = 0;//!为避免通过相机获取的方向的y不为0，重设为0
	playerCollider.direction.normalize();//!重置playerCollider球半径为1

	return playerCollider.direction;

}


//!获取playerCollider左右平移的方向
function getSideVoctor() {

	//!获取相机朝向来设置玩家playerCollider的朝向
	cameraControls.getWorldDirection(playerCollider.direction);
	playerCollider.direction.y = 0;//!为避免通过相机获取的方向的y不为0，重设为0
	playerCollider.direction.normalize();//!重置playerCollider球半径为1
	//!向量叉乘求与其垂直的向量
	playerCollider.direction.cross(camera.up);
	return playerCollider.direction;
}




//!updatePlayer()函数
function updatePlayer(deltaTime) {


	//!设置一个阻力，停止按键后会停下来
	let damping = Math.exp(-4 * deltaTime) - 1;

	//!设置重力影响
	if (!playerCollider.onFloor) {

		//如不接地，则角色会有一个y方向的重力加速
		playerCollider.velocity.y -= GRAVITY * deltaTime;
		damping *= 0.1;	//!摩檫阻力降低
	}

	//!为playerCollider的速度添加阻力
	playerCollider.velocity.addScaledVector(playerCollider.velocity, damping);

	//!定义一个变量记录角色移动的距离
	const deltaPosition = playerCollider.velocity.clone().multiplyScalar(deltaTime);

	//!调用playerCollider的平移方法
	playerCollider.geometry.translate(deltaPosition);

	//!每次平移之后立刻做碰撞检测
	playerColliderCollisions();

	//!相机跟随playerCollider的平移
	cameraControls.position.set(
		playerCollider.geometry.end.x,
		playerCollider.geometry.end.y + 1,
		playerCollider.geometry.end.z
	);

	//!characterGroup跟随playerCollider 的平移
	characterGroup.position.set(
		playerCollider.geometry.end.x,
		playerCollider.geometry.end.y - 1,
		playerCollider.geometry.end.z
	);
	//!characterGroup跟随cameraControls的y轴旋转，以调整面向
	characterGroup.rotation.set(0, Math.PI + cameraControls.rotation.y, 0);
	
	


}


//!碰撞检测函数
function playerColliderCollisions() {

	//!未检测到碰撞返回false,有碰撞返回collisionResult
	const collisionResult = worldOctree.capsuleIntersect(playerCollider.geometry);

	if (collisionResult) {
		//!如果返回collisionResult，说明有碰撞
		//!判断碰撞法向量的y方向结果是否为正，检测是否有垂直分量的碰撞
		//!collisionResult.normal.y > 0为true，并设置playerCollider.onFloor为true
		playerCollider.onFloor = collisionResult.normal.y > 0;

		if (!playerCollider.onFloor) {
			//!如果playerColliderp.onFloor未被设置为true,playerCollider滞空
			playerCollider.velocity.addScaledVector(
				collisionResult.normal,
				//!点乘，结果是一个向量在另一个向量方向上投影的长度，是一个标量。
				-collisionResult.normal.dot(playerCollider.velocity)
			);
		}
		playerCollider.geometry.translate(collisionResult.normal.multiplyScalar(collisionResult.depth));
	} else {

		//!如果碰撞检测直接返回flase，无碰撞，playerCollider滞空
		playerCollider.onFloor = false;

	}

}