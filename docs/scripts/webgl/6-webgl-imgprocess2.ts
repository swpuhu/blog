import {
    createFramebufferAndTexture,
    createTexture,
    initWebGL,
    loadImage,
    REPEAT_MODE,
} from './util';
import { withBase } from 'vitepress';
function main(): ReturnType | undefined {
    // #region snippet
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
        return;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('该设备不支持WebGL！');
        return;
    }
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
        #define HALF_KERNEL_SIZE 1
        precision highp float;
        uniform sampler2D u_tex;
        varying vec2 v_uv;
        uniform vec4 u_uv_transform;
        uniform vec2 u_resolution;

        void main () {
            vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw;
            vec4 col = vec4(0.0);
            for (int i = -HALF_KERNEL_SIZE; i <= HALF_KERNEL_SIZE; i++) {
                for (int j = -HALF_KERNEL_SIZE; j <= HALF_KERNEL_SIZE; j++) {
                    vec2 offset = vec2(float(i), float(j)) / u_resolution;
                    col += texture2D(u_tex, uv + offset);
                }
            }
            col /= (float(HALF_KERNEL_SIZE) * 2. + 1.) * (float(HALF_KERNEL_SIZE) * 2. + 1.);
            gl_FragColor = col;
        }
    `;

    // 初始化shader程序
    const program = initWebGL(gl, vertexShader, fragmentShader);
    if (!program) {
        console.error('WebGLProgram初始化失败！');
        return;
    }
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

    const texture1 = createTexture(gl, REPEAT_MODE.NONE);

    const uvTransformLoc = gl.getUniformLocation(program, 'u_uv_transform');
    let uvTransform = [1, 1, 0, 0];
    gl.uniform4fv(uvTransformLoc, uvTransform);
    const brightContrastHue = [1, 1, 0];

    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2fv(uResolutionLoc, [canvas.width, canvas.height]);
    const imgPromise1 = loadImage(withBase('/img/5-imgprocess/lenna.jpeg'));
    const devicePixelRatio = window.devicePixelRatio;

    let downSample = 4;
    let renderTextureWidth = canvas.width / downSample;
    let renderTextureHeight = canvas.height / downSample;
    let [framebuffer1, renderTexture1] = createFramebufferAndTexture(
        gl,
        renderTextureWidth,
        renderTextureHeight
    );
    let [framebuffer2, renderTexture2] = createFramebufferAndTexture(
        gl,
        renderTextureWidth,
        renderTextureHeight
    );

    Promise.all([imgPromise1]).then(imgs => {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            imgs[0]
        );
        renderAll();
    });
    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    let iterations = 30;
    const renderAll = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        for (let i = 0; i < iterations; i++) {
            if (i % 2 === 0) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer1);
            } else {
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer2);
            }
            gl.viewport(
                0,
                0,
                (canvas.width * devicePixelRatio) / downSample,
                (canvas.height * devicePixelRatio) / downSample
            );
            render();
            gl.bindTexture(
                gl.TEXTURE_2D,
                i % 2 === 0 ? renderTexture1 : renderTexture2
            );
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        render();
    };
    // #endregion snippet

    return {
        setIterations(x) {
            iterations = x;
            renderAll();
        },
        setDownSample(x) {
            downSample = x;
            gl.deleteTexture(renderTexture1);
            gl.deleteTexture(renderTexture2);
            gl.deleteFramebuffer(framebuffer1);
            gl.deleteFramebuffer(framebuffer2);
            renderTextureWidth = canvas.width / downSample;
            renderTextureHeight = canvas.height / downSample;
            [framebuffer1, renderTexture1] = createFramebufferAndTexture(
                gl,
                renderTextureWidth,
                renderTextureHeight
            );
            [framebuffer2, renderTexture2] = createFramebufferAndTexture(
                gl,
                renderTextureWidth,
                renderTextureHeight
            );
            renderAll();
        },
    };
}
export type ReturnType = {
    setIterations: (x: number) => void;
    setDownSample: (x: number) => void;
};
export default main;
