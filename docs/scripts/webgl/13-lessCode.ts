import {
    createAttributeSetter,
    createBufferInfoFromArrays,
    createUniformSetters,
    initWebGL,
    lightAttenuationLookUp,
    lookAt,
    setAttribute,
    setUniform,
} from './util';
import { mat4, vec3 } from 'gl-matrix';
import lightVert from './shader/11-light-vert.glsl';
import lightFrag from './shader/12-spotLight-frag.glsl';
export function main(): ReturnType | null {
    // #region snippet
    const canvas = document.getElementById('canvas4') as HTMLCanvasElement;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        return null;
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
        return null;
    }
    // 告诉WebGL使用我们刚刚初始化的这个程序
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    const width = 1;
    const height = 1;
    const depth = 1;
    //prettier-ignore
    const pointPos = [
        // front-face
        0, 0, 0, width, 0, 0, width, height, 0, width, height, 0, 0, height, 0, 0, 0, 0,
        // back-face
        0, 0, depth, width, 0, depth, width, height, depth, width, height, depth, 0, height, depth, 0, 0, depth,
        // left-face
        0, 0, 0, 0, height, 0, 0, height, depth, 0, height, depth, 0, 0, depth, 0, 0, 0,
        // right-face
        width, 0, 0, width, height, 0, width, height, depth, width, height, depth, width, 0, depth, width, 0, 0,
        // top-face
        0, height, 0, width, height, 0, width, height, depth, width, height, depth, 0, height, depth, 0, height, 0,
        // bottom-face
        0, 0, 0, width, 0, 0, width, 0, depth, width, 0, depth, 0, 0, depth, 0, 0, 0,
    ];
    //prettier-ignore
    const normals = [
        // front-face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // back-face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // left-face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 
        // right-face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 
        // top-face
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 
        // bottom-face
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 
    ];

    for (let i = 0; i < pointPos.length; i += 3) {
        pointPos[i] += -width / 2;
        pointPos[i + 1] += -height / 2;
        pointPos[i + 2] += -depth / 2;
    }

    //prettier-ignore
    const colors = [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
        1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
        0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    ];

    const bufferInfo = createBufferInfoFromArrays(gl, [
        { numComponents: 3, data: pointPos, name: 'a_position' },
        { numComponents: 3, data: colors, name: 'a_color' },
        { numComponents: 3, data: normals, name: 'a_normal' },
    ]);
    const attribSetters = createAttributeSetter(gl, program);
    const uniformSetters = createUniformSetters(gl, program);

    const uniforms = {
        u_world: [],
        u_viewInv: [],
        u_lightPos: [],
        u_viewWorldPos: [],
        u_gloss: [],
        u_coefficient: [],
        u_spotDir: [],
        u_cutoff: [],
        u_proj: [],
    };

    let translateX = 0; //
    let translateY = 0; //
    let translateZ = 0; //

    const uProj = gl.getUniformLocation(program, 'u_proj');
    const projMat = mat4.create();
    mat4.perspective(projMat, 45, canvas.width / canvas.height, 1, 2000);
    gl.uniformMatrix4fv(uProj, false, projMat);

    let cameraMat = mat4.create();

    const worldMat = mat4.create();
    mat4.translate(worldMat, worldMat, [0, 0, 0]);
    const pointLightPos = vec3.fromValues(0, 2, 1.5);
    let gloss = 64;
    const coEfficient = lightAttenuationLookUp(30);

    const render = () => {
        gl.useProgram(program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //
        mat4.identity(cameraMat);
        const cameraPos = vec3.fromValues(translateX, translateY, translateZ);

        cameraMat = lookAt(
            new Float32Array([translateX, translateY, translateZ]),
            new Float32Array([0, 0, 0])
        );
        mat4.invert(cameraMat, cameraMat);

        const cameraWorldPos = vec3.create();
        vec3.transformMat4(cameraWorldPos, cameraPos, worldMat);

        const pointLightWorldPos = vec3.create();

        vec3.transformMat4(pointLightWorldPos, pointLightPos, worldMat);
        uniforms.u_world = worldMat as any;
        uniforms.u_viewInv = cameraMat as any;
        uniforms.u_lightPos = pointLightWorldPos as any;
        uniforms.u_viewWorldPos = cameraWorldPos as any;
        uniforms.u_coefficient = coEfficient as any;
        uniforms.u_spotDir = [0, -1, -1] as any;
        uniforms.u_cutoff = [
            Math.cos((10 / 180) * Math.PI),
            Math.cos((9 / 180) * Math.PI),
        ] as any;
        uniforms.u_gloss = gloss as any;
        uniforms.u_proj = projMat as any;

        setAttribute(attribSetters, bufferInfo);
        setUniform(uniformSetters, uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, pointPos.length / 3);
    };

    render();
    // #endregion snippet

    return {
        setTranslateX(x) {
            translateX = x;
            render();
        },
        setTranslateY(y) {
            translateY = y;
            render();
        },
        setTranslateZ(z) {
            translateZ = z;
            render();
        },
        setGloss(v) {
            gloss = v;
            render();
        },
    };
}

export type ReturnType = {
    setTranslateX(v: number): void;
    setTranslateY(v: number): void;
    setTranslateZ(v: number): void;
    setGloss(v: number): void;
};
