import { ASSERT, initWebGL } from '../util';

type UniformInfoType = {
    type: number;
    name: string;
    location: PossibleNullObject<WebGLUniformLocation>;
    texIndex?: number;
};

export class Effect {
    public program: PossibleNullObject<WebGLProgram> = null;
    private uniformsMap: UniformInfoType[] = [];
    private textureCount = 0;
    constructor(
        private gl: RenderContext,
        vertString: string,
        fragString: string
    ) {
        this.program = initWebGL(gl, vertString, fragString);

        if (!this.program) {
            throw new Error('Shader程序初始化失败！');
        }
        gl.useProgram(this.program);
        const uniformNums: number = gl.getProgramParameter(
            this.program,
            gl.ACTIVE_UNIFORMS
        );
        gl.getActiveUniform(this.program, 1);
        for (let i = 0; i < uniformNums; i++) {
            const info = gl.getActiveUniform(this.program, i);
            if (!info) {
                continue;
            }
            const uniformInfo: UniformInfoType = {
                type: info.type,
                name: info.name,
                location: gl.getUniformLocation(this.program, info.name),
            };
            if (info.type === gl.SAMPLER_2D) {
                uniformInfo.texIndex = this.textureCount++;
            }
            this.uniformsMap.push(uniformInfo);
        }

        console.log(this.uniformsMap);
    }

    public setUniform(name: string, value: any): void {
        const uniform = this.uniformsMap.find(item => item.name === name);
        if (!uniform) {
            return;
        }
        const gl = this.gl;
        switch (uniform.type) {
            case gl.FLOAT:
                gl.uniform1f(uniform.location, value);
                break;
            case gl.FLOAT_VEC2:
                gl.uniform2fv(uniform.location, value);
                break;
            case gl.FLOAT_VEC3:
                gl.uniform3fv(uniform.location, value);
                break;
            case gl.FLOAT_VEC4:
                gl.uniform4fv(uniform.location, value);
                break;
            case gl.FLOAT_MAT2:
                gl.uniformMatrix2fv(uniform.location, false, value);
                break;
            case gl.FLOAT_MAT3:
                gl.uniformMatrix3fv(uniform.location, false, value);
                break;
            case gl.FLOAT_MAT4:
                gl.uniformMatrix4fv(uniform.location, false, value);
                break;
            case gl.SAMPLER_2D:
                ASSERT(uniform.texIndex);
                gl.activeTexture(uniform.texIndex!);
                gl.bindTexture(gl.TEXTURE_2D, value.texture);
                gl.uniform1i(uniform.location, uniform.texIndex!);
                break;
        }
    }
}
