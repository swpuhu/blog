varying vec3 vWorldDirection;
uniform samplerCube envMap;

void main() {

	vec4 texColor = textureCube( envMap, vWorldDirection);
	texColor.rgb = pow(texColor.rgb, vec3(0.8));
	gl_FragColor = texColor;
}