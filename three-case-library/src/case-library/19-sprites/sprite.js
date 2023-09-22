
import * as THREE from 'three';
import Proton from 'three.proton.js';


var proton, emitter;
var camera, scene, renderer, clock;

init();
function init() {
    initScene();
    initLights();
    initProton();
    animate();
}

function initScene() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1000;
    camera.position.y = 550
    camera.lookAt(0, 550, 0);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 1, 10000);

    clock = new THREE.Clock();

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
    proton.addEmitter(createEmitter());
    proton.addRender(new Proton.SpriteRender(scene));

    // Proton.Debug.drawZone(proton,scene,zone2);
    //Proton.Debug.drawEmitter(proton,scene,emitter);
}

function createSprite() {
    var map = new THREE.TextureLoader().load("/textures/sprites/disc.png");
    var material = new THREE.SpriteMaterial({
        map: map,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
        fog: true
    });
    return new THREE.Sprite(material);
}


function createEmitter() {
    emitter = new Proton.Emitter();

    //数量控制
    emitter.rate = new Proton.Rate(new Proton.Span(1, 1.5), new Proton.Span(0.25, 0.5));

    // emitter.addInitialize(new Proton.Mass(1));
    // emitter.addInitialize(new Proton.Radius(50));
    emitter.addInitialize(new Proton.Life(1.5, 2));
    emitter.addInitialize(new Proton.Body(createSprite()));
    emitter.addInitialize(new Proton.Position(new Proton.BoxZone(100)));
    emitter.addInitialize(new Proton.Velocity(200 * Math.random() + 1500, new Proton.Vector3D(0, 1, 0), 10));
    emitter.addBehaviour(new Proton.Gravity(10));

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
    proton.update();
    renderer.render(scene, camera);

    // camera.lookAt(scene.position);
    // tha += .02;
    // camera.position.x = Math.sin(tha) * 500;
    // camera.position.z = Math.cos(tha) * 500;
}

function onWindowResize() {

}