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
camera.position.set(0, 0, 3);


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

let mixer, character, actions, animations, activeAction, idleAction,
	walkAction, backWalkAction, runAction, leftWalkAction, rightWalkAction,
	leftRunAction, rightRunAction, jumpAction, fallingAction, landingAction, spurtAction;



//playerCollider
const playerCollider = {

	//胶囊碰撞体
	geometry: new Capsule(
		//start
		new THREE.Vector3(0, 3.35, 0),
		//end
		new THREE.Vector3(0, 4, 0),
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
//todo声明两个代表角色前向速度和右向速度的变量，组成一个二维坐标系，用来做角色移动动画控制
let speed = 0;
let forwardSpeed = 0;
let sideSpeed = 0;
let verticalVelocity = 0;

/*    自定义capsuleHelper    */
//!THREE.CapsuleGeometry和胶囊体Capsule的尺寸算法不同
const geometry = new THREE.CapsuleGeometry(0.35, 1.35, 1, 5);
const material = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true

});
let capsuleHelper = new THREE.Mesh(geometry, material);
capsuleHelper.visible = false;	//!设置显隐
//!角色组
const characterGroup = new THREE.Group();
characterGroup.add(capsuleHelper);
capsuleHelper.position.set(0, 1, 0);


init();



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
	//todo锁定翻滚角度，避免mousemove事件时画面倾斜
	cameraControls.rotation.order = 'YXZ';


	//scene

	scene.background = new THREE.Color(0x6699aa);
	scene.add(new THREE.AxesHelper(10));


	//stats

	document.body.appendChild(stats.dom);




	//hemisphereLight
	const hemisphereLight = new THREE.HemisphereLight(	//半球光（不能投射阴影）
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
	directionalLight.shadow.mapSize.set(1024, 1024);//设置阴影贴图分辨率

	scene.add(directionalLight);


	/*	 loadTerrain	*/
	const terrainLoader = new GLTFLoader().setPath('./models/gltf/');
	terrainLoader.load(

		'collision-world2.glb',

		terrain => {	//所有的匿名函数都可以简写成箭头函数

			scene.add(terrain.scene);

			terrain.scene.traverse(child => {

				//console.log(child);

				if (child.isMesh) {

					//开启阴影
					child.castShadow = true;
					child.receiveShadow = true;

				}


				//场景加载完成创建八叉树Octree
				worldOctree.fromGraphNode(terrain.scene);
				const octreeHelper = new OctreeHelper(worldOctree);
				octreeHelper.visible = false;
				scene.add(octreeHelper);

			});

		}

	)



	//! 创建文字精灵
	let getTextCanvas = function (text) {
		let option = {
			fontFamily: 'Arial',
			fontSize: 25,
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


	/*	 loadCharacter	*/
	const characterLoader = new GLTFLoader().setPath('./models/gltf/');
	characterLoader.load(

		'webCharacter01.glb',

		gltf => {	//!所有的匿名函数都可以简写成箭头函数

			character = gltf.scene;


			scene.add(character);
			console.log('gltf', gltf);

			character.traverse(function (object) {

				if (object.isMesh) {
					//!遍历gltf,为每个物体设置贴图的色彩空间以得到正确的PBR物理材质效果
					//map
					if (object.material.map) {
						object.material.map.encoding = THREE.sRGBEncoding;
					}
					//emissiveMap
					if (object.material.emissive || object.material.emissiveMap) {

						object.material.emissiveIntensity = 1;
						if (object.material.emissiveMap) {
							object.material.emissiveMap.encoding = THREE.sRGBEncoding;
						}
					}
					//lightMap
					if (object.material.lightMap) {
						object.material.lightMap.encoding = THREE.sRGBEncoding;
					}
					//aoMap
					if (object.material.aoMap) {
						object.material.aoMap.encoding = THREE.LinearEncoding;
						object.material.aoMapIntensity = 0.65;        //!ao强度
					}
					//metalnessMap
					if (object.material.metalnessMap) {
						object.material.metalnessMap.encoding = THREE.LinearEncoding;
					}
					//roughnessMap
					if (object.material.roughnessMap) {
						object.material.roughnessMap.encoding = THREE.LinearEncoding;
					}
					//normalMap
					if (object.material.normalMap) {
						object.material.normalMap.encoding = THREE.LinearEncoding;
						object.material.normalScale = new THREE.Vector2(1, -1);    //!法线强度
					}

				}

			});


			// 主人物名字
			let spriteText = getTextCanvas("Character_01");
			characterGroup.add(spriteText);
			spriteText.position.set(0, 2.1, 0);

			const bbox = new THREE.Box3().setFromObject(characterGroup.children[0]);

			// 获取包围盒的中心点
			const center = new THREE.Vector3();
			bbox.getCenter(center);

			// 将物体移动到中心点
			characterGroup.position.sub(center);

			//! 角色组和相机控件到场景中
			scene.add(characterGroup);
			scene.add(character);
			scene.add(cameraControls);

			character.traverse(child => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;

					if (child.material.map) {
						child.material.map.anisotropy = 4;
					}
				}
			});


			//!加载动画
			animations = gltf.animations;
			mixer = new THREE.AnimationMixer(character);
			//!先用AnimationMixer.clipAction实例化AnimationAction，因为这个方法提供了缓存以提高性能。
			idleAction = mixer.clipAction(animations[0]);
			walkAction = mixer.clipAction(animations[1]);
			backWalkAction = mixer.clipAction(animations[2]);
			runAction = mixer.clipAction(animations[3]);
			leftWalkAction = mixer.clipAction(animations[4]);
			rightWalkAction = mixer.clipAction(animations[5]);
			leftRunAction = mixer.clipAction(animations[6]);
			rightRunAction = mixer.clipAction(animations[7]);
			jumpAction = mixer.clipAction(animations[8]);
			fallingAction = mixer.clipAction(animations[9]);
			landingAction = mixer.clipAction(animations[10]);
			spurtAction = mixer.clipAction(animations[11]);

			actions = [idleAction, walkAction, backWalkAction, runAction, leftWalkAction, rightWalkAction,
				leftRunAction, rightRunAction, jumpAction, fallingAction, landingAction, spurtAction];
			// console.log('actions', actions);

			//设置动画混合的初始权重
			for (let i = 0; i < actions.length; i++) {
				actions[i].weight = 0
			}

			idleAction.weight = 1;
			idleAction.play();

			animate();

		}

	)


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



//!获取playerCollider前进后退的方向
function getForwardVoctor() {

	//获取相机朝向来设置玩家playerCollider的朝向
	cameraControls.getWorldDirection(playerCollider.direction);
	playerCollider.direction.y = 0;//为避免通过相机获取的方向的y不为0，重设为0
	playerCollider.direction.normalize();//重置playerCollider球半径为1
	return playerCollider.direction;
}


//!获取playerCollider左右平移的方向
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





//updatePlayer()
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
		playerCollider.geometry.end.y + 1,
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



//!碰撞检测函数
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

/*	  animate 	*/
function animate() {

	//需要根据键盘按下的时间来计算处理的程度，需要一个时间的变量
	const deltaTime = Math.min(0.05, clock.getDelta());//todo为避免为0，指定最小值

	handleControls(deltaTime);//调用键盘控制相关

	updatePlayer(deltaTime);//todo角色被操控后需要更新Player

	renderer.render(scene, camera);

	requestAnimationFrame(animate);

	stats.update();

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






