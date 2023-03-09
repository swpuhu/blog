import { initWebGL } from './util';
import { mat4 } from 'gl-matrix';
export function main(): ReturnType | null {
    // #region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

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
        uniform mat4 u_translate; //[!code ++]
        uniform mat4 u_rotate; //[!code ++]
        uniform mat4 u_scale; //[!code ++]
        uniform mat4 u_proj;
        void main () {
            // gl_Position = a_position;  // [!code --]
            gl_Position = u_proj * u_translate * u_rotate * u_scale * a_position; // [!code ++]
        }  
    `;
    // 片元着色器
    const fragmentShader = `
        // 设置浮点数精度
        precision mediump float;
        void main () {
            // vec4是表示四维向量，这里用来表示RGBA的值[0~1]，均为浮点数，如为整数则会报错
            gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0);
        }
    `;

    // 初始化shader程序
    const program = initWebGL(gl, vertexShader, fragmentShader);
    if (!program) {
        return null;
    }
    // 告诉WebGL使用我们刚刚初始化的这个程序
    gl.useProgram(program);

    const pointPos = [-0.0, 0.0, 200, 0.0, 100.0, 200];
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // -----------------------------------------------------
    // 注意：这里必须采用类型化数组往WebGL传入attribute类型的数据
    // -----------------------------------------------------
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);

    // 获取shader中a_position的地址
    const a_position = gl.getAttribLocation(program, 'a_position');
    // 我们不再采用这种方式进行传值
    // gl.vertexAttrib3f(a_position, 0.0, 0.0, 0.0);
    // 采用vertexAttribPointer进行传值
    gl.vertexAttribPointer(
        a_position,
        2,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 2,
        0
    );
    gl.enableVertexAttribArray(a_position);

    // 我们需要往shader中传入矩阵
    const uTranslateLoc = gl.getUniformLocation(program, 'u_translate'); // [!code ++]
    const uRotateLoc = gl.getUniformLocation(program, 'u_rotate'); // [!code ++]
    const uScaleLoc = gl.getUniformLocation(program, 'u_scale'); // [!code ++]

    let translateX = 0; // [!code ++]
    let translateY = 0; // [!code ++]
    let rotateRadian = 0; // [!code ++]
    let scale = 1; // [!code ++]

    const uProj = gl.getUniformLocation(program, 'u_proj');
    const projMat = mat4.create();
    mat4.ortho(projMat, 0, canvas.width, 0, canvas.height, -1, 100);
    gl.uniformMatrix4fv(uProj, false, projMat);
    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT); // [!code ++]
        const translateMat = mat4.create(); // [!code ++]
        const rotateMat = mat4.create(); // [!code ++]
        const scaleMat = mat4.create(); // [!code ++]
        mat4.translate(translateMat, translateMat, [translateX, translateY, 0]); // [!code ++]
        mat4.rotate(rotateMat, rotateMat, rotateRadian, [0, 0, 1]); // [!code ++]
        mat4.scale(scaleMat, scaleMat, [scale, scale, scale]); // [!code ++]

        gl.uniformMatrix4fv(uTranslateLoc, false, translateMat); // [!code ++]
        gl.uniformMatrix4fv(uRotateLoc, false, rotateMat); // [!code ++]
        gl.uniformMatrix4fv(uScaleLoc, false, scaleMat); // [!code ++]
        gl.drawArrays(gl.TRIANGLES, 0, 3);
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
        setRotation(rad) {
            rotateRadian = rad;
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
    setRotation(v: number): void;
    setScale(v: number): void;
};
