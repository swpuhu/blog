import { Effect } from './renderer/Effect';
import { Geometry } from './renderer/Geometry';
import { Material } from './renderer/Material';
import basicVert from './shader/normalVert.glsl';
import basicFrag from './shader/normalTextureFrag.glsl';
import { Mesh } from './renderer/Mesh';
import { Texture } from './renderer/Texture';
import { MaterialPropertyEnum } from './renderer/type';

export function main(): ReturnType | null {
    // #region snippet
    const canvas = document.getElementById('canvas2') as HTMLCanvasElement;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
        return null;
    }
    gl.enable(gl.CULL_FACE);

    const texture = new Texture(gl);
    texture.loadTexture('/img/WebGL_Logo.png').then(() => {
        const geo = Geometry.getPlane();
        const effect = new Effect(gl, basicVert, basicFrag);
        const material = new Material(
            effect,
            [
                {
                    name: 'u_tex',
                    type: MaterialPropertyEnum.SAMPLER_2D,
                    value: texture,
                },
            ],
            {
                blendState: {
                    blend: true,
                    blendSrc: gl.SRC_ALPHA,
                    blendDst: gl.ONE,
                },
            }
        );
        const mesh = new Mesh(geo, material);
        mesh.render(gl);
    });

    // #endregion snippet

    return {};
}

export type ReturnType = {};
