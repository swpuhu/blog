import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    Object3D,
    Mesh,
    ShaderMaterial,
    Texture,
    PlaneGeometry,
    CubeTexture,
    Matrix3,
    Vector3,
    BoxGeometry,
    BackSide,
    FrontSide,
    DoubleSide,
} from 'three';

import envVert from './shaders/envmap.vert.three';
import envFrag from './shaders/envmap.frag.three';
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
    const root = new Object3D();
    const quadGeo = new BoxGeometry(1, 1, 1);

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
    quadGeo.deleteAttribute('normal');
    quadGeo.deleteAttribute('uv');
    const mesh = new Mesh(quadGeo, mat);
    scene.add(mesh);

    mesh.onBeforeRender = function (this: Mesh, renderer, scene, camera) {
        this.matrixWorld.copyPosition(camera.matrixWorld);
    };

    scene.add(root);
    // scene.background = cubeTexture;

    // camera.lookAt(1, 0, 0);
    camera.position.z = 1.5;
    let rfId = -1;
    const mainLoop = () => {
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
