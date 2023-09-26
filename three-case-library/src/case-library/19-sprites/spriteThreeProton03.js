
import * as THREE from 'three';
import Proton, { log } from 'three.proton.js';

let proton, emitter;
let camera, scene, renderer;
let clock = new THREE.Clock();
let delta;

function initLights() {
    var ambientLight = new THREE.AmbientLight(0x101010);
    scene.add(ambientLight);
    var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);
}


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
    camera.position.y = 750;
    camera.lookAt(0, 750, 0);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 1, 10000);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

}




function initProton() {
    proton = new Proton();
    proton.addRender(new Proton.SpriteRender(scene));

    emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(new Proton.Span(1, 3), 1);
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(4, 8));
    // emitter.addInitialize(new Proton.P(new Proton.LineZone(10, canvas.height, canvas.width - 10, canvas.height)));
    emitter.addInitialize(new Proton.Life(1, 1.5));
    emitter.addInitialize(new Proton.Velocity(500 * Math.random() + 1500, new Proton.Vector3D(0, 1, 0), 5));
    // emitter.addInitialize(new Proton.Velocity(new Proton.Span(4, 6), new Proton.Span(0, 0, true), 'polar'));
    emitter.addBehaviour(new Proton.Gravity(10));
    emitter.addBehaviour(new Proton.Color('#ff0000', 'random'));
    emitter.emit();
    proton.addEmitter(emitter);


    console.log('proton', proton);

    ////NOTICE :you can only use two emitters do this effect.In this demo I use more emitters want to test the emtter's life
    emitter.addEventListener(Proton.PARTICLE_DEAD, function (particle) {
        if (Math.random() < 0.7) {
            createFirstEmitter(particle);
        } else {
            createSecendEmitter(particle);
        }
    });
    //Proton.Debug.drawZone(proton,scene,zone2);
    //Proton.Debug.drawEmitter(proton,scene,emitter);
}

function createFirstEmitter(particle) {
    var subemitter = new Proton.Emitter();
    subemitter.rate = new Proton.Rate(new Proton.Span(250, 300), 1);
    subemitter.addInitialize(new Proton.Mass(1));
    subemitter.addInitialize(new Proton.Radius(100, 200));
    subemitter.addInitialize(new Proton.Life(1, 3));
    emitter.addInitialize(new Proton.Velocity(500 * Math.random() + 2000, new Proton.Vector3D(1, 1, 1), 360));
    // subemitter.addInitialize(new Proton.V(new Proton.Span(2, 4), new Proton.Span(0, 360), 'polar'));
    subemitter.addBehaviour(new Proton.RandomDrift(10, 10, .05));
    subemitter.addBehaviour(new Proton.Alpha(1, 0));
    subemitter.addBehaviour(new Proton.Gravity(3));
    var color = Math.random() > .3 ? Proton.MathUtils.randomColor() : 'random';
    subemitter.addBehaviour(new Proton.Color(color));
    subemitter.p.x = particle.p.x;
    subemitter.p.y = particle.p.y;
    subemitter.emit('once', true);
    proton.addEmitter(subemitter);
}

function createSecendEmitter(particle) {
    var subemitter = new Proton.Emitter();
    subemitter.rate = new Proton.Rate(new Proton.Span(100, 120), 1);
    subemitter.addInitialize(new Proton.Mass(1));
    subemitter.addInitialize(new Proton.Radius(400, 800));
    subemitter.addInitialize(new Proton.Life(1, 2));
    emitter.addInitialize(new Proton.Velocity(500 * Math.random() + 2000, new Proton.Vector3D(1, 1, 1), 360));
    subemitter.addBehaviour(new Proton.Alpha(1, 0));
    subemitter.addBehaviour(new Proton.Scale(1, .1));
    subemitter.addBehaviour(new Proton.Gravity(1));
    var color = Proton.MathUtils.randomColor();
    subemitter.addBehaviour(new Proton.Color(color));
    subemitter.p.x = particle.p.x;
    subemitter.p.y = particle.p.y;
    subemitter.emit('once', true);
    proton.addEmitter(subemitter);
}



function animate() {
    requestAnimationFrame(animate);
    delta = clock.getDelta()
    proton.update();
    renderer.render(scene, camera);
}
