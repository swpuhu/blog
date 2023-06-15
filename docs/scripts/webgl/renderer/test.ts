import { Effect } from './Effect';
import { Geometry } from './Geometry';
import frag from '../shader/plain-frag.glsl';
import vert from '../shader/plain-vert.glsl';
import { Material } from './Material';
import { MaterialPropertyEnum } from './type';
import { Mesh } from './Mesh';
import { SimpleEngine } from '.';
import { Node } from './Node';
import { Camera } from './Camera';
import { lookAt } from '../util';

export function main() {
    const canvas = document.getElementById('canvas4') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');
    const engine = new SimpleEngine();
    const scene = engine.createScene();
    engine.setScene(scene);
    if (!gl) {
        return;
    }
    const geo1 = Geometry.getCube();
    const geo2 = Geometry.getPlane();
    const effect1 = new Effect(gl, vert, frag);
    const material1 = new Material(
        effect1,
        [
            {
                name: 'u_color',
                type: MaterialPropertyEnum.FLOAT3,
                value: [1.0, 0.5, 0.0],
            },
        ],
        {
            depthStencilState: {
                depthTest: true,
                depthWrite: true,
            },
        }
    );
    const material2 = new Material(
        effect1,
        [
            {
                name: 'u_color',
                type: MaterialPropertyEnum.FLOAT3,
                value: [1.0, 0.8, 1.0],
            },
        ],
        {
            depthStencilState: {
                depthTest: true,
                depthWrite: true,
            },
        }
    );

    const root = new Node('root');
    const child1 = new Node('child');
    new Mesh(gl, geo1, material1, root);
    new Mesh(gl, geo2, material2, child1);
    const camera = new Camera(canvas.width / canvas.height, 45, 0.1, 2000);
    camera.x = 1;
    camera.y = 1;
    camera.z = 1;
    root.z = -2;
    child1.z = 0;
    child1.x = 1;
    root.addChildren(child1);

    const cameraWorldPos = camera.convertToWorldSpace([0, 0, 0]);
    console.log(cameraWorldPos);
    lookAt([0, 1, 0], [0, 0, -2]);

    scene.addChildren(camera, root);
    engine.run();
}
