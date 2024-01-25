#include <common>
varying vec3 vNormal;
varying vec2 vUv;
#ifdef USE_TANGENT
varying vec3 vTangent;
varying vec3 vBitangent;
#endif
void main() {
    vUv = uv;
    vec3 transformedNormal = normalMatrix * vec3(normal);
    // vNormal = normalize(transformedNormal);

    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vNormal = worldNormal;

    #ifdef USE_TANGENT
    vec3 transformedTangent = (modelViewMatrix * vec4(tangent.xyz, 0.0)).xyz;
    vTangent = normalize(transformedTangent);
    vBitangent = normalize(cross(vNormal, vTangent) * tangent.w);
    #endif

    vec4 mvPosition = vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;
}
