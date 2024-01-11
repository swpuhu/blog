varying vec3 vWorldPosition;
varying vec3 vNormal;
uniform samplerCube envMap;
void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(vWorldPosition - cameraPosition);
    vec3 reflectDir = reflect(viewDir, n);

    vec3 R = viewDir - 2.0 * dot(n, viewDir) * n;
    vec4 texColor = textureCube( envMap, normalize(R));
    texColor.rgb = mix(texColor.rgb, vec3(1.0, 0.5, 1.0), 0.2);
    gl_FragColor = texColor;
}