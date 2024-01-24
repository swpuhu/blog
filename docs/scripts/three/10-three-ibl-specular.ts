import * as THREE from 'three';
import diffuseIrradianceVert from '../three/shaders/diffuseIrradinace.vert.glsl';
import pbrFrag from '../three/shaders/pbr.frag.glsl';
import cubeMapVert from '../three/shaders/cubemap.vert.glsl';
import irradianceFrag from '../three/shaders/irradiance.frag.glsl';
import prefilterFrag from '../three/shaders/prefilter.frag.glsl';
import brdfFrag from '../three/shaders/brdf.frag.glsl';
import brdfVert from '../three/shaders/brdf.vert.glsl';
import debugPrefilterFrag from '../three/shaders/debugPrefilter.frag.glsl';
import normalVert from '../three/shaders/normalVert.vert.glsl';

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

    const prefilterRTSize = 512;
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
        fragmentShader: pbrFrag,
        defines: {
            USE_TANGENT: true,
        },
        uniforms: {
            albedo: {
                value: [0.5, 0.5, 0.5],
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
                        color: [0.0, 0.0, 0.0],
                    },
                    {
                        position: [10.0, 10.0, 10.0],
                        color: [0.0, 0.0, 0.0],
                    },
                    {
                        position: [-10.0, -10.0, 10.0],
                        color: [0.0, 0.0, 0.0],
                    },
                    {
                        position: [10.0, -10.0, 10.0],
                        color: [0.0, 0.0, 0.0],
                    },
                ],
            },
            irradianceMap: {
                value: null,
            },
            prefilterMap: {
                value: null,
            },
            brdfLUT: {
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
        withBase('img/hdr/buikslotermeerplein_2k.hdr')
    );
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

    const renderEnvMap = () => {
        const prefilterCustomBg = new CustomBackground(
            cubeMapVert,
            prefilterFrag,
            'prefilterBg'
        );
        const prefilterScene = new THREE.Scene();
        prefilterScene.add(prefilterCustomBg.mesh);

        tempCubeRT.fromEquirectangularTexture(renderer, hdrTexture);

        prefilterCustomBg.setCubeTexture(tempCubeRT.texture);
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

        const customBackground = new CustomBackground(
            cubeMapVert,
            irradianceFrag,
            'customBg'
        );

        customBackground.setCubeTexture(tempCubeRT.texture);
        const renderIrradianceCubeScene = new THREE.Scene();
        renderIrradianceCubeScene.add(customBackground.mesh);
        cubeCamera.update(renderer, renderIrradianceCubeScene);
    };

    // calculate brdf integration

    scene.background = hdrTexture;

    const brdfRT = new THREE.WebGLRenderTarget(512, 512, {
        type: THREE.FloatType,
    });
    let brdfScene: THREE.Scene;
    const renderBRDF = () => {
        const brdfMat = new THREE.ShaderMaterial({
            vertexShader: brdfVert,
            fragmentShader: brdfFrag,
        });
        const quadGeo = new THREE.PlaneGeometry(2, 2);
        const fullScreen = new THREE.Mesh(quadGeo, brdfMat);
        brdfScene = new THREE.Scene();
        brdfScene.add(fullScreen);
        renderer.setRenderTarget(brdfRT);
        renderer.render(brdfScene, mainCamera);
        renderer.setRenderTarget(null);
    };

    renderEnvMap();
    renderBRDF();

    // update ball material texture
    for (let i = 0; i < ballGroup.children.length; i++) {
        const mesh = ballGroup.children[i] as THREE.Mesh;
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.irradianceMap.value = irradianceRT.texture;
        mat.uniforms.prefilterMap.value = preFilterMipmapRT.texture;
        mat.uniforms.brdfLUT.value = brdfRT.texture;
    }
    let debugScene: THREE.Scene;
    const debugPreFilterMipMap = () => {
        debugScene = new THREE.Scene();
        const mat = new THREE.ShaderMaterial({
            vertexShader: normalVert,
            fragmentShader: debugPrefilterFrag,
            uniforms: {
                envMap: {
                    value: preFilterMipmapRT.texture,
                },
                uLevel: {
                    value: 3,
                },
            },
        });
        const geo = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geo, mat);
        debugScene.add(mesh);
        renderer.render(debugScene, mainCamera);
    };

    debugPreFilterMipMap();

    // debugPreFilterMipMap();

    const mainLoop = () => {
        globalTime += 0.1;
        controls.update();

        renderer.render(scene, mainCamera);
        // renderer.render(debugScene, mainCamera);
        // renderer.render(brdfScene, mainCamera);

        requestAnimationFrame(mainLoop);
    };
    // const viewPosition = new THREE.Vector3(-11.56, 7.839, 20.215);
    const viewPosition = new THREE.Vector3(-5.67, 4.09, 22.8973);
    const viewQuat = new THREE.Quaternion(-0.082, -0.102, -0.00848, 0.9913);

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
