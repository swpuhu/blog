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

import normalVert from './shaders/normal.vert.three';
import normalFrag from './shaders/normal.frag.three';
import { loadImage } from '../webgl/util';
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
    camera.position.z = 5.5;

    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
    const root = new Object3D();
    const tempVec3 = new Vector3();
    root.getWorldDirection(tempVec3);
    const quadGeo = new ConeGeometry(1, 2);
    quadGeo.computeTangents();
    const light = new DirectionalLight(0xffffff);
    light.position.x = 2;
    light.position.y = 2;
    light.target = root;

    scene.add(light);

    const mainTexURL = withBase('img/textures/Brick_Diffuse.JPG');
    const normalTexURL = withBase('img/textures/Brick_Normal.JPG');
    const mainTex = await getTexture(mainTexURL);
    const normalTex = await getTexture(normalTexURL);
    const mat = new ShaderMaterial({
        vertexShader: normalVert,
        fragmentShader: normalFrag,
        uniforms: {
            // mainTex: {
            //     value: mainTex,
            // },
            // normalTex: {
            //     value: normalTex,
            // },
            // directionalLights: {
            //     value: [
            //         {
            //             direction: tempVec3,
            //             color: light.color,
            //         },
            //     ],
            // },
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
