import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    Object3D,
    Mesh,
    ShaderMaterial,
    Texture,
    BoxGeometry,
    DirectionalLight,
    Vector3,
    ConeGeometry,
} from 'three';

import normalVert from './shaders/normal.vert.glsl';
import normalFrag from './shaders/normal.frag.glsl';
import { loadImage } from '../webgl/util';
import { withBase } from 'vitepress';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// github test
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
    camera.position.z = 5.5;

    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
    const root = new Object3D();
    const quadGeo = new ConeGeometry(1, 2);
    quadGeo.computeTangents();

    const tempVec3 = new Vector3();
    const light = new DirectionalLight(0xffffff);
    light.position.x = 0;
    light.position.y = 0;
    light.position.z = 2;
    light.target = root;
    light.updateMatrixWorld();
    light.getWorldPosition(tempVec3);

    scene.add(light);

    const mainTexURL = withBase('img/textures/Brick_Diffuse.JPG');
    const normalTexURL = withBase('img/textures/Brick_Normal.JPG');
    const mainTex = await getTexture(mainTexURL);
    const normalTex = await getTexture(normalTexURL);
    const mat = new ShaderMaterial({
        vertexShader: normalVert,
        fragmentShader: normalFrag,
        uniforms: {
            mainTex: {
                value: mainTex,
            },
            normalTex: {
                value: normalTex,
            },
            directionalLight: {
                value: {
                    direction: tempVec3.normalize(),
                    color: light.color,
                },
            },
        },
        defines: {
            USE_TANGENT: true,
        },
    });
    const mesh = new Mesh(quadGeo, mat);

    mesh.rotateX((30 / 180) * Math.PI);
    mesh.rotateY((45 / 180) * Math.PI);
    root.add(mesh);

    scene.add(root);

    let rfId = -1;
    const controls = new OrbitControls(camera, renderer.domElement);
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
