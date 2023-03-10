import { initWebGL } from './util';
import { mat4 } from 'gl-matrix';
export function main(): ReturnType | null {
    // #region snippet
    const canvas = document.getElementById('canvas2') as HTMLCanvasElement;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        return null;
    }

    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 顶点着色器
    const vertexShader = `
        attribute vec4 a_position; 
        attribute vec3 a_color; 
        uniform mat4 u_translate; //
        uniform mat4 u_rotate; //
        uniform mat4 u_scale; //
        uniform mat4 u_proj;
        varying vec3 v_color;
        void main () {
            gl_Position = u_proj * u_translate * u_rotate * u_scale * a_position; // 
            v_color = a_color;
        }  
    `;
    // 片元着色器
    const fragmentShader = `
        // 设置浮点数精度
        precision mediump float;
        varying vec3 v_color;
        void main () {
            // vec4是表示四维向量，这里用来表示RGBA的值[0~1]，均为浮点数，如为整数则会报错
            gl_FragColor = vec4(v_color, 1.0);
        }
    `;

    // 初始化shader程序
    const program = initWebGL(gl, vertexShader, fragmentShader);
    if (!program) {
        return null;
    }
    // 告诉WebGL使用我们刚刚初始化的这个程序
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    const width = 100;
    const height = 100;
    const depth = -100;
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
    const colors = [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
        1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
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

    // 我们需要往shader中传入矩阵
    const uTranslateLoc = gl.getUniformLocation(program, 'u_translate'); //
    const uRotateLoc = gl.getUniformLocation(program, 'u_rotate'); //
    const uScaleLoc = gl.getUniformLocation(program, 'u_scale'); //

    let translateX = 0; //
    let translateY = 0; //
    let rotateRadian = 0; //
    let scale = 1; //
    let radianY = 1;
    let radianX = 0;

    const uProj = gl.getUniformLocation(program, 'u_proj');
    const projMat = mat4.create();
    mat4.ortho(projMat, 0, canvas.width, 0, canvas.height, -200, 200);
    gl.uniformMatrix4fv(uProj, false, projMat);
    const render = () => {
        gl.useProgram(program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //
        const translateMat = mat4.create(); //
        const rotateMat = mat4.create(); //
        const scaleMat = mat4.create(); //
        mat4.translate(translateMat, translateMat, [translateX, translateY, 0]); //
        mat4.rotate(rotateMat, rotateMat, radianY, [0, 1, 0]);
        mat4.rotate(rotateMat, rotateMat, rotateRadian, [0, 0, 1]);
        mat4.rotate(rotateMat, rotateMat, radianX, [1, 0, 0]);
        mat4.scale(scaleMat, scaleMat, [scale, scale, scale]); //

        gl.uniformMatrix4fv(uTranslateLoc, false, translateMat); //
        gl.uniformMatrix4fv(uRotateLoc, false, rotateMat); //
        gl.uniformMatrix4fv(uScaleLoc, false, scaleMat); //
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
        setRotationZ(rad) {
            rotateRadian = rad;
            render();
        },
        setRotationY(rad) {
            radianY = rad;
            render();
        },
        setRotationX(rad) {
            radianX = rad;
            render();
        },
        setScale(s) {
            scale = s;
            render();
        },
    };
}

export type ReturnType = {
    setTranslateX(v: number): void;
    setTranslateY(v: number): void;
    setRotationZ(v: number): void;
    setRotationY(v: number): void;
    setRotationX(v: number): void;
    setScale(v: number): void;
};
