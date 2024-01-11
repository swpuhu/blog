
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
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, N));
    up = normalize(cross(N, right));

    float sampleDelta = 0.025;
    float nrSamples = 0.0;
    for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta) {
        for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta) {
                // spherical to cartesian (in tangent space)
            vec3 tangentSample = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
                // tangent space to world
            vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N;
            vec4 texColor = textureCube(envMap, sampleVec);

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