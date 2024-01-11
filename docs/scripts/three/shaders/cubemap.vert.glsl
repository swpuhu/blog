varying vec3 vWorldDirection;
varying vec3 vWorldPosition;

#include <common>

void main() {

    vWorldDirection = transformDirection(position, modelMatrix);

	#include <begin_vertex>
	#include <project_vertex>

    vec4 worldPosition = (modelMatrix * vec4(position, 1.0));
    vWorldPosition = worldPosition.xyz;

    gl_Position.z = gl_Position.w; // set z to camera.far

}