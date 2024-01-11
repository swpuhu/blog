varying vec4 vScreenPos;
uniform sampler2D mainTex;
uniform sampler2D noiseTex;
uniform float time;

void main () {
    vec3 screenPos = vScreenPos.xyz / vec3(vScreenPos.w);
    vec2 noiseUv = screenPos.xy * 1.5 + time * 0.02;

    noiseUv = noiseUv * 0.5 + 0.5;
    vec2 noise = texture(noiseTex, noiseUv).rr * 2.0 - 1.0;
    
    vec2 uv = screenPos.xy * 0.5 + 0.5;
    uv.x = 1.0 - uv.x;
    uv += noise * 0.02;
    vec4 color = texture(mainTex, uv);
    color.rgb = pow(color.rgb, vec3(1. / 2.2));
    gl_FragColor = color;
}