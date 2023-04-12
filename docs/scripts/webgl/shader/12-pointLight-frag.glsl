precision mediump float;
varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_worldPos;
uniform vec3 u_viewWorldPos;
uniform float u_gloss;
uniform vec3 u_lightPos;
uniform vec3 coefficient;
void main() {
    float kc = coefficient[0];
    float kl = coefficient[1];
    float kq = coefficient[2];
    vec3 n = normalize(v_normal);
    vec3 lightDir = normalize(u_lightPos - v_worldPos);
    float distance = length(u_lightPos - v_worldPos);
    vec3 viewDir = normalize(u_viewWorldPos - v_worldPos);
    vec3 r = 2.0 * dot(n, lightDir) * n - lightDir;
    float atten = 1.0 / (kc + kl * distance + kq * distance * distance);
    float LdotN = dot(lightDir, n);
    float RdotV = dot(viewDir, r);
    vec3 dColor = vec3(0.5);
    vec3 sColor = vec3(1.0);
    vec3 ambient = vec3(0.2);
    vec3 diffuse = dColor * max(0.0, LdotN);
    vec3 specular = sColor * pow(max(0.0, RdotV), u_gloss);

    vec3 color = ambient + (diffuse + specular) * atten;

    color = pow(color, vec3(1.0 / 1.5));
    gl_FragColor = vec4(color, 1.0);
}