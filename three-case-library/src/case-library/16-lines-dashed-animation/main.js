import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';

let renderer, scene, camera, stats, material, mixer, lineSegments, clipAction, clock;
const objects = [];

const WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

init();
animate();

function init() {
	clock = new THREE.Clock();

	camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 200);
	camera.position.z = 150;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x111111);
	scene.fog = new THREE.Fog(0x111111, 150, 200);

	const subdivisions = 6;	//todo	影响曲线的分段
	const recursion = 2;	//todo	重复循环（为1曲线全部渲染，<1不能全部渲染，>1会重复）
	material = new THREE.LineDashedMaterial({ color: 0xffaa00, dashSize: 3, gapSize: 1, scale: 1 });

	// const points = GeometryUtils.hilbert3D(new THREE.Vector3(0, 0, 0), 25, recursion, 0, 1, 2, 3, 4, 5, 6, 7);
	const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 50, 0), new THREE.Vector3(50, 50, 0), new THREE.Vector3(50, 50, 50)]
	const spline = new THREE.CatmullRomCurve3(points);

	const samples = spline.getPoints(points.length * subdivisions);
	const geometrySpline = new THREE.BufferGeometry().setFromPoints(samples);

	const line = new THREE.Line(geometrySpline, material);
	line.computeLineDistances();
	objects.push(line);
	scene.add(line);


	const geometryBox = box(50, 50, 50);

	lineSegments = new THREE.LineSegments(geometryBox, material);
	lineSegments.computeLineDistances();

	objects.push(lineSegments);
	scene.add(lineSegments);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);

	const container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	//todo 虚线滚动动画(虚线过长的话越接近末端，动画效果越不明显)
	const scaleKF = new THREE.NumberKeyframeTrack(
		'.material.scale',
		[0, 1, 2, 3, 4, 5, 6, 7],
		[1, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9]
	);
	const clip = new THREE.AnimationClip('Action', 6, [scaleKF]);
	mixer = new THREE.AnimationMixer(lineSegments);
	clipAction = mixer.clipAction(clip);
	clipAction.play();


	window.addEventListener('resize', onWindowResize);

}

function box(width, height, depth) {

	width = width * 0.5,
		height = height * 0.5,
		depth = depth * 0.5;

	const geometry = new THREE.BufferGeometry();
	const position = [];

	position.push(
		- width, - height, - depth,
		- width, height, - depth,

		- width, height, - depth,
		width, height, - depth,

		width, height, - depth,
		width, - height, - depth,

		width, - height, - depth,
		- width, - height, - depth,

		- width, - height, depth,
		- width, height, depth,

		- width, height, depth,
		width, height, depth,

		width, height, depth,
		width, - height, depth,

		width, - height, depth,
		- width, - height, depth,

		- width, - height, - depth,
		- width, - height, depth,

		- width, height, - depth,
		- width, height, depth,

		width, height, - depth,
		width, height, depth,

		width, - height, - depth,
		width, - height, depth
	);

	geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));

	return geometry;

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);

	render();
	stats.update();

}

function render() {

	const time = Date.now() * 0.001;
	const delta = clock.getDelta();

	scene.traverse(function (object) {

		if (object.isLine) {

			object.rotation.x = 0.25 * time;
			object.rotation.y = 0.25 * time;

		}

	});

	if (mixer) {
		mixer.update(delta);
	}
	console.log(material.scale);


	renderer.render(scene, camera);

}
