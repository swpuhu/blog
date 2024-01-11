varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vWorldPosition;
void main() {
    vUv = uv;
    vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    vNormal = worldNormal;

    vec3 transformedTangent = (modelViewMatrix * vec4(tangent.xyz, 0.0)).xyz;
    vTangent = normalize(transformedTangent);
    vBitangent = normalize(cross(vNormal, vTangent) * tangent.w);

    vec4 mvPosition = vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;

    vec4 worldPosition = (modelMatrix * vec4(position, 1.0));
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}