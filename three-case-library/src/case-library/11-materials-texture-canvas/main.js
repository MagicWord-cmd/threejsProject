import * as THREE from 'three';

let camera, scene, renderer, mesh, material;
const drawStartPos = new THREE.Vector2();

init();
setupCanvasDrawing();
animate();

function init() {

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
	camera.position.z = 500;

	scene = new THREE.Scene();

	material = new THREE.MeshBasicMaterial();

	mesh = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200), material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize);

}

// Sets up the drawing canvas and adds it as the material map

function setupCanvasDrawing() {

	//! CanvasRenderingContext2D
	//!	https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D
	const drawingCanvas = document.getElementById('drawing-canvas');	
	const drawingContext = drawingCanvas.getContext('2d');

	// draw white background
	drawingContext.fillStyle = '#ffffff';	//填充样式
	drawingContext.fillRect(0, 0, 512, 512);	//绘制填充矩形（起点x,起点y，width,height）

	//todo 将画布纹理设置为material.map(但不仅限于此，原则上可以是任意通道)
	// 从Canvas元素中创建纹理贴图。它几乎与其基类Texture相同，但它直接将needsUpdate（需要更新）设置为了true。
	material.map = new THREE.CanvasTexture(drawingCanvas);


	//	pait controls
	let paint = false;

	//todo drawingCanvas窗口侦听
	drawingCanvas.addEventListener('pointerdown', function (e) {

		paint = true;
		drawStartPos.set(e.offsetX, e.offsetY);

	});

	drawingCanvas.addEventListener('pointermove', function (e) {

		if (paint) draw(drawingContext, e.offsetX, e.offsetY);

	});

	drawingCanvas.addEventListener('pointerup', function () {

		paint = false;

	});

	//todo	防止 pointerup 发生在 drawingCanvas 画布之外而产生的错误。
	drawingCanvas.addEventListener('pointerleave', function () {

		paint = false;

	});

}

//	draw()
function draw(drawContext, x, y) {

	//	CanvasRenderingContext2D.moveTo()将一个新的子路径的起始点移动到 (x，y) 坐标。
	drawContext.moveTo(drawStartPos.x, drawStartPos.y);	
	//	图形边线的颜色和样式。默认 #000 (黑色).
	drawContext.strokeStyle = '#000000';
	// 使用直线连接子路径的最后的点到 x,y 坐标。
	drawContext.lineTo(x, y);
	// 使用当前的样式描边子路径。
	drawContext.stroke();
	// reset drawing start position to current position.
	drawStartPos.set(x, y);
	// need to flag the map as needing updating.
	material.map.needsUpdate = true;
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.01;

	renderer.render(scene, camera);

}