import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    Object3D,
    TorusGeometry,
    MeshPhongMaterial,
    Mesh,
    DirectionalLight,
    ShaderMaterial,
} from 'three';

import helloVert from './shaders/hello.vert.three';
import helloFrag from './shaders/hello.frag.three';

export function main(): ReturnType {
    //#region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const scene = new Scene();
    const camera = new PerspectiveCamera(
        75,
        canvas.width / canvas.height,
        0.1,
        1000
    );
    camera.position.z = 3.5;

    const renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
    const root = new Object3D();
    const quadGeo = new TorusGeometry();
    const mat = new ShaderMaterial({
        vertexShader: helloVert,
        fragmentShader: helloFrag,
    });
    const mesh = new Mesh(quadGeo, mat);
    mesh.rotateX(65);
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
