import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';
import { withBase } from 'vitepress';

export async function main(): Promise<ReturnType> {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    let renderer, scene, camera, stats;
    let mesh;
    let raycaster;
    let line;

    const intersection = {
        intersects: false,
        point: new THREE.Vector3(),
        normal: new THREE.Vector3(),
    };
    const mouse = new THREE.Vector2();
    const intersects: any[] = [];

    const textureLoader = new THREE.TextureLoader();
    const decalDiffuse = textureLoader.load(
        withBase('models/decal-diffuse.png')
    );
    decalDiffuse.colorSpace = THREE.SRGBColorSpace;
    const decalNormal = textureLoader.load(withBase('models/decal-normal.jpg'));

    const decalMaterial = new THREE.MeshPhongMaterial({
        specular: 0x444444,
        map: decalDiffuse,
        normalMap: decalNormal,
        normalScale: new THREE.Vector2(1, 1),
        shininess: 30,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        wireframe: false,
    });

    const decals: any[] = [];
    let mouseHelper;
    const position = new THREE.Vector3();
    const orientation = new THREE.Euler();
    const size = new THREE.Vector3(10, 10, 10);

    const params = {
        minScale: 10,
        maxScale: 20,
        rotate: true,
        clear: function () {
            removeDecals();
        },
    };

    init();

    function init() {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvas,
        });
        renderer.setSize(512, 512);
        renderer.setPixelRatio(window.devicePixelRatio);

        stats = new Stats();
        document.body.appendChild(stats.dom);

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            45,
            canvas.width / canvas.height,
            1,
            1000
        );
        camera.position.z = 120;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 50;
        controls.maxDistance = 200;

        scene.add(new THREE.AmbientLight(0x666666));

        const dirLight1 = new THREE.DirectionalLight(0xffddcc, 3);
        dirLight1.position.set(1, 0.75, 0.5);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xccccff, 3);
        dirLight2.position.set(-1, 0.75, -0.5);
        scene.add(dirLight2);

        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

        line = new THREE.Line(geometry, new THREE.LineBasicMaterial());
        scene.add(line);

        loadLeePerrySmith();

        raycaster = new THREE.Raycaster();

        mouseHelper = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 10),
            new THREE.MeshNormalMaterial()
        );
        mouseHelper.visible = false;
        scene.add(mouseHelper);

        window.addEventListener('resize', onWindowResize);

        let moved = false;

        controls.addEventListener('change', function () {
            moved = true;
        });

        window.addEventListener('pointerdown', function () {
            moved = false;
        });

        window.addEventListener('pointerup', function (event) {
            if (moved === false) {
                checkIntersection(event.offsetX, event.offsetY);

                if (intersection.intersects) shoot();
            }
        });

        window.addEventListener('pointermove', onPointerMove);

        function onPointerMove(event: MouseEvent) {
            console.log(event.offsetX, event.offsetY);
            checkIntersection(event.offsetX, event.offsetY);
        }

        function checkIntersection(x, y) {
            if (mesh === undefined) return;

            mouse.x = (x / canvas.width) * 2 - 1;
            mouse.y = -(y / canvas.height) * 2 + 1;

            console.log(mouse);
            raycaster.setFromCamera(mouse, camera);
            raycaster.intersectObject(mesh, false, intersects);

            if (intersects.length > 0) {
                const p = intersects[0].point;
                mouseHelper.position.copy(p);
                intersection.point.copy(p);

                const n = intersects[0].face.normal.clone();
                n.transformDirection(mesh.matrixWorld);
                n.multiplyScalar(10);
                n.add(intersects[0].point);

                intersection.normal.copy(intersects[0].face.normal);
                mouseHelper.lookAt(n);

                const positions = line.geometry.attributes.position;
                positions.setXYZ(0, p.x, p.y, p.z);
                positions.setXYZ(1, n.x, n.y, n.z);
                positions.needsUpdate = true;

                intersection.intersects = true;

                intersects.length = 0;
            } else {
                intersection.intersects = false;
            }
        }

        const gui = new GUI();

        gui.add(params, 'minScale', 1, 30);
        gui.add(params, 'maxScale', 1, 30);
        gui.add(params, 'rotate');
        gui.add(params, 'clear');
        gui.open();
    }

    function loadLeePerrySmith() {
        const map = textureLoader.load(withBase('models/Map-COL.jpg'));
        map.colorSpace = THREE.SRGBColorSpace;
        const specularMap = textureLoader.load(withBase('models/Map-SPEC.jpg'));
        const normalMap = textureLoader.load(
            withBase('models/Infinite-Level_02_Tangent_SmoothUV.jpg')
        );

        const loader = new GLTFLoader();

        loader.load(withBase('models/LeePerrySmith.glb'), function (gltf) {
            mesh = gltf.scene.children[0];
            mesh.material = new THREE.MeshPhongMaterial({
                specular: 0x111111,
                map: map,
                specularMap: specularMap,
                normalMap: normalMap,
                shininess: 25,
            });

            scene.add(mesh);
            mesh.scale.set(10, 10, 10);
        });
    }

    function shoot() {
        position.copy(intersection.point);
        orientation.copy(mouseHelper.rotation);

        if (params.rotate) orientation.z = Math.random() * 2 * Math.PI;

        const scale =
            params.minScale +
            Math.random() * (params.maxScale - params.minScale);
        size.set(scale, scale, scale);

        const material = decalMaterial.clone();
        material.color.setHex(Math.random() * 0xffffff);

        const m = new THREE.Mesh(
            new DecalGeometry(mesh, position, orientation, size),
            material
        );
        m.renderOrder = decals.length; // give decals a fixed render order

        decals.push(m);
        scene.add(m);
    }

    function removeDecals() {
        decals.forEach(function (d) {
            scene.remove(d);
        });

        decals.length = 0;
    }

    function onWindowResize() {
        camera.updateProjectionMatrix();
    }

    function animate() {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);

        stats.update();
    }
    let rfId = 0;
    const mainLoop = () => {
        requestAnimationFrame(mainLoop);
    };

    const cancel = () => {
        cancelAnimationFrame(rfId);
    };

    return {
        mainLoop: animate,
        cancel,
    };
}

export type ReturnType = {
    mainLoop: () => void;
    cancel: () => void;
};
