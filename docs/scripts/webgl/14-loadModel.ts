import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import {
    createAttributeSetter,
    createBufferInfoFromArrays,
    createUniformSetters,
    initWebGL,
    lookAt,
    setAttribute,
    setUniform,
} from './util';
import { mat4, vec3 } from 'gl-matrix';
import lightVert from '../../../submodule/renderer/shader/11-light-vert.glsl';
import lightFrag from '../../../submodule/renderer/shader/11-light-frag.glsl';
import { BufferGeometry, Mesh } from 'three';
export function main(): void {
    // #region snippet
    const canvas = document.getElementById('canvas4') as HTMLCanvasElement;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        return;
    }

    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 顶点着色器
    const vertexShader = lightVert;
    // 片元着色器
    const fragmentShader = lightFrag;

    // 初始化shader程序
    const program = initWebGL(gl, vertexShader, fragmentShader);
    if (!program) {
        return;
    }
    // 告诉WebGL使用我们刚刚初始化的这个程序
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);

    const loader = new OBJLoader();
    loader.load('/model/bunny.obj', group => {
        group.traverse(obj => {
            if (obj instanceof Mesh) {
                const geo = obj.geometry as BufferGeometry;
                const posArray = (geo.attributes.position as any).array;
                const indices = Array.from(
                    { length: geo.attributes.position.count },
                    (v, k) => k
                );
                const normalArray = (geo.attributes.normal as any).array;
                const pointPos = posArray;
                const normals = normalArray;

                const bufferInfo = createBufferInfoFromArrays(gl, [
                    { numComponents: 3, data: pointPos, name: 'a_position' },
                    { numComponents: 3, data: normals, name: 'a_normal' },
                    {
                        numComponents: 1,
                        data: indices,
                        name: 'indices',
                        isIndices: true,
                    },
                ]);
                const attribSetters = createAttributeSetter(gl, program);
                const uniformSetters = createUniformSetters(gl, program);

                const uniforms = {
                    u_world: [],
                    u_viewInv: [],
                    u_lightDir: [],
                    u_viewWorldPos: [],
                    u_proj: [],
                    u_gloss: 16,
                };

                const translateX = 0; //
                const translateY = 0.35; //
                const translateZ = 0.3; //

                const uProj = gl.getUniformLocation(program, 'u_proj');
                const projMat = mat4.create();
                mat4.perspective(
                    projMat,
                    45,
                    canvas.width / canvas.height,
                    0.1,
                    2000
                );
                gl.uniformMatrix4fv(uProj, false, projMat);

                let cameraMat = mat4.create();

                const worldMat = mat4.create();
                mat4.translate(worldMat, worldMat, [0, 0, 0]);
                const pointLightPos = vec3.fromValues(0, 2, 1.5);

                const render = () => {
                    gl.useProgram(program);
                    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //
                    mat4.identity(cameraMat);
                    const cameraPos = vec3.fromValues(
                        translateX,
                        translateY,
                        translateZ
                    );

                    cameraMat = lookAt(
                        new Float32Array([translateX, translateY, translateZ]),
                        new Float32Array([0, 0, 0])
                    );
                    mat4.invert(cameraMat, cameraMat);

                    const cameraWorldPos = vec3.create();
                    vec3.transformMat4(cameraWorldPos, cameraPos, worldMat);

                    const pointLightWorldPos = vec3.create();

                    vec3.transformMat4(
                        pointLightWorldPos,
                        pointLightPos,
                        worldMat
                    );
                    uniforms.u_world = worldMat as any;
                    uniforms.u_viewInv = cameraMat as any;
                    uniforms.u_lightDir = [1, 1, 0] as any;
                    uniforms.u_viewWorldPos = cameraWorldPos as any;
                    uniforms.u_proj = projMat as any;
                    setAttribute(attribSetters, bufferInfo);
                    setUniform(uniformSetters, uniforms);
                    gl.drawElements(
                        gl.TRIANGLES,
                        indices.length,
                        gl.UNSIGNED_SHORT,
                        0
                    );
                };

                render();
                // #endregion snippet
            }
        });
    });
}
