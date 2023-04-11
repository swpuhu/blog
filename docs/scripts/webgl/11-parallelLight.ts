import { initWebGL, lookAt } from './util';
import { mat4, vec3 } from 'gl-matrix';
import lightVert from './shader/11-light-vert.glsl';
import lightFrag from './shader/11-light-frag.glsl';
export function main(): ReturnType | null {
    // #region snippet
    const canvas = document.getElementById('canvas3') as HTMLCanvasElement;

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
    const width = 50;
    const height = 50;
    const depth = 50;
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
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // back-face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
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
    ]
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // 获取shader中a_position的地址
    const a_position = gl.getAttribLocation(program, 'a_position');
    // 我们不再采用这种方式进行传值
    // gl.vertexAttrib3f(a_position, 0.0, 0.0, 0.0);
    // 采用vertexAttribPointer进行传值
    gl.vertexAttribPointer(
        a_position,
        3,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 3,
        0
    );
    gl.enableVertexAttribArray(a_position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const a_color = gl.getAttribLocation(program, 'a_color');
    // 我们不再采用这种方式进行传值
    gl.vertexAttribPointer(
        a_color,
        3,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 3,
        0
    );
    gl.enableVertexAttribArray(a_color);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    const a_normal = gl.getAttribLocation(program, 'a_normal');
    // 我们不再采用这种方式进行传值
    gl.vertexAttribPointer(
        a_normal,
        3,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 3,
        0
    );
    gl.enableVertexAttribArray(a_normal);

    // 我们需要往shader中传入矩阵
    const uWorldLoc = gl.getUniformLocation(program, 'u_world');
    const uViewInvLoc = gl.getUniformLocation(program, 'u_viewInv');
    const uLightDirLoc = gl.getUniformLocation(program, 'u_lightDir');
    const uViewPosLoc = gl.getUniformLocation(program, 'u_viewWorldPos');
    const uGlossLoc = gl.getUniformLocation(program, 'u_gloss');

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
    const lightDir = [0, 1, -1];
    let gloss = 64;

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
        gl.uniformMatrix4fv(uWorldLoc, false, worldMat);
        gl.uniformMatrix4fv(uViewInvLoc, false, cameraMat);
        gl.uniform3fv(uLightDirLoc, lightDir);
        gl.uniform3fv(uViewPosLoc, cameraWorldPos);
        gl.uniform1f(uGlossLoc, gloss);
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
