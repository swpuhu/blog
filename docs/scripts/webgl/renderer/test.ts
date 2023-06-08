import { Effect } from './Effect';
import { Geometry } from './Geometry';
import frag from '../shader/11-light-frag.glsl';
import vert from '../shader/11-light-vert.glsl';
import { Material } from './Material';
import { MaterialPropertyEnum } from './type';
import { Mesh } from './Mesh';
import { SimpleEngine } from '.';
import { Node } from './Node';
import { Camera } from './Camera';

export function main() {
    const canvas = document.getElementById('canvas4') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');
    const engine = new SimpleEngine();
    const scene = engine.createScene();
    engine.setScene(scene);
    if (!gl) {
        return;
    }
    const geo1 = Geometry.getPlane();
    const effect1 = new Effect(gl, vert, frag);
    const material1 = new Material(effect1, [
        {
            name: 'u_gloss',
            type: MaterialPropertyEnum.FLOAT,
            value: 64,
        },
    ]);
    const mesh = new Mesh(gl, geo1, material1);
    const root = new Node('root');
    root.setMesh(mesh);
    const camera = new Camera(canvas.width / canvas.height, 45, 0.1, 2000);

    scene.addChildren(camera, root);
    engine.run();
}
