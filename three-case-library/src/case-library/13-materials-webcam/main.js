import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer, video;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.z = 0.01;

	scene = new THREE.Scene();

	video = document.getElementById('video');

	const texture = new THREE.VideoTexture(video);

	const geometry = new THREE.PlaneGeometry(16, 9);
	geometry.scale(0.5, 0.5, 0.5);
	const material = new THREE.MeshBasicMaterial({ map: texture });

	const count = 128;
	const radius = 32;

	for (let i = 1, l = count; i <= l; i++) {

		const phi = Math.acos(- 1 + (2 * i) / l);	//	反余弦
		const theta = Math.sqrt(l * Math.PI) * phi;	//	平方根

		const mesh = new THREE.Mesh(geometry, material);

		//! 从球坐标中的radius、phi和theta设置该向量。
		mesh.position.setFromSphericalCoords(radius, phi, theta);
		
		mesh.lookAt(camera.position);
		scene.add(mesh);
	}

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = false;
	controls.enablePan = false;

	window.addEventListener('resize', onWindowResize);


	// mediaDevices 是 Navigator 只读属性，返回一个 MediaDevices 对象，
	// 该对象可提供对相机和麦克风等媒体输入设备的连接访问，也包括屏幕共享。
	//! https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator/mediaDevices

	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

		const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };

		navigator.mediaDevices.getUserMedia(constraints).then(
			function (stream) {
				// apply the stream to the video element used in the texture
				video.srcObject = stream;
				video.play();
			}
		).catch(
			function (error) {
				console.error('Unable to access the camera/webcam.', error);
			}
		);

	} else {
		console.error('MediaDevices interface not available.');
	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);
	renderer.render(scene, camera);

}
