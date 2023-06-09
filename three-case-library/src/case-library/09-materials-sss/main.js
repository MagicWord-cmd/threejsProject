import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//!	引入SubsurfaceScatteringShader
import { SubsurfaceScatteringShader } from 'three/addons/shaders/SubsurfaceScatteringShader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let container, stats;
let camera, scene, renderer;
let model;

init();
animate();

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
	camera.position.set(0.0, 300, 400 * 4);

	scene = new THREE.Scene();

	// Lights

	scene.add(new THREE.AmbientLight(0xc1c1c1));

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.03);
	directionalLight.position.set(0.0, 0.5, 0.5).normalize();
	scene.add(directionalLight);

	const pointLight1 = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
	pointLight1.add(new THREE.PointLight(0xffffff, 2, 300));
	scene.add(pointLight1);
	pointLight1.position.x = 0;
	pointLight1.position.y = - 50;
	pointLight1.position.z = 350;

	const pointLight2 = new THREE.Mesh(new THREE.SphereGeometry(4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
	pointLight2.add(new THREE.PointLight(0xffffff, 1.0, 500));
	scene.add(pointLight2);
	pointLight2.position.x = - 100;
	pointLight2.position.y = 20;
	pointLight2.position.z = - 260;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	//

	stats = new Stats();
	container.appendChild(stats.dom);

	const controls = new OrbitControls(camera, container);
	controls.minDistance = 500;
	controls.maxDistance = 3000;

	window.addEventListener('resize', onWindowResize);

	initMaterial();

}

function initMaterial() {

	const loader = new THREE.TextureLoader();
	const imgTexture = loader.load('/models/fbx/white.jpg');
	imgTexture.colorSpace = THREE.SRGBColorSpace;
	imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;

	const thicknessTexture = loader.load('/models/fbx/bunny_thickness.jpg');

	const shader = SubsurfaceScatteringShader;
	const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

	uniforms['map'].value = imgTexture;
	//!	漫射颜色混合
	uniforms['diffuse'].value = new THREE.Vector3(0, 0.2, 0.2);
	uniforms['shininess'].value = 500;
	uniforms['thicknessMap'].value = thicknessTexture;
	uniforms['thicknessColor'].value = new THREE.Vector3(0, 0.3, 0.1);
	uniforms['thicknessDistortion'].value = 0.1;
	uniforms['thicknessAmbient'].value = 0.4;
	uniforms['thicknessAttenuation'].value = 0.8;
	uniforms['thicknessPower'].value = 2.0;
	uniforms['thicknessScale'].value = 16.0;

	//!	用于设置材质高光
	uniforms['specular'].value = new THREE.Color(0.1, 0.1, 0.1);


	const material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		lights: true
	});
	material.extensions.derivatives = true;
	console.log('material', material);

	// LOADER

	const loaderFBX = new FBXLoader();
	loaderFBX.load('/models/fbx/stanford-bunny.fbx', function (object) {

		model = object.children[0];
		model.position.set(0, 0, 10);
		model.scale.setScalar(1);
		model.material = material;
		scene.add(model);

	});

	initGUI(uniforms);

}

function initGUI(uniforms) {

	const gui = new GUI({ title: 'Thickness Control' });

	const ThicknessControls = function () {

		this.distortion = uniforms['thicknessDistortion'].value;
		this.ambient = uniforms['thicknessAmbient'].value;
		this.attenuation = uniforms['thicknessAttenuation'].value;
		this.power = uniforms['thicknessPower'].value;
		this.scale = uniforms['thicknessScale'].value;

	};

	const thicknessControls = new ThicknessControls();

	gui.add(thicknessControls, 'distortion').min(0.01).max(1).step(0.01).onChange(function () {

		uniforms['thicknessDistortion'].value = thicknessControls.distortion;
		console.log('distortion');

	});

	gui.add(thicknessControls, 'ambient').min(0.01).max(5.0).step(0.05).onChange(function () {

		uniforms['thicknessAmbient'].value = thicknessControls.ambient;

	});

	gui.add(thicknessControls, 'attenuation').min(0.01).max(5.0).step(0.05).onChange(function () {

		uniforms['thicknessAttenuation'].value = thicknessControls.attenuation;

	});

	gui.add(thicknessControls, 'power').min(0.01).max(16.0).step(0.1).onChange(function () {

		uniforms['thicknessPower'].value = thicknessControls.power;

	});

	gui.add(thicknessControls, 'scale').min(0.01).max(50.0).step(0.1).onChange(function () {

		uniforms['thicknessScale'].value = thicknessControls.scale;

	});

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {

	requestAnimationFrame(animate);

	render();

	stats.update();

}

function render() {

	if (model) model.rotation.y = performance.now() / 5000;

	renderer.render(scene, camera);

}
