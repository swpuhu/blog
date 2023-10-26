import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    Mesh,
    ShaderMaterial,
    Texture,
    BoxGeometry,
    DirectionalLight,
    PlaneGeometry,
    DoubleSide,
    WebGLRenderTarget,
    RepeatWrapping,
    MeshBasicMaterial,
    RGBAFormat,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import screenVert from './shaders/screenPos.vert.three';
import screenFrag from './shaders/screenPos.frag.three';

import { loadImage } from '../webgl/util';
import { withBase } from 'vitepress';

async function getTexture(url: string, repeat = false): Promise<Texture> {
    const img = await loadImage(url);
    const tex = new Texture(
        img,
        undefined,
        repeat ? RepeatWrapping : undefined,
        repeat ? RepeatWrapping : undefined
    );
    tex.needsUpdate = true;
    return tex;
}

export async function main(): Promise<ReturnType> {
    //#region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const fov = 45;
    const near = 0.1;
    const far = 1000;
    const aspect = canvas.width / canvas.height;

    const DEFAULT_LAYER = 0;
    const POST_LAYER = 1;

    const scene = new Scene();
    const renderer = new WebGLRenderer({ antialias: true, canvas });

    const rt = new WebGLRenderTarget(canvas.width, canvas.height, {
        format: RGBAFormat,
    });
    const noiseTex = await getTexture(
        withBase('img/textures/noise_a.jpg'),
        true
    );
    const mainTex = await getTexture(
        withBase('img/textures/Brick_Diffuse.JPG')
    );

    const mainCamera = new PerspectiveCamera(fov, aspect, near, far);
    const postCamera = mainCamera.clone();

    mainCamera.layers.disable(POST_LAYER);
    postCamera.layers.disable(DEFAULT_LAYER);
    postCamera.layers.enable(POST_LAYER);

    const light = new DirectionalLight(0xffffff);

    const cubeGeo = new BoxGeometry(1, 1, 1);
    const planeGeo = new PlaneGeometry(2, 2);

    const phongMat = new MeshBasicMaterial({
        color: 0xffffff,
        map: mainTex,
    });
    const screenMat = new ShaderMaterial({
        vertexShader: screenVert,
        fragmentShader: screenFrag,
        depthTest: false,
        uniforms: {
            mainTex: {
                value: rt.texture,
            },
            noiseTex: {
                value: noiseTex,
            },
            time: {
                value: 1,
            },
        },
        side: DoubleSide,
    });

    const cubeMesh = new Mesh(cubeGeo, phongMat);
    const screenPlaneMesh = new Mesh(planeGeo, screenMat);
    screenPlaneMesh.position.set(1, 0, 0);

    screenPlaneMesh.layers.set(POST_LAYER);

    scene.add(light);
    scene.add(screenPlaneMesh);
    scene.add(cubeMesh);
    mainCamera.position.z = 2;
    postCamera.position.z = 2;

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    let rfId = -1;
    let globalTime = 0;

    renderer.autoClear = false;
    const mainLoop = () => {
        globalTime += 0.1;
        screenMat.uniforms.time.value = globalTime;
        controls.update();

        renderer.setRenderTarget(rt);
        renderer.clear();
        renderer.render(scene, mainCamera);

        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(scene, mainCamera);
        renderer.clearDepth();
        renderer.render(scene, postCamera);

        requestAnimationFrame(mainLoop);
    };

    //#endregion snippet
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
