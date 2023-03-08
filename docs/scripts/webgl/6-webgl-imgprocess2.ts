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
    createFramebufferAndTexture(gl, 100, 100);
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
        // 设置浮点数精度
        precision highp float;
        uniform sampler2D u_tex;
        uniform sampler2D u_lut;
        varying vec2 v_uv;
        uniform vec4 u_uv_transform;
        uniform vec3 u_bright_sat_hue;
        uniform vec2 u_resolution;

        mat3 getHueMat(float theta) {
            mat3 m1 = mat3(0.213, .715, .072, 0.213, .715, .072, 0.213, .715, .072);
            mat3 m2 = mat3(0.787, -0.715, 0.072, -0.213, 0.285, -0.072, -0.213, -0.715, 0.928);
            mat3 m3 = mat3(-0.213, -0.715, 0.928, 0.143, 0.140, -0.283, -0.787, 0.715, 0.072);
            
            return m1 + cos(theta) * m2 + sin(theta) * m3;
        }

        vec3 mapLUT(sampler2D tex, vec3 originCol) {
            // 计算当前颜色在哪个格子 0 ~ 63
            float blueIndex = floor(originCol.b * 63.0);

            // 计算当前格子的行列 0 ~ 7
            vec2 quad;
            quad.y = floor(blueIndex / 8.0);
            quad.x = (blueIndex - quad.y * 8.0);

            // 计算小格子中的坐标在整个纹理上的坐标 0 ~ 1
            vec2 texPos;
            texPos.x = quad.x / 8.0 + (0.125 - 1.0 / 512.0) * originCol.r + 0.5 / 512.0;
            texPos.y = quad.y / 8.0 + (0.125 - 1.0 / 512.0) * originCol.g + 0.5 / 512.0;
            texPos.y = 1.0 - texPos.y;
            return texture2D(tex, texPos).rgb;
        }
        void main () {
            vec2 uv = v_uv * u_uv_transform.xy + u_uv_transform.zw;
            float asp = u_resolution.x / u_resolution.y;
            uv.x *= asp;
            uv.x += (1.0 - fract(asp)) / 2.0;
            float brightness = u_bright_sat_hue.x; 
            float sat = u_bright_sat_hue.y; 
            float hue = u_bright_sat_hue.z; 
            vec4 col = texture2D(u_tex, uv);
            if (uv.x > 1.) {
                col.rgb = mapLUT(u_lut, col.rgb);    
            }
            
            col.rgb *= brightness;
            vec3 gray = vec3(0.5);
            col.rgb = mix(gray, col.rgb, sat);
            col.rgb *= getHueMat(hue);

            
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

    const texture1 = createTexture(gl, REPEAT_MODE.REPEAT);
    const texture2 = createTexture(gl, REPEAT_MODE.NONE);

    const texture1Loc = gl.getUniformLocation(program, 'u_tex');
    const texture2Loc = gl.getUniformLocation(program, 'u_lut');
    gl.uniform1i(texture1Loc, 0);
    gl.uniform1i(texture2Loc, 1);

    const uvTransformLoc = gl.getUniformLocation(program, 'u_uv_transform');
    let uvTransform = [1, 1, 0, 0];
    gl.uniform4fv(uvTransformLoc, uvTransform);
    const brightContrastHue = [1, 1, 0];
    const brightContrastHueLoc = gl.getUniformLocation(
        program,
        'u_bright_sat_hue'
    );

    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2fv(uResolutionLoc, [canvas.width, canvas.height]);
    const imgPromise1 = loadImage(withBase('/img/5-imgprocess/lenna.jpeg'));
    const imgPromise2 = loadImage(withBase('/LUT/lenna.png'));

    Promise.all([imgPromise1, imgPromise2]).then(imgs => {
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
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture2);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            imgs[1]
        );
        render();
    });
    const render = () => {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform3fv(brightContrastHueLoc, brightContrastHue);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();
    // #endregion snippet

    return {
        setBrightness(x) {
            brightContrastHue[0] = x;
            render();
        },
        setContrast(x) {
            brightContrastHue[1] = x;
            render();
        },
        setHueRotate(x) {
            brightContrastHue[2] = x;
            render();
        },
    };
}
export type ReturnType = {
    setBrightness: (x: number) => void;
    setContrast: (x: number) => void;
    setHueRotate: (x: number) => void;
};
export default main;
