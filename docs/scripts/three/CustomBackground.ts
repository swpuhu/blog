import * as THREE from 'three';
import irradianceVert from '../three/shaders/irradiance.vert.glsl';
import irradianceFrag from '../three/shaders/irradiance.frag.glsl';

export class CustomBackground {
    public mesh: THREE.Mesh;
    constructor(private vert?: string, private frag?: string) {
        this.mesh = this.__init();
    }

    private __init(): THREE.Mesh {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.ShaderMaterial({
            name: 'customBackground',
            vertexShader: this.vert || irradianceVert,
            fragmentShader: this.frag || irradianceFrag,
            uniforms: THREE.UniformsUtils.clone(
                THREE.ShaderLib.backgroundCube.uniforms
            ),
            side: THREE.BackSide,
            depthTest: false,
            depthWrite: false,
            fog: false,
            defines: {
                ENVMAP_TYPE_CUBE: true,
            },
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.geometry.deleteAttribute('normal');
        mesh.geometry.deleteAttribute('uv');

        mesh.onBeforeRender = function (
            this: THREE.Mesh,
            _renderer,
            _scene,
            camera
        ) {
            this.matrixWorld.copyPosition(camera.matrixWorld);
        };

        return mesh;
    }

    public setCubeTexture(texture: THREE.CubeTexture) {
        const mat = this.mesh.material as THREE.ShaderMaterial;
        mat.uniforms.envMap.value = texture;
    }
}
