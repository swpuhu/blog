varying vec4 vScreenPos;
uniform sampler2D mainTex;
uniform sampler2D noiseTex;
uniform float time;

void main() {
    vec3 screenPos = vScreenPos.xyz / vec3(vScreenPos.w);

    vec2 uv = screenPos.xy * 0.5 + 0.5;
    uv.x = 1.0 - uv.x;
    vec4 color = texture(mainTex, uv);
    color.rgb = pow(color.rgb, vec3(1. / 2.2));
    gl_FragColor = color;
}