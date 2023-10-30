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
    Vector3,
    Camera,
    Quaternion,
    Matrix3,
    Matrix4,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import screenVert from './shaders/screenPos.vert.three';
import screenFrag from './shaders/screenPos.frag.three';

import { loadImage } from '../webgl/util';
import { withBase } from 'vitepress';

const OFFSET_Y = -1.0;
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

function getMirrorPoint(n: Vector3, p: Vector3, m: Vector3): Vector3 {
    const v = m.clone();
    v.sub(p);
    const normalizedN = n.clone().normalize();
    const dist = v.dot(normalizedN);
    const mirrorPoint = m.clone();

    mirrorPoint.sub(normalizedN.multiplyScalar(2 * dist));

    return mirrorPoint;
}

function getMirrorVector(n: Vector3, v: Vector3): Vector3 {
    const mirrorVec = v.clone();
    const normalizedN = n.clone().normalize();
    const dist = v.dot(normalizedN);

    mirrorVec.sub(normalizedN.multiplyScalar(2 * dist));
    return mirrorVec;
}

function setReflectionCamera(mainCamera: Camera, reflectionCamera: Camera) {
    var cameraPosition = mainCamera.position.clone();
    const mirrorPos = getMirrorPoint(
        new Vector3(0, 1, 0),
        new Vector3(0, OFFSET_Y, 0),
        cameraPosition
    );

    reflectionCamera.position.set(mirrorPos.x, mirrorPos.y, mirrorPos.z);

    reflectionCamera.lookAt(new Vector3(0, 2 * OFFSET_Y, 0));
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

    const rt = new WebGLRenderTarget(canvas.width, canvas.height);
    const noiseTex = await getTexture(
        withBase('img/textures/noise_a.jpg'),
        true
    );
    const mainTex = await getTexture(
        withBase('img/textures/Brick_Diffuse.JPG')
    );

    const mainCamera = new PerspectiveCamera(fov, aspect, near, far);
    const reflectCamera = mainCamera.clone();
    const postCamera = mainCamera.clone();

    mainCamera.layers.disable(POST_LAYER);
    postCamera.layers.disable(DEFAULT_LAYER);
    postCamera.layers.enable(POST_LAYER);

    const light = new DirectionalLight(0xffffff);

    const cubeGeo = new BoxGeometry(1, 1, 1);
    const planeGeo = new PlaneGeometry(3, 3);

    const phongMat = new MeshBasicMaterial({
        color: 0xeeeeee,
        map: mainTex,
    });
    const mat2 = new MeshBasicMaterial({
        color: 0xffffff,
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
    });

    const cubeMesh = new Mesh(cubeGeo, phongMat);
    const screenPlaneMesh = new Mesh(planeGeo, mat2);

    screenPlaneMesh.position.set(0, OFFSET_Y, 0);
    screenPlaneMesh.rotateX(-Math.PI / 2);
    // screenPlaneMesh.layers.set(POST_LAYER);

    scene.add(light);
    scene.add(screenPlaneMesh);
    scene.add(cubeMesh);
    mainCamera.position.z = 2;
    postCamera.position.z = 2;
    reflectCamera.position.z = 2;

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    let rfId = -1;
    let globalTime = 0;
    mainCamera.lookAt(0, 0, 0);

    renderer.autoClear = false;

    const mainLoop = () => {
        globalTime += 0.1;
        screenMat.uniforms.time.value = globalTime;
        setReflectionCamera(mainCamera, reflectCamera);

        controls.update();

        // renderer.setRenderTarget(rt);
        scene.background = new Color(0xff6600);
        // renderer.clear();
        // renderer.render(scene, mainCamera);

        renderer.setRenderTarget(null);
        // scene.background = new Color(0xcccccc);

        // renderer.render(scene, mainCamera);
        renderer.render(scene, reflectCamera);

        // scene.background = null;
        // renderer.render(scene, postCamera);

        // renderer.clearDepth();

        requestAnimationFrame(mainLoop);
    };

    //#endregion snippet
    const cancel = () => {
        cancelAnimationFrame(rfId);
    };

    window.main = mainCamera;

    return {
        mainLoop,
        cancel,
    };
}

export type ReturnType = {
    mainLoop: () => void;
    cancel: () => void;
};
