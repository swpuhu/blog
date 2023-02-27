import { initWebGL } from './1-util';
import { mat4 } from 'gl-matrix';
import { createTexture } from '../../public/scripts/webgl/1-util';
import { withBase } from 'vitepress';
function main() {
    // #region snippet
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById('canvas');

    const gl = canvas.getContext('webgl');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 设置清空颜色缓冲区时的颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // 清空颜色缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 顶点着色器
    const vertexShader = `
        attribute vec4 a_position; 
        attribute vec2 a_uv;
        varying vec2 v_uv;
        void main () {
            v_uv = a_uv;
            gl_Position =  a_position; 
        }  
    `;
    // 片元着色器
    const fragmentShader = `
        // 设置浮点数精度
        precision mediump float;
        uniform sampler2D u_tex;
        varying vec2 v_uv;
        uniform vec4 u_uv_transform;
        void main () {
            vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw;
            gl_FragColor = texture2D(u_tex, uv);
        }
    `;

    // 初始化shader程序
    const program = initWebGL(gl, vertexShader, fragmentShader);
    // 告诉WebGL使用我们刚刚初始化的这个程序
    gl.useProgram(program);

    const pointPos = [-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1];
    const uvs = [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0];
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointPos), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const a_position = gl.getAttribLocation(program, 'a_position');
    const a_uv = gl.getAttribLocation(program, 'a_uv');
    gl.vertexAttribPointer(
        a_position,
        2,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 2,
        0
    );
    gl.enableVertexAttribArray(a_position);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(
        a_uv,
        2,
        gl.FLOAT,
        false,
        Float32Array.BYTES_PER_ELEMENT * 2,
        0
    );
    gl.enableVertexAttribArray(a_uv);

    const texture = createTexture(gl);

    const uvTransformLoc = gl.getUniformLocation(program, 'u_uv_transform');
    let uvTransform = [1, 1, 0, 0];
    gl.uniform4fv(uvTransformLoc, uvTransform);
    const img = new Image();
    img.src = withBase('/img/WebGL_Logo.png');
    img.onload = () => {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img
        );
        render();
    };
    let scale = 1;
    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();
    // #endregion snippet

    return {
        setTexParameteri(type) {
            let wrapSType = gl.CLAMP_TO_EDGE;
            let wrapTType = gl.CLAMP_TO_EDGE;
            switch (type) {
                case 1:
                    wrapSType = gl.REPEAT;
                    wrapTType = gl.REPEAT;
                    break;
                case 2:
                    wrapSType = gl.MIRRORED_REPEAT;
                    wrapTType = gl.MIRRORED_REPEAT;
                    break;
            }

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapSType);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapTType);
            render();
        },
        setUVTransformX(x) {
            uvTransform[0] = x;
            gl.uniform4fv(uvTransformLoc, uvTransform);
            render();
        },
        setUVTransformY(y) {
            uvTransform[1] = y;
            gl.uniform4fv(uvTransformLoc, uvTransform);
            render();
        },
        setUVTransformZ(z) {
            uvTransform[2] = z;
            gl.uniform4fv(uvTransformLoc, uvTransform);
            render();
        },
        setUVTransformW(w) {
            uvTransform[3] = w;
            gl.uniform4fv(uvTransformLoc, uvTransform);
            render();
        },
    };
}
export default main;
