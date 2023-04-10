import { Geometry } from './Geometry';
import { Material } from './Material';

export class Mesh {
    constructor(protected geometry: Geometry, protected material: Material) {}

    public render(gl: RenderContext): void {
        gl.useProgram(this.material.program);
    }
}
