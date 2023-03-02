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
