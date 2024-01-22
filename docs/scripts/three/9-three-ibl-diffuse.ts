import {
    Scene,
    WebGLRenderer,
    PerspectiveCamera,
    Mesh,
    ShaderMaterial,
    DirectionalLight,
    Quaternion,
    SphereGeometry,
} from 'three';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

import { clamp } from '../webgl/util';
import { withBase } from 'vitepress';
import { CustomBackground } from './CustomBackground';
import cubeMapVert from '../three/shaders/cubemap.vert.glsl';
import irradianceFrag from '../three/shaders/irradiance.frag.glsl';

const vertGlsl = /* glsl */ `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vTangent;
    varying vec3 vBitangent;
    varying vec3 vWorldPosition;
    void main () {
        vUv = uv;
        vec3 worldNormal = normalize ( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
        vNormal = worldNormal;

        vec3 transformedTangent = (modelViewMatrix * vec4(tangent.xyz, 0.0)).xyz;
        vTangent = normalize( transformedTangent );
        vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

        vec4 mvPosition = vec4(position, 1.0);
        mvPosition = modelViewMatrix * mvPosition;

        vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragGlsl = /* glsl */ `
#include <common>
#include <lights_pars_begin>
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}
float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float num   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float num   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return num / denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}  

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform vec3  albedo;
    uniform float metallic;
    uniform float roughness;
    uniform float ao;
    uniform samplerCube irradianceMap;


    void main () {
        vec3 N = normalize(vNormal);
        vec3 V = normalize(cameraPosition - vWorldPosition);
        vec3 F0 = vec3(0.04);
        F0 = mix(F0, albedo, metallic);
        vec3 Lo = vec3(0.0);

        vec3 WorldPos = vWorldPosition;
        PointLight pointLight;
        for ( int i = 0; i < 4; i ++ ) {

            pointLight = pointLights[ i ];

            // calculate per-light radiance
            vec3 L = normalize(pointLight.position - WorldPos);
            vec3 H = normalize(V + L);
            float distance    = length(pointLight.position - WorldPos);
            float attenuation = 1.0 / (distance * distance);
            vec3 radiance     = pointLight.color * attenuation;

            // cook-torrance brdf
            float NDF = DistributionGGX(N, H, roughness);
            float G   = GeometrySmith(N, V, L, roughness);
            vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);

            vec3 kS = F;
            vec3 kD = vec3(1.0) - kS;
            kD *= 1.0 - metallic;

            vec3 nominator    = NDF * G * F;
            float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
            vec3 specular     = nominator / denominator;

            // add to outgoing radiance Lo
            float NdotL = max(dot(N, L), 0.0);
            Lo += (kD * albedo / PI + specular) * radiance * NdotL;
            // Lo += N;

        }
        vec3 kS = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness); 
        vec3 kD = 1.0 - kS;
        vec3 irradiance = textureCube(irradianceMap, N).rgb;
        vec3 diffuse = irradiance * albedo;
        vec3 ambient = kD * diffuse * ao;
        // ambient = vec3(0.03, 0.0, 0.0);
        vec3 color = ambient + Lo;

        color = color / (color + vec3(1.0));
        color = pow(color, vec3(1.0/2.2));
        gl_FragColor = vec4(color, 1.0);
    }
`;

function generateSphereGrid(scene: Scene, mesh: Mesh): THREE.Group {
    const rows = 7;
    const cols = 7;
    const spacing = 2.5;
    const group = new THREE.Group();
    for (let y = 0; y < rows; y++) {
        const metallic = clamp(y / rows, 0.05, 1.0);
        for (let x = 0; x < cols; x++) {
            const m = mesh.clone();
            if (mesh.material instanceof ShaderMaterial) {
                m.material = mesh.material.clone();
                (m.material as ShaderMaterial).uniforms.roughness.value = clamp(
                    x / cols,
                    0.05,
                    1.0
                );
                (m.material as ShaderMaterial).uniforms.metallic.value =
                    metallic;
            }
            const posX = (x - Math.floor(cols / 2)) * spacing;
            const posY = (y - Math.floor(rows / 2)) * spacing;

            m.position.x = posX;
            m.position.y = posY;
            group.add(m);
        }
    }
    return group;
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

    const cubeRTSize = 64;
    const mainCamera = new PerspectiveCamera(fov, aspect, near, far);

    const light = new DirectionalLight(0xffffff);
    const sphereGeo = new SphereGeometry(1);
    sphereGeo.computeTangents();
    // sphereGeo.computeVertexNormals();

    // const mat = new MeshMatcapMaterial({
    //     color: 0xffffff,
    // });

    const customMat = new ShaderMaterial({
        vertexShader: vertGlsl,
        fragmentShader: fragGlsl,
        defines: {
            USE_TANGENT: true,
        },
        uniforms: {
            albedo: {
                value: [0.5, 0.0, 0.0],
            },
            metallic: {
                value: 0,
            },
            roughness: {
                value: 0.1,
            },
            ao: {
                value: 1,
            },
            pointLights: {
                value: [
                    {
                        position: [-10.0, 10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                    {
                        position: [10.0, 10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                    {
                        position: [-10.0, -10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                    {
                        position: [10.0, -10.0, 10.0],
                        color: [300.0, 300.0, 300.0],
                    },
                ],
            },
            irradianceMap: {
                value: null,
            },
        },
    });

    const sphereMesh = new Mesh(sphereGeo, customMat);

    const light1 = new THREE.PointLight(0xff0040, 400);
    scene.add(light1);
    scene.add(light1.clone());
    scene.add(light1.clone());
    scene.add(light1.clone());

    scene.add(light);

    const ballGroup = generateSphereGrid(scene, sphereMesh);
    scene.add(ballGroup);

    mainCamera.position.z = 3;

    const controls = new OrbitControls(mainCamera, renderer.domElement);
    let rfId = -1;
    let globalTime = 0;
    mainCamera.lookAt(0, 0, 0);

    renderer.autoClear = false;

    const hdrLoader = new RGBELoader();
    const hdrTexture = await hdrLoader.loadAsync(
        withBase('img/hdr/quarry_01_1k.hdr')
    );
    hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

    const cubeRT = new THREE.WebGLCubeRenderTarget(cubeRTSize);
    const cubeCamera = new THREE.CubeCamera(near, far, cubeRT);
    const renderEnvMap = () => {
        const customBackground = new CustomBackground(
            cubeMapVert,
            irradianceFrag,
            'customBg'
        );
        const renderIrradianceCubeScene = new Scene();
        renderIrradianceCubeScene.add(customBackground.mesh);
        const tempCubeRT = new THREE.WebGLCubeRenderTarget(cubeRTSize);
        tempCubeRT.fromEquirectangularTexture(renderer, hdrTexture);
        customBackground.setCubeTexture(tempCubeRT.texture);
        cubeCamera.update(renderer, renderIrradianceCubeScene);
        scene.background = hdrTexture;
    };

    renderEnvMap();

    // update ball material texture
    for (let i = 0; i < ballGroup.children.length; i++) {
        const mesh = ballGroup.children[i] as Mesh;
        const mat = mesh.material as ShaderMaterial;
        mat.uniforms.irradianceMap.value = cubeRT.texture;
    }

    const mainLoop = () => {
        globalTime += 0.1;
        controls.update();

        renderer.render(scene, mainCamera);

        requestAnimationFrame(mainLoop);
    };
    const viewPosition = new THREE.Vector3(-11.56, 7.839, 20.215);
    const viewQuat = new Quaternion(-0.156, -0.253, -0.041, 0.953);

    mainCamera.position.copy(viewPosition);
    mainCamera.setRotationFromQuaternion(viewQuat);

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
