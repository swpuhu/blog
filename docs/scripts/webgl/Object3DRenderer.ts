import {
    AttributeSetters,
    BufferInfo,
    UniformSetters,
    createAttributeSetter,
    createBufferInfoFromArrays,
    createUniformSetters,
    setAttribute,
    setUniform,
} from './util';

export class Object3DRenderer {
    private attribSetters: AttributeSetters;
    private uniformSetters: UniformSetters;
    private bufferInfo: BufferInfo[];
    constructor(
        private gl: RenderContext,
        private program: WebGLProgram,
        private positions: Iterable<number>,
        private normals: Iterable<number>,
        private indices: ArrayLike<number>,
        private translate: Iterable<number>
    ) {
        this.bufferInfo = createBufferInfoFromArrays(gl, [
            { numComponents: 3, data: positions, name: 'a_position' },
            { numComponents: 3, data: normals, name: 'a_normal' },
            {
                numComponents: 1,
                data: indices,
                name: 'indices',
                isIndices: true,
            },
        ]);
        this.attribSetters = createAttributeSetter(gl, program);
        this.uniformSetters = createUniformSetters(gl, program);

        const uniforms = {
            u_world: [],
            u_viewInv: [],
            u_lightDir: [],
            u_viewWorldPos: [],
            u_proj: [],
            u_gloss: 16,
        };

        // const uProj = gl.getUniformLocation(program, 'u_proj');
        // const projMat = mat4.create();
        // mat4.perspective(projMat, 45, canvas.width / canvas.height, 0.1, 2000);
        // gl.uniformMatrix4fv(uProj, false, projMat);

        // const worldMat = mat4.create();
        // mat4.translate(worldMat, worldMat, [0, 0, 0]);
        // const pointLightPos = vec3.fromValues(0, 2, 1.5);
    }

    render(gl: RenderContext, program: WebGLProgram): void {
        gl.useProgram(program);
        // const cameraPos = vec3.fromValues(translateX, translateY, translateZ);

        // cameraMat = lookAt(
        //     new Float32Array([translateX, translateY, translateZ]),
        //     new Float32Array([0, 0, 0])
        // );
        // mat4.invert(cameraMat, cameraMat);

        // const cameraWorldPos = vec3.create();
        // vec3.transformMat4(cameraWorldPos, cameraPos, worldMat);

        // const pointLightWorldPos = vec3.create();

        // vec3.transformMat4(pointLightWorldPos, pointLightPos, worldMat);
        // uniforms.u_world = worldMat as any;
        // uniforms.u_viewInv = cameraMat as any;
        // uniforms.u_lightDir = [1, 1, 0] as any;
        // uniforms.u_viewWorldPos = cameraWorldPos as any;
        // uniforms.u_proj = projMat as any;
        setAttribute(this.attribSetters, this.bufferInfo);
        setUniform(this.uniformSetters, this.uniforms);
        gl.drawElements(
            gl.TRIANGLES,
            this.indices.length,
            gl.UNSIGNED_SHORT,
            0
        );
    }
}
