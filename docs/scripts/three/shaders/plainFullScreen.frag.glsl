uniform sampler2D mainTex;
varying vec2 vUv;

void main() {
    vec4 color = texture(mainTex, vUv);
    color.a *= 0.7;
    gl_FragColor = color;
}