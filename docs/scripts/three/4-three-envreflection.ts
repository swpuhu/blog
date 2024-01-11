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
    PlaneGeometry,
    Vector3,
    FrontSide,
    MeshBasicMaterial,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import envVert from './shaders/envmap.vert.glsl';
import envFrag from './shaders/envmap.frag.glsl';

import envReflectionVert from './shaders/envReflection.vert.glsl';
import envReflectionFrag from './shaders/envReflection.frag.glsl';
import { loadImage, loadImages } from '../webgl/util';
import { withBase } from 'vitepress';
import { DoubleSide } from 'three';

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

    const planeGeo = new BoxGeometry(1, 1, 1);
    // planeGeo.rotateX(-Math.PI / 2);
    // planeGeo.translate(0, -1, 0);

    // camera.translateY(1);
    // camera.translateZ(2);
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.autoRotate = true;

    const imgs = await loadImages([
        // withBase('img/three-example/envmap-2/right.jpg'),
        // withBase('img/three-example/envmap-2/left.jpg'),
        // withBase('img/three-example/envmap-2/top.jpg'),
        // withBase('img/three-example/envmap-2/bottom.jpg'),
        // withBase('img/three-example/envmap-2/front.jpg'),
        // withBase('img/three-example/envmap-2/back.jpg'),
        withBase('img/three-example/envmap/posx.jpg'),
        withBase('img/three-example/envmap/negx.jpg'),
        withBase('img/three-example/envmap/posy.jpg'),
        withBase('img/three-example/envmap/negy.jpg'),
        withBase('img/three-example/envmap/posz.jpg'),
        withBase('img/three-example/envmap/negz.jpg'),
    ]);
    const cubeTexture = new CubeTexture(imgs);
    cubeTexture.needsUpdate = true;
    const standardMat = new MeshBasicMaterial({
        envMap: cubeTexture,
    });
    const mat = new ShaderMaterial({
        vertexShader: envVert,
        fragmentShader: envFrag,
        uniforms: {
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

    const mat2 = new ShaderMaterial({
        vertexShader: envReflectionVert,
        fragmentShader: envReflectionFrag,
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
        side: FrontSide,
    });

    boxGeo.deleteAttribute('normal');
    boxGeo.deleteAttribute('uv');
    const mesh = new Mesh(boxGeo, mat);
    // scene.add(mesh);
    const mesh2 = new Mesh(planeGeo, standardMat);
    const mesh3 = new Mesh(planeGeo, mat2);
    mesh2.position.x = 0;
    // scene.add(mesh2);
    scene.add(mesh3);

    mesh.onBeforeRender = function (this: Mesh, renderer, scene, camera) {
        this.matrixWorld.copyPosition(camera.matrixWorld);
    };

    camera.position.z = 2;
    let rfId = -1;
    const mainLoop = () => {
        controls.update();
        renderer.render(scene, camera);
        rfId = requestAnimationFrame(mainLoop);
        planeGeo.rotateX(0.001);
        planeGeo.rotateY(0.001);
        planeGeo.rotateZ(0.001);
        // console.log(camera.position);
    };

    //#endregion snippet
    let rX = 0;
    let rY = 0;
    let rZ = 0;
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
