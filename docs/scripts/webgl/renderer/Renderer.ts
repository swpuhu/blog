import { Scene } from './Scene';

export class Renderer {
    constructor() {}

    render(scene: Scene): void {
        const meshes = scene.getAllMesh();
        const cameras = scene.getCameras();
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].render(cameras[0]);
        }
    }
}
