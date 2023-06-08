import { BUILT_IN_POSITION, BUILT_IN_UV } from './common';

export type VertexAttribType = {
    name: string;
    array: ArrayBufferView;
};

export class Geometry {
    static getPlane(): Geometry {
        // prettier-ignore
        const vertPos = [
            -1, -1, -2,
            1, -1, -2,
            1, 1, -2,
            -1, 1, -2
        ]
        const uvPos = [0, 0, 1, 0, 1, 1, 0, 1];
        const indices = [0, 1, 2, 2, 3, 0];
        return new Geometry({
            positions: {
                name: BUILT_IN_POSITION,
                array: new Float32Array(vertPos),
            },
            uvs: {
                name: BUILT_IN_UV,
                array: new Float32Array(uvPos),
            },
            indices: new Uint16Array(indices),
        });
    }

    constructor(
        public vertAttrib: {
            positions: VertexAttribType;
            indices: Uint16Array;
            normals?: VertexAttribType;
            uvs?: VertexAttribType;
        }
    ) {}

    get count(): number {
        return this.vertAttrib.indices.length;
    }

    public hasNormal(): boolean {
        return !!this.vertAttrib.normals;
    }

    public hasUV(): boolean {
        return !!this.vertAttrib.uvs;
    }
}
