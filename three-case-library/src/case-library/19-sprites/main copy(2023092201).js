import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/*    引入八叉树 Octree    */
import { Octree } from 'three/addons/math/Octree.js';
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';

/*    引入胶囊体Capsule    */
import { Capsule } from 'three/addons/math/Capsule.js';

/*    sprite要用的的引入    */
import { timerLocal, spritesheetUV, pointUV, vec2, texture, PointsNodeMaterial,SpriteNodeMaterial } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';


/*    scene/camera/stats    */
let renderer = new THREE.WebGLRenderer({ antialias: true });
let camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
//todo声明摄像机父级Group，以实现摄像机绕焦点旋转
const cameraControls = new THREE.Group();
cameraControls.add(camera);
camera.position.set(0, 0, 3);
let scene = new THREE.Scene();
let stats = new Stats();

/*    键盘状态的结构体    */
let keyStates = {};

/*    动画相关变量    */
let clock = new THREE.Clock();
let mixer, character, actions, animations, idleAction, walkAction,
	backWalkAction, runAction, backRunAction, leftWalkAction, rightWalkAction, leftRunAction,
	rightRunAction, jumpAction, fallingAction, landingAction;

/*   重力    */
let GRAVITY = 30;
/*   Octree    */
const worldOctree = new Octree();
/*   terrainModel    */
let terrainModel;

/*    playerCollider角色胶囊碰撞体    */
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
	//前向
	direction: new THREE.Vector3(),
	//是否接触地面
	onFloor: false
}

/*    声明speed变量，用于生成角色移动各方向的速度，便于动画动画控制    */
let speed = 0;
let forwardSpeed = 0;
let sideSpeed = 0;
let verticalVelocity = 0;

/*    自定义capsuleHelper    */
//todoTHREE.CapsuleGeometry和胶囊体Capsule的尺寸算法不同
const geometry = new THREE.CapsuleGeometry(0.35, 1.35, 1, 5);
const material = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true
});
let capsuleHelper = new THREE.Mesh(geometry, material);
capsuleHelper.visible = false;	//!设置显隐

/*	  角色组（包含capsuleHelper和头顶文字，不需要跟随相机旋转） 	*/
const characterGroup = new THREE.Group();
characterGroup.add(capsuleHelper);
capsuleHelper.position.set(0, 1, 0);

/*	 init	*/
function init() {

	/*	 renderer	*/
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.VSMShadowMap;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMaping = THREE.ACESFilmicToneMapping;
	document.body.appendChild(renderer.domElement);
	//! 设置当前屏幕像素比，以解决不同设备抗锯齿模糊程度不同的问题，此设置需要在添加到document之后
	renderer.setPixelRatio(window.devicePixelRatio);

	/*	  camera 	*/
	//todo锁定翻滚角度，避免mousemove事件时画面倾斜
	cameraControls.rotation.order = 'YXZ';

	/*	  scene 	*/
	scene.background = new THREE.Color(0x000000);
	// scene.add(new THREE.AxesHelper(10));

	/*    stats    */
	document.body.appendChild(stats.dom);

	/*    hemisphereLight    */
	const hemisphereLight = new THREE.HemisphereLight(	//半球光（不能投射阴影）
		0x333366,	//天空
		0x002244,	//地面
		0.75		//亮度
	);
	hemisphereLight.position.set(2, 1, 1);
	scene.add(hemisphereLight);

	/*	 directionalLight	*/
	const directionalLight = new THREE.DirectionalLight(0x333366, 0.75);
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
	//!设置阴影贴图分辨率
	directionalLight.shadow.mapSize.set(1024, 1024);
	scene.add(directionalLight);

	/*	 loadTerrain	*/
	const terrainLoader = new GLTFLoader().setPath('/models/gltf/');
	terrainLoader.load(
		'collision-world2.glb',
		terrain => {	//todo所有的匿名函数都可以简写成箭头函数
			terrainModel = terrain.scene;
			scene.add(terrain.scene);
			terrain.scene.traverse(child => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
				//场景加载完成创建八叉树Octree
				worldOctree.fromGraphNode(terrain.scene);
				const octreeHelper = new OctreeHelper(worldOctree);
				//!设置octreeHelper显隐
				octreeHelper.visible = false;
				scene.add(octreeHelper);
			});
		}
	);

	/*	 创建文字精灵	*/
	let getTextCanvas = function (text) {
		let option = {
			fontFamily: 'Arial',
			fontSize: 25,
			fontWeight: 'bold',
			color: '#ffffff',
			actualFontSize: 0.08,
		};
		let canvas, context, textWidth, texture, materialObj, spriteObj;
		canvas = document.createElement('canvas');
		context = canvas.getContext('2d');
		//todo先设置字体大小后获取文本宽度
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
		materialObj = new THREE.SpriteMaterial({ map: texture });
		spriteObj = new THREE.Sprite(materialObj);
		spriteObj.scale.set(
			textWidth / option.fontSize * option.actualFontSize,
			option.actualFontSize,
			option.actualFontSize
		);

		return spriteObj;
	}

	/*	 loadCharacter	*/
	const characterLoader = new GLTFLoader().setPath('/models/gltf/');
	characterLoader.load('character000.glb',
		gltf => {	//todo所有的匿名函数都可以简写成箭头函数
			character = gltf.scene;
			scene.add(character);
			//遍历gltf,为每个物体设置贴图的色彩空间以得到正确的PBR物理材质效果
			character.traverse(function (object) {
				if (object.isMesh) {
					//map
					if (object.material.map) {
						object.material.map.colorSpace = THREE.SRGBColorSpace;
					}
					//emissiveMap
					if (object.material.emissive || object.material.emissiveMap) {

						object.material.emissiveIntensity = 0.2;
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
						object.material.normalScale = new THREE.Vector2(1, -1);
					}
				}
			});
			//遍历gltf,为每个网格模型设置阴影
			character.traverse(child => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;

					if (child.material.map) {
						child.material.map.anisotropy = 4;
					}
				}
			});

			/*    角色名字    */
			let spriteText = getTextCanvas("Character_01");
			characterGroup.add(spriteText);
			//!设置spriteText的位置
			spriteText.position.set(0, 2, 0);
			// 获取capsuleHelper的中心点赋值给bbox
			const bbox = new THREE.Box3().setFromObject(characterGroup.children[0]);
			// 获取包围盒的中心点
			const center = new THREE.Vector3();
			bbox.getCenter(center);
			// 将物体移动到中心点
			characterGroup.position.sub(center);

			//todo 添加角色组和相机控件到场景中
			scene.add(characterGroup);
			scene.add(character);
			scene.add(cameraControls);

			//加载动画
			animations = gltf.animations;
			mixer = new THREE.AnimationMixer(character);
			//todo先用AnimationMixer.clipAction实例化AnimationAction，因为这个方法提供了缓存以提高性能。
			idleAction = mixer.clipAction(animations[0]);
			walkAction = mixer.clipAction(animations[1]);
			backWalkAction = mixer.clipAction(animations[2]);
			runAction = mixer.clipAction(animations[3]);
			backRunAction = mixer.clipAction(animations[4]);
			leftWalkAction = mixer.clipAction(animations[5]);
			rightWalkAction = mixer.clipAction(animations[7]);
			leftRunAction = mixer.clipAction(animations[6]);
			rightRunAction = mixer.clipAction(animations[8]);
			jumpAction = mixer.clipAction(animations[9]);
			fallingAction = mixer.clipAction(animations[10]);
			landingAction = mixer.clipAction(animations[11]);


			actions = [idleAction, walkAction, backWalkAction, runAction, backRunAction, leftWalkAction, rightWalkAction,
				leftRunAction, rightRunAction, jumpAction, fallingAction, landingAction];


			//设置动画混合的初始权重
			for (let i = 0; i < actions.length; i++) {
				actions[i].weight = 0
			}
			idleAction.weight = 1;
			idleAction.play();
			animate();
		}
	)

	/*    窗口监听事件    */
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

	//键盘key，实现角色移动跳跃控制
	document.addEventListener('keydown', event => {
		//键盘状态改变的事件判断
		keyStates[event.code] = true;
	});
	document.addEventListener('keyup', event => {
		//键盘状态改变的事件判断
		keyStates[event.code] = false;
	});
}

init();

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

/*    获取playerCollider前进后退的方向    */
function getForwardVoctor() {

	//获取相机朝向来设置玩家playerCollider的朝向
	cameraControls.getWorldDirection(playerCollider.direction);
	playerCollider.direction.y = 0;//为避免通过相机获取的方向的y不为0，重设为0
	playerCollider.direction.normalize();//重置playerCollider球半径为1
	return playerCollider.direction;
}

/*    获取playerCollider左右平移的方向    */
function getSideVoctor() {

	//获取相机朝向来设置玩家playerCollider的朝向
	cameraControls.getWorldDirection(playerCollider.direction);
	playerCollider.direction.y = 0;//为避免通过相机获取的方向的y不为0，重设为0

	//todo向量叉乘求与其垂直的向量
	const vector3 = playerCollider.direction;
	playerCollider.direction = vector3.cross(camera.up);
	playerCollider.direction.normalize();//重置playerCollider球半径为1
	return playerCollider.direction;

}

/*    相机防穿墙    */
function cameraAdaptive() {
	// console.log(scene);
	const raycaster = new THREE.Raycaster();
	let cameraWorldDriection = new THREE.Vector3();
	camera.getWorldDirection(cameraWorldDriection);
	let raycasterDriection = cameraWorldDriection.negate();//向量取反
	//todo从cameraControls的位置，指向摄像机的方向做射线检测
	//  判断terrainModel是否已加载，以防止报错
	if (terrainModel === undefined) return;
	raycaster.set(cameraControls.position, raycasterDriection)
	//检测对象为terrainModel
	const intersection = raycaster.intersectObject(terrainModel);
	//若检测到的第一个对象到cameraControls的距离小于初始相机的z坐标值，则重设相机位置
	if (intersection.length > 0 && intersection[0].distance < 3) {	//todo需先判断射线检测不为空，以防止程序中断

		camera.position.set(0, 0, intersection[0].distance);

	} else {	//	未检测到terrainModel（会有射线打到天上的情况）则重设相机位置
		camera.position.set(0, 0, 3)
	}
}


/*    updatePlayer    */
function updatePlayer(deltaTime) {

	//todo设置一个阻力，停止按键后会停下来
	let damping = Math.exp(-15 * deltaTime) - 1;

	//设置重力影响
	if (!playerCollider.onFloor) {

		//如不接地，则角色会有一个y方向的重力加速
		playerCollider.velocity.y -= GRAVITY * deltaTime;
		damping *= 0.1;	//!滞空时摩檫阻力的降低降低系数
	}

	//为playerCollider的速度添加阻力
	playerCollider.velocity.addScaledVector(playerCollider.velocity, damping);

	//定义一个变量记录角色移动的距离
	const deltaPosition = playerCollider.velocity.clone().multiplyScalar(deltaTime);

	//调用playerCollider的平移方法
	playerCollider.geometry.translate(deltaPosition);

	//todo每次平移之后立刻做碰撞检测
	playerColliderCollisions();

	//相机跟随playerCollider的平移
	cameraControls.position.set(
		playerCollider.geometry.end.x,
		playerCollider.geometry.end.y + 1,//!设置摄像机高度
		playerCollider.geometry.end.z
	);

	//character跟随playerCollider 的平移
	if (character) {
		character.position.set(
			playerCollider.geometry.end.x,
			playerCollider.geometry.end.y - 1,
			playerCollider.geometry.end.z
		);
	}

	//character跟随cameraControls的y轴旋转，以调整面向
	if (character) {
		character.rotation.set(0, Math.PI + cameraControls.rotation.y, 0);
	}

	//characterGroup跟随playerCollider 的平移
	characterGroup.position.set(
		playerCollider.geometry.end.x,
		playerCollider.geometry.end.y - 1,
		playerCollider.geometry.end.z
	);

	//characterGroup跟随cameraControls的y轴旋转，以调整面向
	characterGroup.rotation.set(0, Math.PI + cameraControls.rotation.y, 0);




	//todo 使用角色速度向量与面向向量做点积运算，可计算出向量间的角度，然后计算出前向分量和向分量的速度
	//计算速度向量到面向向量上的投影，即为speed(同时按住前进和横移时速度速度向量会偏离面向)
	speed = (playerCollider.velocity.dot(playerCollider.direction)) / playerCollider.direction.length();
	//todo为不同键盘按键下的速度构建三维坐标系，用于行动动画的融合控制
	if (keyStates['KeyW']) {
		forwardSpeed = Math.floor(100 * speed)

	} else {
		if (keyStates['KeyS']) {
			forwardSpeed = -Math.floor(100 * speed)
		} else {
			forwardSpeed = 0;
		};
	};


	if (keyStates['KeyA']) {
		sideSpeed = -Math.floor(100 * speed)
	} else {
		if (keyStates['KeyD']) {
			sideSpeed = Math.floor(100 * speed)
		} else {
			sideSpeed = 0;
		};
	};


	if (!playerCollider.onFloor) {
		verticalVelocity = Math.floor(100 * playerCollider.velocity.y)
	} else {
		verticalVelocity = 0
	};

}

/*    handleControls    */
function handleControls(deltaTime) {


	//每次时间变化后速度的改变情况
	//todo判断playerCollider是接触地面，使接地时速度大于滞空速度
	const speedDelta = deltaTime * (playerCollider.onFloor ? 50 : 20);

	/*  W（前进）  */
	if (keyStates['KeyW']) {

		//!前进的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getForwardVoctor().multiplyScalar(-speedDelta));

	}
	/*  S（后退）  */
	if (keyStates['KeyS']) {

		//后退的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getForwardVoctor().multiplyScalar(speedDelta));
		// forwardSpeed = -speed;

	}
	/*  A（左平移）  */
	if (keyStates['KeyA']) {

		//左平移的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getSideVoctor().multiplyScalar(speedDelta));
		// sideSpeed = -speed;

	}
	/*  S（右平移）  */
	if (keyStates['KeyD']) {

		//右平移的方向*速度的系数定义了角色的当前速度
		playerCollider.velocity.add(getSideVoctor().multiplyScalar(-speedDelta));

	}
	/*  onFloor则跳跃可用，并设置角色跳跃速度    */
	if (playerCollider.onFloor) {

		if (keyStates['Space']) {

			playerCollider.velocity.y = 10;

		}
	}


}

/*    碰撞检测   */
function playerColliderCollisions() {

	//todo未检测到碰撞返回false,有碰撞返回collisionResult
	const collisionResult = worldOctree.capsuleIntersect(playerCollider.geometry);

	if (collisionResult) {
		//如果返回collisionResult，说明有碰撞
		//判断碰撞法向量的y方向结果是否为正，检测是否有垂直分量的碰撞
		//collisionResult.normal.y > 0为true，并设置playerCollider.onFloor为true
		playerCollider.onFloor = collisionResult.normal.y > 0;

		if (!playerCollider.onFloor) {
			//如果playerColliderp.onFloor未被设置为true,playerCollider滞空
			playerCollider.velocity.addScaledVector(
				collisionResult.normal,
				//todo点乘，结果是一个向量在另一个向量方向上投影的长度，是一个标量。
				-collisionResult.normal.dot(playerCollider.velocity)
			);
		}
		playerCollider.geometry.translate(collisionResult.normal.multiplyScalar(collisionResult.depth));
	} else {

		//如果碰撞检测直接返回flase，无碰撞，playerCollider滞空
		playerCollider.onFloor = false;

	}

}


/*	 穿天猴firecracker	*/
let firecrackerVelocityY = Math.random() * 0.25 + 2.75;
let firecrackerDuration = firecrackerVelocityY / (GRAVITY * 0.33);
let explosionePositionY = firecrackerVelocityY * firecrackerDuration - (GRAVITY * 0.33) * Math.pow(firecrackerDuration, 2) * 0.5;
let firecrackerMap = new THREE.TextureLoader().load("/textures/sprites/circle.png");
let firecrackerMaterial = new THREE.SpriteMaterial({
	map: firecrackerMap,
	color: 0xffaa00,
});
let firecrackerSprite = new THREE.Sprite(firecrackerMaterial);
firecrackerSprite.scale.set(0.2, 0.5, 0.2);
firecrackerSprite.position.set(Math.random(), 0, Math.random() - 15);

//todo 计算出穿天猴的爆炸点的位置（生成点位置的Y加上向上射出的距离）
let explosionePosition = firecrackerSprite.position.add(new THREE.Vector3(0, explosionePositionY, 0));

scene.add(firecrackerSprite);
async function updateFirecracker(deltaTime) {
	firecrackerVelocityY -= GRAVITY * deltaTime * 0.33;
	firecrackerSprite.position.y += firecrackerVelocityY;
	await new Promise((resolve, reject) => {
		setTimeout(function () {
			scene.remove(firecrackerSprite);
		}, firecrackerDuration * 1000)
	});
}

/*	 烟花	*/
let fireworksParticle, sheetDuration;
const fireworksMaps = [
	'T_SS(4x4)_fireworks001',
	'T_SS(4x4)_fireworks002',
	'T_SS(4x4)_fireworks003',
	'T_SS(5x4)_fireworks001',
	'T_SS(5x4)_fireworks002',
	'T_SS(5x4)_fireworks003',
	'T_SS(5x4)_fireworks004',
	'T_SS(5x4)_fireworks005',
	'T_SS(5x4)_fireworks006',
	'T_SS(5x4)_fireworks007',
	'T_SS(5x5)_fireworks001',
	'T_SS(5x5)_fireworks002',
	'T_SS(5x5)_fireworks003',
	'T_SS(5x5)_fireworks004',
	'T_SS(5x5)_fireworks005',
	'T_SS(5x5)_fireworks006',
	'T_SS(6x5)_fireworks001',
];
async function FireworksSystem() {

	//随机加载一张图片，并根据图片名称识别图片矩阵数
	const texName = fireworksMaps[parseInt(Math.random() * fireworksMaps.length)];
	const fireworksMap = new THREE.TextureLoader().load('/textures/sprites/fireworks/' + texName + '.jpg');
	const sheetU = Number(texName.substring(5, 6));
	const sheetV = Number(texName.substring(7, 8));

	// 烟花播放帧数率
	const sheetFPS = Math.random() * 5 + 10;

	//todo 图片矩阵总数除以每秒切换张数，就是烟花的播放时长，之后用来控制烟花销毁时机
	sheetDuration = sheetU * sheetV / sheetFPS;

	const time = timerLocal();
	const fireworksUV = spritesheetUV(
		vec2(sheetU, sheetV), // count
		pointUV, // uv
		time.mul(sheetFPS) // current frame
	);

	const fireworksTextureSub = texture(fireworksMap, fireworksUV);
	const fireworksColorNode = fireworksTextureSub.mul(1);	//亮度
	const fireworksMaterial = new PointsNodeMaterial({
		depthWrite: false,
		transparent: true,
		sizeAttenuation: true,
		blending: 1,
	});
	
	SpriteNodeMaterial
	fireworksMaterial.colorNode = fireworksColorNode
	fireworksMaterial.opacityNode = fireworksColorNode;
	fireworksMaterial.size = Math.random() * 3 + 10;
	const fireworksGeometry = new THREE.BufferGeometry();
	const vertices = new Float32Array([0, 0, 0]);
	fireworksGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	fireworksParticle = new THREE.Points(fireworksGeometry, fireworksMaterial);
	await new Promise((resolve, reject) => {
		setTimeout(function () {
			scene.add(fireworksParticle);
			fireworksParticle.position.set(explosionePosition.x, explosionePosition.y, explosionePosition.z);
			setTimeout(() => {
				scene.remove(fireworksParticle);
			}, sheetDuration * 1000);
		}, firecrackerDuration * 1000)
	});
}

FireworksSystem();







/*	  animate 	*/
function animate() {

	//需要根据键盘按下的时间来计算处理的程度，需要一个时间的变量
	const deltaTime = Math.min(0.05, clock.getDelta());//todo为避免为0，指定最小值



	handleControls(deltaTime);//调用键盘控制相关

	updatePlayer(deltaTime);//todo角色被操控后需要更新Player

	renderer.render(scene, camera);

	requestAnimationFrame(animate);

	stats.update();

	cameraAdaptive();

	updateFirecracker(deltaTime);

	//! 更新nodeFrame贴图动画才有效果
	nodeFrame.update();

	if (mixer) {
		mixer.update(deltaTime)
	}


	if (forwardSpeed === 0 && sideSpeed === 0 && verticalVelocity === 0) {
		if (idleAction.weight === 0) {
			idleAction.weight = 1;
			walkAction.weight = 0;
			backWalkAction.weight = 0;
			rightWalkAction.weight = 0;
			leftWalkAction.weight = 0;
			jumpAction.weight = 0;
			landingAction.weight = 0;
			fallingAction.weight = 0;
			idleAction.play();
			idleAction.reset()
		}

	}

	if (forwardSpeed > 0) {
		if (sideSpeed === 0 && verticalVelocity === 0) {
			if (walkAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 1;
				backWalkAction.weight = 0;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 0;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				walkAction.play();
				walkAction.reset()
			}
		}
		if (verticalVelocity > 0) {
			if (jumpAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 0;
				backWalkAction.weight = 0;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 1;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				jumpAction.play();
				jumpAction.reset()
			}
		}
	}


	if (forwardSpeed < 0) {
		if (sideSpeed === 0 && verticalVelocity === 0) {
			if (backWalkAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 0;
				backWalkAction.weight = 1;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 0;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				backWalkAction.play();
				backWalkAction.reset()
			}
		}
		if (verticalVelocity > 0) {
			if (jumpAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 0;
				backWalkAction.weight = 0;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 1;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				jumpAction.play();
				jumpAction.reset()
			}
		}

	}


	if (sideSpeed > 0) {
		if (rightWalkAction.weight === 0 && verticalVelocity === 0) {

			idleAction.weight = 0;
			walkAction.weight = 0;
			backWalkAction.weight = 0;
			rightWalkAction.weight = 1;
			leftWalkAction.weight = 0;
			jumpAction.weight = 0;
			landingAction.weight = 0;
			fallingAction.weight = 0;
			rightWalkAction.play();
			rightWalkAction.reset()

		}
		if (verticalVelocity > 0) {
			if (jumpAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 0;
				backWalkAction.weight = 0;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 1;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				jumpAction.play();
				jumpAction.reset()
			}
		}
	}


	if (sideSpeed < 0) {
		if (leftWalkAction.weight === 0 && verticalVelocity === 0) {

			idleAction.weight = 0;
			walkAction.weight = 0;
			backWalkAction.weight = 0;
			rightWalkAction.weight = 0;
			leftWalkAction.weight = 1;
			jumpAction.weight = 0;
			landingAction.weight = 0;
			fallingAction.weight = 0;
			leftWalkAction.play();
			leftWalkAction.reset()
		}
		if (verticalVelocity > 0) {
			if (jumpAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 0;
				backWalkAction.weight = 0;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 1;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				jumpAction.play();
				jumpAction.reset()
			}
		}
	}

	if (verticalVelocity > 0) {
		if (forwardSpeed === 0 && sideSpeed === 0) {
			if (jumpAction.weight === 0) {
				idleAction.weight = 0;
				walkAction.weight = 0;
				backWalkAction.weight = 0;
				rightWalkAction.weight = 0;
				leftWalkAction.weight = 0;
				jumpAction.weight = 1;
				landingAction.weight = 0;
				fallingAction.weight = 0;
				jumpAction.play();
				jumpAction.reset()
			}
		}
	}
	if (verticalVelocity > -1250 && verticalVelocity < -650) {
		if (landingAction.weight === 0) {

			idleAction.weight = 0;
			walkAction.weight = 0;
			backWalkAction.weight = 0;
			rightWalkAction.weight = 0;
			leftWalkAction.weight = 0;
			jumpAction.weight = 0;
			landingAction.weight = 1;
			fallingAction.weight = 0;
			landingAction.play();
			landingAction.reset()
		}
	}
	if (verticalVelocity < -1250) {
		if (fallingAction.weight === 0) {
			idleAction.weight = 0;
			walkAction.weight = 0;
			backWalkAction.weight = 0;
			rightWalkAction.weight = 0;
			leftWalkAction.weight = 0;
			jumpAction.weight = 0;
			landingAction.weight = 0;
			fallingAction.weight = 1;
			fallingAction.play();
			fallingAction.reset()
		}
	}
}






