import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class App {
    constructor() {

        //container
        const container = document.createElement('div');
        document.body.appendChild(container);

        //camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 4);

        //scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xAAAAAA);

        //light
        const ambient = new THREE.HemisphereLight(0xffffff,0xbbbbff,0.3);
        this.scene.add(ambient);
        const directLight = new THREE.DirectionalLight();
        directLight.position.set(0.2,1,1);
        this.scene.add(directLight);

        //renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);
        //循环渲染
        this.renderer.setAnimationLoop(this.render.bind(this));

        //mesh
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        //controls
        const controls = new OrbitControls(this.camera,this.renderer.domElement);

        //窗口大小变化时调用resize()方法（按名称调用），.bind(this)确保正确作用域scope
        window.addEventListener('resize', this.resize.bind(this));
    }

    //resize()
    resize() {

        this.camera.aspect = window.innerWidth/innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth,window.innerHeight);

    }

    //render()
    render() {

        this.mesh.rotateY(0.01);
        this.renderer.render(this.scene, this.camera);

    }

}

export { App };
