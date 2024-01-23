import { SimpleEngine } from '../../../submodule/renderer';
import { Effect } from '../../../submodule/renderer/Effect';
import { Geometry } from '../../../submodule/renderer/Geometry';
import { Material } from '../../../submodule/renderer/Material';
import { Mesh } from '../../../submodule/renderer/Mesh';
import { Node } from '../../../submodule/renderer/Node';
import frag from '../../../submodule/renderer/shader/11-light-frag.glsl';
import vert from '../../../submodule/renderer/shader/11-light-vert.glsl';
import { ObjLoader } from '../../../submodule/renderer/ObjLoader';
import { MaterialPropertyEnum } from '../../../submodule/renderer/type';
import { PhongMaterial } from '../../../submodule/renderer/material/PhongMaterial';
import { Camera } from '../../../submodule/renderer/Camera';
import { withBase } from 'vitepress';

export function main() {
    const canvas = document.getElementById('canvas4') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');
    if (!gl) {
        return;
    }
    const engine = new SimpleEngine(gl);
    const scene = engine.createScene();
    engine.setScene(scene);
    const objLoader = new ObjLoader();
    objLoader.load(withBase('/model/dragon.obj')).then(geo => {
        const node = new Node('bunny');
        new Mesh(geo, material2, node);
        scene.addChildren(node);
    });
    const geo1 = Geometry.getCube();
    const effect1 = new Effect(vert, frag);
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
    const material2 = new PhongMaterial([0.5, 0.2, 0.2], [1.0, 1.0, 0.0]);

    const root = new Node('root');
    const child1 = new Node('child');
    new Mesh(geo1, material2, root);
    const camera = new Camera(canvas.width / canvas.height, 45, 0.1, 2000);
    camera.x = 0;
    camera.y = 5;
    camera.z = 15;
    root.z = 0;
    child1.z = 0;
    child1.x = 1;
    root.addChildren(child1);

    scene.addChildren(camera);
    engine.run();
}
