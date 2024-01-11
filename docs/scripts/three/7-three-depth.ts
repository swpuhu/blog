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
    WebGLRenderTarget,
    RepeatWrapping,
    MeshBasicMaterial,
    Color,
    DoubleSide,
    Material,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import depthVertShader from './shaders/depth.vert.glsl';
import depthFragShader from './shaders/depth.frag.glsl';
import waterFragShader from './shaders/water.frag.glsl';

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

async function initScene(
    basicMat: Material,
    cubeMat: Material
): Promise<[Scene, Mesh, Mesh, Mesh, Mesh, Mesh, Mesh]> {
    const scene = new Scene();

    const waterGeo = new PlaneGeometry(10, 10);

    const cubeGeo = new BoxGeometry(1, 1, 10);

    const directionLight = new DirectionalLight(0xffffff);

    const cubeMesh1 = new Mesh(cubeGeo, cubeMat);
    const cubeMesh2 = cubeMesh1.clone();
    const cubeMesh3 = cubeMesh1.clone();
    const cubeMesh4 = cubeMesh1.clone();

    const centerCube = cubeMesh1.clone();
    centerCube.scale.set(2, 2, 0.2);
    centerCube.rotateX(1);
    centerCube.rotateY(1);
    centerCube.translateY(-0.8);

    cubeMesh1.translateX(-5);
    cubeMesh2.translateX(5);
    cubeMesh3.rotateY(Math.PI / 2);
    cubeMesh4.rotateY(Math.PI / 2);
    cubeMesh3.translateX(-5);
    cubeMesh4.translateX(5);

    const waterMesh = new Mesh(waterGeo, basicMat);
    waterMesh.rotateX(-Math.PI / 2);
    scene.add(directionLight);

    scene.add(cubeMesh1);
    scene.add(cubeMesh2);
    scene.add(cubeMesh3);
    scene.add(cubeMesh4);
    scene.add(waterMesh);
    scene.add(centerCube);
    return [
        scene,
        waterMesh,
        cubeMesh1,
        cubeMesh2,
        cubeMesh3,
        cubeMesh4,
        centerCube,
    ];
}

export async function main(): Promise<ReturnType> {
    //#region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const fov = 45;
    const near = 1;
    const far = 50;
    const aspect = canvas.width / canvas.height;

    const DEFAULT_LAYER = 0;
    const POST_LAYER = 1;

    const depthRt = new WebGLRenderTarget(512, 512);
    const noiseTex = await getTexture(
        withBase('img/textures/noise_a.jpg'),
        true
    );

    const depthMat = new ShaderMaterial({
        vertexShader: depthVertShader,
        fragmentShader: depthFragShader,
        uniforms: {
            uFar: {
                value: far,
            },
            uNear: {
                value: near,
            },
        },
    });

    const fullScreenMat = new ShaderMaterial({
        vertexShader: depthVertShader,
        fragmentShader: waterFragShader,
        uniforms: {
            mainTex: {
                value: depthRt.texture,
            },
        },
    });

    const waterMat = new ShaderMaterial({
        vertexShader: depthVertShader,
        fragmentShader: waterFragShader,
        uniforms: {
            depthTex: {
                value: depthRt.texture,
            },
            uFar: {
                value: far,
            },
            uNear: {
                value: near,
            },
            noiseTex: {
                value: noiseTex,
            },
            uTime: {
                value: 0,
            },
        },
    });

    const basicMat = new MeshBasicMaterial({
        color: 0x0066ff,
        side: DoubleSide,
    });
    const mainTex = await getTexture(
        withBase('img/textures/Brick_Diffuse.JPG')
    );
    const cubeMat = new MeshBasicMaterial({
        color: 0xffffff,
        map: mainTex,
    });

    const [
        scene,
        waterMesh,
        cubeMesh1,
        cubeMesh2,
        cubeMesh3,
        cubeMesh4,
        centerCube,
    ] = await initScene(waterMat, depthMat);
    const renderer = new WebGLRenderer({ antialias: true, canvas });

    const mainCamera = new PerspectiveCamera(fov, aspect, near, far);

    // screenPlaneMesh.layers.set(POST_LAYER);
    mainCamera.position.z = 2;

    mainCamera.position.set(3.7, 5.7, 4.89);

    mainCamera.quaternion.set(-0.34, 0.298, 0.11, 0.88);

    const planeGeo = new PlaneGeometry(5, 5);
    const fullScreenMesh = new Mesh(planeGeo, fullScreenMat);
    fullScreenMesh.position.set(0, 5, 0);

    // scene.add(fullScreenMesh);

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    let rfId = -1;
    let globalTime = 0;
    mainCamera.lookAt(0, 0, 0);

    renderer.autoClear = false;

    const mainLoop = () => {
        globalTime += 0.1;

        controls.update();
        scene.background = new Color(0xffffff);
        waterMat.uniforms.uTime.value = globalTime;

        renderer.setRenderTarget(depthRt);
        cubeMesh1.material = depthMat;
        cubeMesh2.material = depthMat;
        cubeMesh3.material = depthMat;
        cubeMesh4.material = depthMat;
        centerCube.material = depthMat;
        waterMesh.visible = false;
        fullScreenMesh.visible = false;
        renderer.render(scene, mainCamera);

        renderer.setRenderTarget(null);
        cubeMesh1.material = cubeMat;
        cubeMesh2.material = cubeMat;
        cubeMesh3.material = cubeMat;
        cubeMesh4.material = cubeMat;
        centerCube.material = cubeMat;
        scene.background = new Color(0xcccccc);

        waterMesh.visible = true;
        fullScreenMesh.visible = true;

        renderer.render(scene, mainCamera);
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
