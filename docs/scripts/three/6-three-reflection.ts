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
    Vector3,
    Quaternion,
    DoubleSide,
    Object3D,
    MeshMatcapMaterial,
    ConeGeometry,
    Matrix4,
    Color,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

import screenVert from './shaders/screenPos.vert.three';
import screenFrag from './shaders/screenReflectPos.frag.three';

import {
    fromViewUp,
    getMirrorPoint,
    getMirrorVector,
    loadImage,
    lookAt,
    setReflection2,
} from '../webgl/util';
import { withBase } from 'vitepress';

const OFFSET_Y = 0.6;
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

function setReflection(
    m1: Object3D,
    m2: Object3D,
    n: Vector3,
    reflectorWorldPosition: Vector3
): void {
    const originPos = m1.position;
    const reflectPos = getMirrorPoint(originPos, n, reflectorWorldPosition);

    m2.position.copy(reflectPos);

    const rotationMatrix = new Matrix4();
    rotationMatrix.extractRotation(m1.matrixWorld);

    const m1WorldPosition = new Vector3();
    m1WorldPosition.setFromMatrixPosition(m1.matrixWorld);

    const lookAtPosition = new Vector3(0, 0, -1);
    lookAtPosition.applyMatrix4(rotationMatrix);
    lookAtPosition.add(m1WorldPosition);

    const target2 = getMirrorPoint(lookAtPosition, n, reflectorWorldPosition);

    m2.position.copy(reflectPos);
    m2.up.set(0, 1, 0);
    m2.up.applyMatrix4(rotationMatrix);
    m2.up.reflect(n);
    m2.lookAt(target2);
}

function buildVirtualCameraModel(): Object3D {
    const size = 0.05;
    const centerGeo = new BoxGeometry(0.2, 0.2, 0.2);
    const xGeo = new BoxGeometry(1, size, size);
    const coneGeo = new ConeGeometry(size * 1.8, size * 3.6);
    const yGeo = new BoxGeometry(size, 1, size);
    const zGeo = new BoxGeometry(size, size, 1);
    const mat = new MeshBasicMaterial({
        color: 0xcccccc,
    });
    const xMat = new MeshMatcapMaterial({
        color: 0xff0000,
    });
    const yMat = new MeshMatcapMaterial({
        color: 0x00ff00,
    });
    const zMat = new MeshMatcapMaterial({
        color: 0x0000ff,
    });
    const centerMesh = new Mesh(centerGeo, mat);
    const xMesh = new Mesh(xGeo, xMat);
    const xConeMesh = new Mesh(coneGeo, xMat);
    const yMesh = new Mesh(yGeo, yMat);
    const yConeMesh = new Mesh(coneGeo, yMat);
    const zMesh = new Mesh(zGeo, zMat);
    const zConeMesh = new Mesh(coneGeo, zMat);

    xMesh.position.x = 0.5;
    yMesh.position.y = 0.5;
    zMesh.position.z = 0.5;
    xConeMesh.position.x = 1.02;
    xConeMesh.rotateZ(-Math.PI / 2);
    yConeMesh.position.y = 1.02;
    zConeMesh.position.z = 1.02;
    zConeMesh.rotateX(Math.PI / 2);

    centerMesh.add(xMesh);
    centerMesh.add(xConeMesh);
    centerMesh.add(yConeMesh);
    centerMesh.add(zConeMesh);
    centerMesh.add(yMesh);
    centerMesh.add(zMesh);

    return centerMesh;
}

export async function main(): Promise<ReturnType> {
    //#region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const fov = 45;
    const near = 0.1;
    const far = 1000;
    const aspect = canvas.width / canvas.height;

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

    const light = new DirectionalLight(0xffffff);

    const cubeGeo = new BoxGeometry(1, 1, 1);
    const planeGeo = new PlaneGeometry(10, 10);

    const phongMat = new MeshBasicMaterial({
        color: 0xeeeeee,
        map: mainTex,
    });
    const screenMat = new ShaderMaterial({
        vertexShader: screenVert,
        fragmentShader: screenFrag,
        uniforms: {
            mainTex: {
                value: rt.texture,
            },
            noiseTex: {
                value: null,
            },
            time: {
                value: 1,
            },
        },
        side: DoubleSide,
    });

    const cubeMesh = new Mesh(cubeGeo, phongMat);
    const screenPlaneMesh = new Mesh(planeGeo, screenMat);

    let reflectPlaneNormal = new Vector3(0, 1, 0);
    const nm = screenPlaneMesh.quaternion;
    reflectPlaneNormal = reflectPlaneNormal.applyQuaternion(nm);
    console.log(reflectPlaneNormal);

    const virtualCam = buildVirtualCameraModel();
    const virtualCam2 = virtualCam.clone();
    virtualCam.position.y = 2;
    virtualCam.position.x = 0.5;
    virtualCam.position.z = 1.5;
    virtualCam.rotation.set(-0.5, 0, 0);
    // virtualCam2.rotation.set(0.1, 1, 0.5);

    screenPlaneMesh.position.set(0, 0, -0.55);
    // screenPlaneMesh.rotateX(-Math.PI / 2);
    // screenPlaneMesh.visible = false;

    scene.add(light);
    scene.add(screenPlaneMesh);
    scene.add(cubeMesh);
    scene.add(virtualCam);
    scene.add(virtualCam2);
    mainCamera.position.z = 3;

    const refCamera = mainCamera.clone();

    cubeMesh.position.y = 1;

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    let rfId = -1;
    let globalTime = 0;
    mainCamera.lookAt(0, 0, 0);
    const q = new Quaternion(-0.13119, 0.2719, 0.037, 0.9526);
    mainCamera.position.set(2.68, 1.42, 4.313);
    mainCamera.rotation.setFromQuaternion(q);

    const reflector = new ReflectorForSSRPass(planeGeo, {
        clipBias: 0.0003,
        textureWidth: window.innerWidth,
        textureHeight: window.innerHeight,
        color: 0x888888,
        useDepthTexture: true,
    });
    reflector.material.depthWrite = false;
    // reflector.position.x = 1;
    reflector.rotation.x = -Math.PI / 3;
    reflector.visible = false;
    scene.add(reflector);

    const composer = new EffectComposer(renderer);

    const ssrPass = new SSRPass({
        renderer,
        scene,
        camera: mainCamera,
        width: innerWidth,
        height: innerHeight,
        groundReflector: reflector,
        selects: [],
    });

    composer.addPass(ssrPass);
    composer.addPass(new OutputPass());
    renderer.autoClear = false;

    const mainLoop = () => {
        globalTime += 0.1;
        controls.update();
        setReflection2(virtualCam, virtualCam2, screenPlaneMesh);
        // setReflection2(mainCamera, refCamera, screenPlaneMesh);
        scene.background = new Color(0x777777);
        // renderer.setRenderTarget(rt);
        // screenPlaneMesh.visible = false;
        // renderer.render(scene, refCamera);
        // scene.background = null;
        // renderer.setRenderTarget(null);
        // screenPlaneMesh.visible = true;
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
