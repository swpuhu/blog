import * as THREE from 'three';
import diffuseIrradianceVert from '../three/shaders/diffuseIrradinace.vert.glsl';
import diffuseIrradianceFrag from '../three/shaders/diffuseIrradinace.frag.glsl';
import irradianceVert from '../three/shaders/irradiance.vert.glsl';
import irradianceFrag from '../three/shaders/irradiance.frag.glsl';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { clamp } from '../webgl/util';
import { withBase } from 'vitepress';
import { CustomBackground } from './CustomBackground';

console.log('Chapter: IDL Specular');

function generateSphereGrid(mesh: THREE.Mesh): THREE.Group {
    const rows = 7;
    const cols = 7;
    const spacing = 2.5;
    const group = new THREE.Group();
    for (let y = 0; y < rows; y++) {
        const metallic = clamp(y / rows, 0.05, 1.0);
        for (let x = 0; x < cols; x++) {
            const m = mesh.clone();
            if (mesh.material instanceof THREE.ShaderMaterial) {
                m.material = mesh.material.clone();
                (m.material as THREE.ShaderMaterial).uniforms.roughness.value =
                    clamp(x / cols, 0.05, 1.0);
                (m.material as THREE.ShaderMaterial).uniforms.metallic.value =
                    metallic;
            }
            const posX = (x - Math.floor(cols / 2)) * spacing;
            const posY = (y - Math.floor(rows / 2)) * spacing;

            m.position.x = posX;
            m.position.y = posY;
            group.add(m);
        }
    }
    return group;
}

function addLight(scene: THREE.Scene): void {
    let light1: THREE.PointLight;
    light1 = new THREE.PointLight(0xff0040, 400);
    scene.add(light1);
    scene.add(light1.clone());
    scene.add(light1.clone());
    scene.add(light1.clone());
}

function initScene(scene: THREE.Scene): void {
    addLight(scene);
}

export async function main(): Promise<ReturnType> {
    //#region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const fov = 45;
    const near = 0.1;
    const far = 1000;
    const aspect = canvas.width / canvas.height;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const irradianceRTSize = 64;
    const tempCubeRT = new THREE.WebGLCubeRenderTarget(irradianceRTSize);
    const mainCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const irradianceRT = new THREE.WebGLCubeRenderTarget(irradianceRTSize);
    const prefilterCams: THREE.CubeCamera[] = [];
    const prefilterRTs = new Array(6).fill(0).map((_, index) => {
        const mipSize = Math.round(128 * 0.5 ** index);
        const rt = new THREE.WebGLCubeRenderTarget(mipSize);
        const cam = new THREE.CubeCamera(near, far, rt);
        prefilterCams.push(cam);
        return rt;
    });

    const cubeCamera = new THREE.CubeCamera(near, far, irradianceRT);

    const sphereGeo = new THREE.SphereGeometry(1);
    sphereGeo.computeTangents();

    const customMat = new THREE.ShaderMaterial({
        vertexShader: diffuseIrradianceVert,
        fragmentShader: diffuseIrradianceFrag,
        defines: {
            USE_TANGENT: true,
        },
        uniforms: {
            albedo: {
                value: [0.5, 0.0, 0.0],
            },
            metallic: {
                value: 0,
            },
            roughness: {
                value: 0.1,
            },
            ao: {
                value: 1,
            },
            pointLights: {
                value: [
                    {
                        position: [-10.0, 10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                    {
                        position: [10.0, 10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                    {
                        position: [-10.0, -10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                    {
                        position: [10.0, -10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                ],
            },
            irradianceMap: {
                value: null,
            },
        },
    });
    initScene(scene);
    const sphereMesh = new THREE.Mesh(sphereGeo, customMat);

    const ballGroup = generateSphereGrid(sphereMesh);
    scene.add(ballGroup);
    mainCamera.position.z = 3;

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    let rfId = -1;
    let globalTime = 0;
    mainCamera.lookAt(0, 0, 0);

    renderer.autoClear = false;

    const hdrLoader = new RGBELoader();
    const hdrTexture = await hdrLoader.loadAsync(
        withBase('img/poly_haven_studio_1k.hdr')
    );
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

    const renderEnvMap = () => {
        const customBackground = new CustomBackground(
            irradianceVert,
            irradianceFrag
        );
        const renderIrradianceCubeScene = new THREE.Scene();
        renderIrradianceCubeScene.add(customBackground.mesh);
        tempCubeRT.fromEquirectangularTexture(renderer, hdrTexture);
        customBackground.setCubeTexture(tempCubeRT.texture);

        cubeCamera.update(renderer, renderIrradianceCubeScene);
        prefilterCams.forEach(item => {
            item.update(renderer, renderIrradianceCubeScene);
        });
    };
    renderEnvMap();
    scene.background = prefilterRTs[5].texture;

    // update ball material texture
    for (let i = 0; i < ballGroup.children.length; i++) {
        const mesh = ballGroup.children[i] as THREE.Mesh;
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.irradianceMap.value = prefilterRTs[0].texture;
    }

    const mainLoop = () => {
        globalTime += 0.1;
        controls.update();

        renderer.render(scene, mainCamera);

        requestAnimationFrame(mainLoop);
    };
    const viewPosition = new THREE.Vector3(-11.56, 7.839, 20.215);
    const viewQuat = new THREE.Quaternion(-0.156, -0.253, -0.041, 0.953);

    mainCamera.position.copy(viewPosition);
    mainCamera.setRotationFromQuaternion(viewQuat);

    const cancel = () => {
        cancelAnimationFrame(rfId);
    };

    return {
        mainLoop,
        cancel,
    };
}

export type ReturnType = {
    mainLoop: () => void;
    cancel: () => void;
};
