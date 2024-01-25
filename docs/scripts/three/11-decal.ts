import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
import { withBase } from 'vitepress';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import plainFrag from './shaders/plainFullScreen.frag.glsl';
import plainVert from './shaders/normal.vert.glsl';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
export async function main(): Promise<ReturnType> {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    let renderer, scene, camera: THREE.PerspectiveCamera, stats;
    let mesh;
    let raycaster;
    let line;
    let selectedIndex = -1;

    const intersection = {
        intersects: false,
        point: new THREE.Vector3(),
        normal: new THREE.Vector3(),
    };
    const mouse = new THREE.Vector2();
    const intersects: any[] = [];

    const textureLoader = new THREE.TextureLoader();
    const footerContainer = document.getElementById('footer') as HTMLElement;
    const decalTextureUrls = [
        withBase('decals/bianpao.png'),
        withBase('decals/denglong.png'),
        withBase('decals/dragon.png'),
        withBase('decals/fu-cute.png'),
        withBase('decals/fu.png'),
        withBase('decals/qianbi.png'),
        withBase('decals/qiandai.png'),
        withBase('decals/yuanbao.png'),
    ];

    const list = document.createDocumentFragment();
    const imgs: HTMLImageElement[] = [];
    decalTextureUrls.forEach((item, index) => {
        const imgDom = document.createElement('img');
        imgDom.classList.add('img');
        imgDom.src = item;
        imgs.push(imgDom);
        imgDom.onclick = () => {
            imgs.forEach(item => item.classList.remove('active'));
            if (selectedIndex === index) {
                selectedIndex = -1;
                return;
            }
            selectedIndex = index;
            imgs[index].classList.add('active');
        };
        list.appendChild(imgDom);
    });

    footerContainer.append(list);

    const decalTextures = decalTextureUrls.map(url => {
        return textureLoader.load(url);
    });

    const decalDiffuse = textureLoader.load(
        withBase('models/decal-diffuse.png')
    );

    decalDiffuse.colorSpace = THREE.SRGBColorSpace;
    const customMaterial = new THREE.ShaderMaterial({
        vertexShader: plainVert,
        fragmentShader: plainFrag,
        depthTest: true,
        depthWrite: false,
        uniforms: {
            mainTex: {
                value: decalTextures[0],
            },
        },
        polygonOffset: true,
        polygonOffsetFactor: -4,
        wireframe: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    const decalMaterial = new THREE.MeshLambertMaterial({
        // specular: 0x444444,
        map: decalTextures[0],
        // shininess: 30,
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
        minScale: 5,
        maxScale: 10,
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

        const cameraPos = new THREE.Vector3(-32, 88.705, 93.4);
        const cameraQuat = new THREE.Quaternion(
            -0.1959,
            -0.1321,
            -0.0266,
            0.9713
        );
        camera.position.copy(cameraPos);
        camera.setRotationFromQuaternion(cameraQuat);

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
            checkIntersection(event.offsetX, event.offsetY);
        }

        function checkIntersection(x, y) {
            if (mesh === undefined) return;

            mouse.x = (x / canvas.width) * 2 - 1;
            mouse.y = -(y / canvas.height) * 2 + 1;

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

        const hdrLoader = new RGBELoader();
        hdrLoader.load(withBase('img/hdr/buikslotermeerplein_2k.hdr'), data => {
            data.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = data;
        });
    }

    function loadLeePerrySmith() {
        const map = textureLoader.load(withBase('models/Map-COL.jpg'));
        map.colorSpace = THREE.SRGBColorSpace;

        const objLoader = new OBJLoader();

        objLoader.load(withBase('model/dragon.obj'), function (group) {
            group.children.forEach(item => {
                if (item instanceof THREE.Mesh) {
                    item.material = new THREE.MeshPhongMaterial({
                        specular: 0x111111,
                    });

                    scene.add(item);
                    mesh = item;
                    item.scale.set(5, 5, 5);
                }
            });
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

        const material = customMaterial.clone();
        let index = Math.floor(Math.random() * decalTextures.length);
        if (selectedIndex >= 0) {
            index = selectedIndex;
        }
        // material.map = decalTextures[index];
        material.uniforms.mainTex.value = decalTextures[index];
        // material.color.setHex(Math.random() * 0xffffff);

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
        // camera.updateProjectionMatrix();
    }

    function animate() {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);

        // stats.update();
    }
    let rfId = 0;

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
