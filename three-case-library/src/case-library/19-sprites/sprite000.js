
import * as THREE from 'three';
import Proton, { log } from 'three.proton.js';
/*    sprite要用的的引入    */
import { timerLocal, spritesheetUV, pointUV, vec2, texture, PointsNodeMaterial, SpriteNodeMaterial, TextureNode } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';

let proton, emitter, boomer;
let camera, scene, renderer;
let clock = new THREE.Clock();
let delta;
init();
function init() {
    initScene();
    initLights();
    initProton();
    animate();
}

function initScene() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1500;
    camera.position.y =750;
    camera.lookAt(0, 750, 0);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 1, 10000);



    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

function initLights() {
    var ambientLight = new THREE.AmbientLight(0x101010);
    scene.add(ambientLight);
    var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);
}


function initProton() {
    proton = new Proton();
    // proton.addEmitter(createEmitter1());
    proton.addEmitter(createEmitter1());
    proton.addRender(new Proton.SpriteRender(scene));

    // Proton.Debug.drawZone(proton,scene,zone2);
    //Proton.Debug.drawEmitter(proton,scene,emitter);
}


//! TextureAnimator
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) {
    // note: texture passed by reference, will be updated by the update function.

    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;

    this.update = function (milliSec) {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration) {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}





function createSprite1() {

    const firecrackerTexture = new THREE.TextureLoader().load('/textures/sprites/circle.png');

    const firecrackerMaterial = new THREE.SpriteMaterial({
        color: 0xffff00,
        blending: 1,
        fog: true,
        map: firecrackerTexture,
        // opacity: fireworksTexture,
    });
    return new THREE.Sprite(firecrackerMaterial);
}
function createSprite2() {

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
    //随机加载一张图片，并根据图片名称识别图片矩阵数
    const texName = fireworksMaps[parseInt(Math.random() * fireworksMaps.length)];
    const sheetU = Number(texName.substring(5, 6));
    const sheetV = Number(texName.substring(7, 8));
    const sheetTiles = sheetU * sheetV;
    const sheetDuration = Math.random() * 5 + 25;


    let fireworksTexture = new THREE.TextureLoader().load('/textures/sprites/fireworks/' + texName + '.jpg');
    boomer = new TextureAnimator(fireworksTexture, sheetU, sheetV, sheetTiles, sheetDuration); // texture, #horiz, #vert, #total, duration.

    const fireworksMaterial = new THREE.SpriteMaterial({
        color: 0xffffff,
        blending: 1,
        fog: true,
        map: fireworksTexture,
        // opacity: fireworksTexture,
    });
    console.log(fireworksMaterial);
    return new THREE.Sprite(fireworksMaterial);
}


function createEmitter1() {
    emitter = new Proton.Emitter();

    emitter.rate = new Proton.Rate(new Proton.Span(1, 1.25), new Proton.Span(0.5, 0.75));//数量控制
    emitter.addInitialize(new Proton.Mass(3));
    emitter.addInitialize(new Proton.Radius(10));
    emitter.addInitialize(new Proton.Life(1.5, 2));
    emitter.addInitialize(new Proton.Body(createSprite1()));
    emitter.addInitialize(new Proton.Position(new Proton.BoxZone(100)));
    emitter.addInitialize(new Proton.Velocity(500 * Math.random() + 2000, new Proton.Vector3D(0, 1, 0), 5));
    emitter.addBehaviour(new Proton.Gravity(30));
   
    // emitter.addBehaviour(new Proton.Spring(0,100,0,1,2));
    // emitter.addBehaviour(new Proton.RandomDrift(30, 30, 30, .05));
    // emitter.addBehaviour(new Proton.Rotate("random", "random"));
    // emitter.addBehaviour(new Proton.Scale(1, 0.5));
    // emitter.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    // var zone2 = new Proton.BoxZone(400);
    // emitter.addBehaviour(new Proton.CrossZone(zone2, "bound"));
    // emitter.addBehaviour(new Proton.Collision(emitter,true));
    // emitter.addBehaviour(new Proton.Color(0xff0000, 'random', Infinity, Proton.easeOutQuart));
    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();
    // emitter.emit('once');
    console.log(' emitter', emitter);
    return emitter;
}

function createEmitter2() {
    emitter = new Proton.Emitter();

    emitter.rate = new Proton.Rate(new Proton.Span(1, 1.25), new Proton.Span(0.01));//数量控制
    // emitter.addInitialize(new Proton.Mass(3));
    emitter.addInitialize(new Proton.Radius(500));
    emitter.addInitialize(new Proton.Life(2.5, 2.5));
    emitter.addInitialize(new Proton.Body(createSprite2()));
    // emitter.addInitialize(new Proton.Position(new Proton.BoxZone(100)));
    emitter.addInitialize(new Proton.Velocity(0, new Proton.Vector3D(0, 0, 0), 0));
    emitter.addBehaviour(new Proton.Gravity(0));
    // emitter.addBehaviour(new Proton.Spring(0,100,0,1,2));
    // emitter.addBehaviour(new Proton.RandomDrift(30, 30, 30, .05));
    // emitter.addBehaviour(new Proton.Rotate("random", "random"));
    // emitter.addBehaviour(new Proton.Scale(1, 0.5));
    // emitter.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    // var zone2 = new Proton.BoxZone(400);
    // emitter.addBehaviour(new Proton.CrossZone(zone2, "bound"));
    // emitter.addBehaviour(new Proton.Collision(emitter,true));
    // emitter.addBehaviour(new Proton.Color(0xff0000, 'random', Infinity, Proton.easeOutQuart));
    emitter.p.x = 0;
    emitter.p.y = 0;
    emitter.emit();
    // emitter.emit('once');
    console.log(' emitter', emitter);
    return emitter;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}
console.log('proton', proton);
function render() {
    delta = clock.getDelta()
    //! 更新boomer贴图动画才有效果
    // boomer.update(1000 * delta);
    proton.update();
    renderer.render(scene, camera);
}

function onWindowResize() {

}