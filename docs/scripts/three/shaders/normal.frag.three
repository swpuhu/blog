#include <common>
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vTangent;
varying vec3 vBitangent;
uniform sampler2D mainTex;
uniform sampler2D normalTex;

struct DirectionalLight {
    vec3 direction;
    vec3 color;
};
uniform DirectionalLight directionalLight;

vec3 render(DirectionalLight light, vec3 normal, vec3 diffuseColor) {
    float NdotL = clamp(dot(light.direction, normal), 0.0, 1.0);
    return diffuseColor * NdotL * light.color;
}
void main() {
    vec2 uv = vUv;
    vec4 normalColor = texture(normalTex, uv);
    vec4 mainColor = texture(mainTex, uv);
    vec3 mapN = normalize(2.0 * normalColor.rgb - 1.0);
    //mapN.xy *= 0.0;

    vec3 normal = normalize(vNormal);
    mat3 tbn = mat3(normalize(vTangent), normalize(vBitangent), normal);
    normal = normalize(tbn * mapN);

    vec3 color = render(directionalLight, normal, mainColor.rgb);

    gl_FragColor = vec4(color, 1.0);
}
