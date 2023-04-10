import { Geometry } from './Geometry';
import { Material } from './Material';

export class Mesh {
    constructor(protected geometry: Geometry, protected material: Material) {}

    public setAttribute(
        gl: RenderContext,
        name: string,
        compNum: number,
        type: number
    ) {
        if (!this.material.program) {
            return;
        }
        const attribLocation = gl.getAttribLocation(
            this.material.program,
            name
        );
        gl.vertexAttribPointer(attribLocation, compNum, type, false, 0, 0);
        gl.enableVertexAttribArray(attribLocation);
    }

    public render(gl: RenderContext): void {
        gl.useProgram(this.material.program);
        this.geometry.setPositionBufferData(gl);
        this.setAttribute(gl, 'a_pos', 3, gl.FLOAT);

        this.geometry.setUVBufferData(gl);
        this.setAttribute(gl, 'a_uv', 2, gl.FLOAT);

        this.geometry.setIndicesBufferData(gl);

        this.material.setProperties();
        this.material.setPipelineState(gl);

        gl.drawElements(
            gl.TRIANGLES,
            this.geometry.drawCount,
            gl.UNSIGNED_SHORT,
            0
        );
    }
}
