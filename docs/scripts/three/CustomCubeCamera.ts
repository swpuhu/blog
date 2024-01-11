import * as THREE from 'three';
const fov = -90; // negative fov is not an error
const aspect = 1;

export class CustomCubeCamera extends THREE.Object3D {
    public type: string = '';
    private coordinateSystem: number | null;
    constructor(
        public near: number,
        public far: number,
        private renderTarget: THREE.WebGLCubeRenderTarget
    ) {
        super();

        this.type = 'CubeCamera';

        this.renderTarget = renderTarget;
        this.coordinateSystem = null;

        const cameraPX = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPX.layers = this.layers;
        this.add(cameraPX);

        const cameraNX = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNX.layers = this.layers;
        this.add(cameraNX);

        const cameraPY = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPY.layers = this.layers;
        this.add(cameraPY);

        const cameraNY = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNY.layers = this.layers;
        this.add(cameraNY);

        const cameraPZ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraPZ.layers = this.layers;
        this.add(cameraPZ);

        const cameraNZ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        cameraNZ.layers = this.layers;
        this.add(cameraNZ);
    }

    private __updateCoordinateSystem() {
        const cameras = this.children.concat();

        const [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ] =
            cameras;

        for (const camera of cameras) this.remove(camera);

        cameraPX.up.set(0, 1, 0);
        cameraPX.lookAt(1, 0, 0);

        cameraNX.up.set(0, 1, 0);
        cameraNX.lookAt(-1, 0, 0);

        cameraPY.up.set(0, 0, -1);
        cameraPY.lookAt(0, 1, 0);

        cameraNY.up.set(0, 0, 1);
        cameraNY.lookAt(0, -1, 0);

        cameraPZ.up.set(0, 1, 0);
        cameraPZ.lookAt(0, 0, 1);

        cameraNZ.up.set(0, 1, 0);
        cameraNZ.lookAt(0, 0, -1);

        for (const camera of cameras) {
            this.add(camera);

            camera.updateMatrixWorld();
        }
    }

    public update(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        mipLevel?: number
    ) {
        if (this.parent === null) this.updateMatrixWorld();

        const renderTarget = this.renderTarget;

        if (this.coordinateSystem !== renderer.coordinateSystem) {
            this.coordinateSystem = renderer.coordinateSystem;

            this.__updateCoordinateSystem();
        }

        const [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ] =
            this.children;

        const currentRenderTarget = renderer.getRenderTarget();

        const currentXrEnabled = renderer.xr.enabled;

        renderer.xr.enabled = false;

        const generateMipmaps = renderTarget.texture.generateMipmaps;

        renderTarget.texture.generateMipmaps = false;

        renderer.setRenderTarget(renderTarget, 0, mipLevel);
        renderer.render(scene, cameraPX as THREE.Camera);

        renderer.setRenderTarget(renderTarget, 1, mipLevel);
        renderer.render(scene, cameraNX as THREE.Camera);

        renderer.setRenderTarget(renderTarget, 2, mipLevel);
        renderer.render(scene, cameraPY as THREE.Camera);

        renderer.setRenderTarget(renderTarget, 3, mipLevel);
        renderer.render(scene, cameraNY as THREE.Camera);

        renderer.setRenderTarget(renderTarget, 4, mipLevel);
        renderer.render(scene, cameraPZ as THREE.Camera);

        renderTarget.texture.generateMipmaps = generateMipmaps;

        renderer.setRenderTarget(renderTarget, 5, mipLevel);
        renderer.render(scene, cameraNZ as THREE.Camera);

        renderer.setRenderTarget(currentRenderTarget);

        renderer.xr.enabled = currentXrEnabled;

        renderTarget.texture.needsPMREMUpdate = true;
    }
}
