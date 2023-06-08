import { Renderer } from './Renderer';
import { Scene } from './Scene';

export class SimpleEngine {
    private __rfId = -1;
    private __currentScene: Scene | null = null;
    private __renderer: Renderer = new Renderer();
    constructor() {
        this.mainLoop = this.mainLoop.bind(this);
    }

    createScene(): Scene {
        const scene = new Scene('scene');
        return scene;
    }

    setScene(s: Scene): void {
        this.__currentScene = s;
    }

    run(): void {
        this.mainLoop();
    }

    private mainLoop(): void {
        if (this.__currentScene) {
            this.__renderer.render(this.__currentScene);
        }
        this.__rfId = requestAnimationFrame(this.mainLoop);
    }

    stop(): void {
        cancelAnimationFrame(this.__rfId);
    }
}
