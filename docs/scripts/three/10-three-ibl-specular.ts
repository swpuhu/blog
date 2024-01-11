import * as THREE from 'three';
import diffuseIrradianceVert from '../three/shaders/diffuseIrradinace.vert.glsl';
import diffuseIrradianceFrag from '../three/shaders/diffuseIrradinace.frag.glsl';
import cubeMapVert from '../three/shaders/cubemap.vert.glsl';
import cubeMipmapFrag from '../three/shaders/cubemipmap.frag.glsl';
import prefilterFrag from '../three/shaders/prefilter.frag.glsl';
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
    const mipmapCount = 6;
    const tempCubeRT = new THREE.WebGLCubeRenderTarget(irradianceRTSize);
    const mainCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const irradianceRT = new THREE.WebGLCubeRenderTarget(irradianceRTSize);

    const prefilterRTSize = 128;
    const preFilterMipmapRT = new THREE.WebGLCubeRenderTarget(prefilterRTSize, {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearMipMapLinearFilter,
        generateMipmaps: false,
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        colorSpace: THREE.LinearSRGBColorSpace,
        depthBuffer: false,
    });
    const mipLevels = Math.log2(prefilterRTSize) + 1.0;

    for (let i = 0; i < mipLevels; i++) {
        preFilterMipmapRT.texture.mipmaps.push({});
    }
    preFilterMipmapRT.texture.mapping = THREE.CubeReflectionMapping;

    const preFilterCam: THREE.CubeCamera = new THREE.CubeCamera(
        near,
        far,
        preFilterMipmapRT
    );

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

    window.camera = mainCamera;

    renderer.autoClear = false;

    const hdrLoader = new RGBELoader();
    const hdrTexture = await hdrLoader.loadAsync(
        withBase('img/poly_haven_studio_1k.hdr')
    );
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

    const renderEnvMap = () => {
        const customBackground = new CustomBackground(
            cubeMapVert,
            irradianceFrag,
            'customBg'
        );
        const prefilterCustomBg = new CustomBackground(
            cubeMapVert,
            prefilterFrag,
            'prefilterBg'
        );
        const renderIrradianceCubeScene = new THREE.Scene();
        const prefilterScene = new THREE.Scene();

        renderIrradianceCubeScene.add(customBackground.mesh);
        prefilterScene.add(prefilterCustomBg.mesh);

        tempCubeRT.fromEquirectangularTexture(renderer, hdrTexture);

        customBackground.setCubeTexture(tempCubeRT.texture);
        prefilterCustomBg.setCubeTexture(tempCubeRT.texture);
        cubeCamera.update(renderer, renderIrradianceCubeScene);
        for (let mipmap = 0; mipmap < mipmapCount; mipmap++) {
            prefilterCustomBg.setRoughness(mipmap / (mipmapCount - 1));

            preFilterMipmapRT.viewport.set(
                0,
                0,
                preFilterMipmapRT.width >> mipmap,
                preFilterMipmapRT.height >> mipmap
            );

            preFilterCam.activeMipmapLevel = mipmap;
            preFilterCam.update(renderer, prefilterScene);
        }
    };
    renderEnvMap();

    // update ball material texture
    for (let i = 0; i < ballGroup.children.length; i++) {
        const mesh = ballGroup.children[i] as THREE.Mesh;
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.irradianceMap.value = irradianceRT.texture;
        // mat.uniforms.irradianceMap.value = preFilterMipmapRT.texture;
    }
    scene.background = preFilterMipmapRT.texture;

    const debugPreFilterMipMap = () => {
        // const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        // const mat = new THREE.MeshMatcapMaterial({
        //     color: 0xff6600,
        // });
        // const mesh = new THREE.Mesh(boxGeo, mat);
        const bg = new CustomBackground(
            cubeMapVert,
            cubeMipmapFrag,
            'a',
            false
        );
        const mesh = bg.mesh;
        bg.setCubeTexture(preFilterMipmapRT.texture);
        scene.add(mesh);
        mesh.position.set(10.0, 0.0, 0.0);
    };

    debugPreFilterMipMap();

    const mainLoop = () => {
        globalTime += 0.1;
        controls.update();

        renderer.render(scene, mainCamera);

        requestAnimationFrame(mainLoop);
    };
    // const viewPosition = new THREE.Vector3(-11.56, 7.839, 20.215);
    const viewPosition = new THREE.Vector3(13.9, 3.73, 4.18);
    const viewQuat = new THREE.Quaternion(-0.253, 0.4, 0.11, 0.872);

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
