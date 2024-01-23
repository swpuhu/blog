import { Effect } from '../../../submodule/renderer/Effect';
import { Geometry } from '../../../submodule/renderer/Geometry';
import { Material } from '../../../submodule/renderer/Material';
import { Mesh } from '../../../submodule/renderer/Mesh';
import { Texture } from '../../../submodule/renderer/Texture';
import { MaterialPropertyEnum } from '../../../submodule/renderer/type';
import vert from '../../../submodule/renderer/shader/normalVert.glsl';
import frag from '../../../submodule/renderer/shader/normalTextureFrag.glsl';
import { Camera } from '../../../submodule/renderer/Camera';
import { Node } from '../../../submodule/renderer/Node';

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
        const effect = new Effect(vert, frag);
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
        const camera = new Camera(
            canvas.width / canvas.height,
            60,
            0.1,
            1000,
            'main'
        );
        const rootNode = new Node('root');
        const mesh = new Mesh(geo, material, rootNode);
        mesh.render(gl, camera);
    });

    // #endregion snippet

    return {};
}

export type ReturnType = {};
