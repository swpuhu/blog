import * as THREE from 'three';
import { WebGLCubeMaps } from 'three/src/renderers/webgl/WebGLCubeMaps';

const backgroundVertShader = /* glsl */ `
varying vec3 vWorldDirection;
varying vec3 vWorldPosition;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

    vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
        vWorldPosition = worldPosition.xyz;

	gl_Position.z = gl_Position.w; // set z to camera.far

}
`;

const backgroundFragShader = /* glsl */ `
#define PI 3.1415926
#ifdef ENVMAP_TYPE_CUBE

	uniform samplerCube envMap;

#elif defined( ENVMAP_TYPE_CUBE_UV )


#endif

uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldPosition;

varying vec3 vWorldDirection;

#include <cube_uv_reflection_fragment>

void main() {

	#ifdef ENVMAP_TYPE_CUBE

		
        vec3 N = normalize(vWorldPosition);

        vec3 irradiance = vec3(0.0);   
        
        // tangent space calculation from origin point
        vec3 up    = vec3(0.0, 1.0, 0.0);
        vec3 right = normalize(cross(up, N));
        up         = normalize(cross(N, right));
        
        float sampleDelta = 0.025;
        float nrSamples = 0.0;
        for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta)
        {
            for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta)
            {
                // spherical to cartesian (in tangent space)
                vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
                // tangent space to world
                vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N; 
                vec4 texColor = textureCube( envMap, sampleVec);

                irradiance += texColor.rgb * cos(theta) * sin(theta);
                nrSamples++;
            }
        }
        irradiance = PI * irradiance * (1.0 / float(nrSamples));

	#endif


	gl_FragColor = vec4(irradiance, 1.0);

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;

export class CustomBackground {
    public mesh: THREE.Mesh;
    constructor(private vert?: string, private frag?: string) {
        this.mesh = this.__init();
    }

    private __init(): THREE.Mesh {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.ShaderMaterial({
            name: 'customBackground',
            vertexShader: this.vert || backgroundVertShader,
            fragmentShader: this.frag || backgroundFragShader,
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
