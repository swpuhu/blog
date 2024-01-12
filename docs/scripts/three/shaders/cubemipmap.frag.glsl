
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

    vec3 N = normalize(vWorldDirection);

    vec4 texColor = textureLod(envMap, N, 5.0);

    gl_FragColor = texColor;

    #endif

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}