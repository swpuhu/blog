import * as THREE from 'three';

export class CustomBackground {
    public mesh: THREE.Mesh;
    constructor(
        private vert: string,
        private frag: string,
        private name: string,
        private isSkyBox = true
    ) {
        this.mesh = this.__init();
    }

    private __init(): THREE.Mesh {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.ShaderMaterial({
            name: this.name,
            vertexShader: this.vert,
            fragmentShader: this.frag,
            uniforms: {
                envMap: { value: null },
                flipEnvMap: { value: -1 },
                backgroundBlurriness: { value: 0 },
                backgroundIntensity: { value: 1 },
                roughness: { value: 0 },
            },
            side: THREE.BackSide,
            depthTest: false,
            depthWrite: false,
            fog: false,
            defines: {
                ENVMAP_TYPE_CUBE: true,
            },
        });

        mat.uniformsNeedUpdate = true;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.geometry.deleteAttribute('normal');
        mesh.geometry.deleteAttribute('uv');
        if (this.isSkyBox) {
            mesh.onBeforeRender = function (
                this: THREE.Mesh,
                _renderer,
                _scene,
                camera
            ) {
                this.matrixWorld.copyPosition(camera.matrixWorld);
            };
        }

        return mesh;
    }

    public setCubeTexture(texture: THREE.CubeTexture) {
        const mat = this.mesh.material as THREE.ShaderMaterial;
        mat.uniforms.envMap.value = texture;
    }

    public setRoughness(value: number) {
        const mat = this.mesh.material as THREE.ShaderMaterial;
        mat.uniforms.roughness.value = value;
        mat.needsUpdate = true;
    }
}
