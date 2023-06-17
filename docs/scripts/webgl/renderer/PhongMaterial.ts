import { Effect } from './Effect';
import { Material } from './Material';
import frag from '../shader/11-light-frag.glsl';
import vert from '../shader/11-light-vert.glsl';
import { MaterialPropertyEnum } from './type';

export class PhongMaterial extends Material {
    constructor() {
        const phongEffect = new Effect(vert, frag);
        super(
            phongEffect,
            [
                {
                    name: 'u_gloss',
                    value: 200,
                    type: MaterialPropertyEnum.FLOAT,
                },
            ],
            {
                depthStencilState: {
                    depthTest: true,
                    depthWrite: true,
                },
            }
        );
    }
}
