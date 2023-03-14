import { mat4, vec3 } from 'gl-matrix';

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    // 创建 shader 对象
    let shader = gl.createShader(type);
    // 往 shader 中传入源代码
    gl.shaderSource(shader!, source);
    // 编译 shader
    gl.compileShader(shader!);
    // 判断 shader 是否编译成功
    let success = gl.getShaderParameter(shader!, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    // 如果编译失败，则打印错误信息
    console.log(gl.getShaderInfoLog(shader!));
    gl.deleteShader(shader);
}

function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram | null {
    // 创建 program 对象
    let program = gl.createProgram();
    // 往 program 对象中传入 WebGLShader 对象
    gl.attachShader(program!, vertexShader);
    gl.attachShader(program!, fragmentShader);
    // 链接 program
    gl.linkProgram(program!);
    // 判断 program 是否链接成功
    let success = gl.getProgramParameter(program!, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    // 如果 program 链接失败，则打印错误信息
    console.log(gl.getProgramInfoLog(program!));
    gl.deleteProgram(program);
    return null;
}

export function initWebGL(
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string
) {
    // 根据源代码创建顶点着色器
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    // 根据源代码创建片元着色器
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    // 创建 WebGLProgram 程序
    let program = createProgram(gl, vertexShader!, fragmentShader!);
    return program;
}

export enum REPEAT_MODE {
    NONE,
    REPEAT,
    MIRRORED_REPEAT,
}

export function createTexture(gl: WebGLRenderingContext, repeat?: REPEAT_MODE) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    let mod = gl.CLAMP_TO_EDGE;
    switch (repeat) {
        case REPEAT_MODE.REPEAT:
            mod = gl.REPEAT;
            break;
        case REPEAT_MODE.MIRRORED_REPEAT:
            mod = gl.MIRRORED_REPEAT;
            break;
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mod);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mod);
    return texture;
}

export function isMobile(): boolean {
    if (typeof window !== 'undefined' && window.navigator) {
        const userAgent = window.navigator.userAgent;
        return /(mobile)/i.test(userAgent);
    }
    return false;
}

export function clamp(x: number, min: number, max: number) {
    if (x < min) {
        x = min;
    } else if (x > max) {
        x = max;
    }
    return x;
}

export function readLUTCube(file: string): {
    size: number;
    data: number[];
} {
    let lineString = '';
    let isStart = true;
    let size = 0;
    let i = 0;
    let result: number[] = [];
    const processToken = (token: string) => {
        if (token === 'LUT size') {
            i++;
            let sizeStart = false;
            let sizeStr = '';
            while (file[i] !== '\n') {
                if (file[i - 1] === ' ' && /\d/.test(file[i])) {
                    sizeStart = true;
                    sizeStr += file[i];
                } else if (sizeStart) {
                    sizeStr += file[i];
                }
                i++;
            }
            size = +sizeStr;
            result = new Array(size * size * size);
        } else if (token === 'LUT data points') {
            // 读取数据
            i++;
            let numStr = '';
            let count = 0;

            while (i < file.length) {
                if (/\s|\n/.test(file[i])) {
                    result[count++] = +numStr;
                    numStr = '';
                } else if (/\d|\./.test(file[i])) {
                    numStr += file[i];
                }
                i++;
            }
        }
    };

    for (; i < file.length; i++) {
        if (file[i] === '#') {
            isStart = true;
        } else if (isStart && file[i] === '\n') {
            processToken(lineString);
            lineString = '';
            isStart = false;
        } else if (isStart) {
            lineString += file[i];
        }
    }

    return {
        size,
        data: result,
    };
}

export async function loadImage(src: string) {
    return new Promise<HTMLImageElement>(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            resolve(img);
        };
    });
}

export function compute8ssedt(image: ImageData): number[][] {
    // Initialize distance transform image
    const distImage: number[][] = [];
    for (let i = 0; i < image.height; i++) {
        distImage[i] = [];
        for (let j = 0; j < image.width; j++) {
            distImage[i][j] = 0;
        }
    }

    // Initialize queue for distance transform
    const queue: number[][] = [];
    const data = image.data;
    for (let i = 0; i < image.height; i++) {
        for (let j = 0; j < image.width; j++) {
            const index = (i * image.width + j) * 4;
            if (data[index] == 255) {
                queue.push([i, j]);
            }
        }
    }

    // Compute distance transform
    while (queue.length > 0) {
        const p = queue.shift()!;
        const x = p[0];
        const y = p[1];
        let minDist = Number.MAX_SAFE_INTEGER;
        let minDir = [-1, -1];

        // Compute distance to nearest foreground pixel in 8 directions
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (
                    nx >= 0 &&
                    nx < image.height &&
                    ny >= 0 &&
                    ny < image.width
                ) {
                    const index = (nx * image.width + ny) * 4;
                    const d = distImage[nx][ny] + Math.sqrt(i * i + j * j);
                    if (d < minDist) {
                        minDist = d;
                        minDir = [i, j];
                    }
                }
            }
        }

        // Update distance transform image and queue
        distImage[x][y] = minDist;
        if (minDir[0] != -1 && minDir[1] != -1) {
            const nx = x + minDir[0];
            const ny = y + minDir[1];
            if (distImage[nx][ny] == 0) {
                queue.push([nx, ny]);
            }
        }
    }

    return distImage;
}
// #region createFramebuffer
export function createFramebufferAndTexture(
    gl: WebGLRenderingContext,
    width: number,
    height: number
): [WebGLFramebuffer | null, WebGLTexture | null] {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const texture = createTexture(gl, REPEAT_MODE.NONE);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status === gl.FRAMEBUFFER_COMPLETE) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return [framebuffer, texture];
    }
    return [null, null];
}
// #endregion createFramebuffer

// #region lookat
export function lookAt(cameraPos: vec3, targetPos: vec3): mat4 {
    const z = vec3.create();
    const y = vec3.fromValues(0, 1, 0);
    const x = vec3.create();
    vec3.sub(z, cameraPos, targetPos);
    vec3.normalize(z, z);
    vec3.cross(x, y, z);
    vec3.normalize(x, x);
    vec3.cross(y, z, x);
    vec3.normalize(y, y);

    // prettier-ignore
    return mat4.fromValues(
        x[0], x[1], x[2], 0, 
        y[0], y[1], y[2], 0, 
        z[0], z[1], z[2], 0, 
        cameraPos[0], cameraPos[1], cameraPos[2], 1
    );
}

// #endregion lookat
