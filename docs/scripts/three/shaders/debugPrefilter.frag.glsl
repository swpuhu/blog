varying vec2 vUv;
uniform samplerCube envMap;
uniform float uLevel;
void main() {
    vec2 uv = vUv * vec2(4.0, 3.0);
    vec2 st = fract(uv);
    vec2 id = floor(uv);
    st = st * 2.0 - 1.0;
    vec3 color;
    vec3 dir = vec3(0.0);
    if(id.x == 1.0 && id.y == 1.0) {
        dir = normalize(vec3(st.x, st.y, -1.0));
    } else if(id.x == 0.0 && id.y == 1.0) {
        dir = normalize(vec3(-1.0, st.y, -st.x));
    } else if(id.x == 2.0 && id.y == 1.0) {
        dir = normalize(vec3(1.0, st.y, st.x));
    } else if(id.x == 3.0 && id.y == 1.0) {
        dir = normalize(vec3(-st.x, st.y, 1.0));
    } else if(id.x == 1.0 && id.y == 2.0) {
        dir = normalize(vec3(st.x, 1.0, st.y));
    } else if(id.x == 1.0 && id.y == 0.0) {
        dir = normalize(vec3(st.x, -1.0, -st.y));
    }
    color = textureLod(envMap, dir, uLevel).rgb;

    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0 / 2.2));
    gl_FragColor = vec4(color, 1.0);
}