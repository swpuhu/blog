import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    Object3D,
    Mesh,
    ShaderMaterial,
    Texture,
    CubeTexture,
    BoxGeometry,
    BackSide,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import envVert from './shaders/envmap.vert.glsl';
import envFrag from './shaders/envmap.frag.glsl';
import { loadImage, loadImages } from '../webgl/util';
import { withBase } from 'vitepress';

async function getTexture(url: string): Promise<Texture> {
    const img = await loadImage(url);
    const tex = new Texture(img);
    tex.needsUpdate = true;
    return tex;
}

export async function main(): Promise<ReturnType> {
    //#region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        45,
        canvas.width / canvas.height,
        0.1,
        1000
    );

    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
    const boxGeo = new BoxGeometry(1, 1, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;

    const imgs = await loadImages([
        withBase('img/three-example/envmap/posx.jpg'),
        withBase('img/three-example/envmap/negx.jpg'),
        withBase('img/three-example/envmap/posy.jpg'),
        withBase('img/three-example/envmap/negy.jpg'),
        withBase('img/three-example/envmap/posz.jpg'),
        withBase('img/three-example/envmap/negz.jpg'),
    ]);
    const cubeTexture = new CubeTexture(imgs);
    cubeTexture.needsUpdate = true;

    const mat = new ShaderMaterial({
        vertexShader: envVert,
        fragmentShader: envFrag,
        uniforms: {
            flipEnvMap: {
                value: -1,
            },
            envMap: {
                value: cubeTexture,
            },
            backgroundBlurriness: {
                value: 0,
            },
            backgroundIntensity: {
                value: 1,
            },
        },
        side: BackSide,
        depthTest: false,
        depthWrite: false,
        fog: false,
    });
    boxGeo.deleteAttribute('normal');
    boxGeo.deleteAttribute('uv');
    const mesh = new Mesh(boxGeo, mat);
    scene.add(mesh);

    mesh.onBeforeRender = function (this: Mesh, renderer, scene, camera) {
        this.matrixWorld.copyPosition(camera.matrixWorld);
    };

    camera.position.z = 1;
    let rfId = -1;
    const mainLoop = () => {
        controls.update();
        renderer.render(scene, camera);
        rfId = requestAnimationFrame(mainLoop);
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
