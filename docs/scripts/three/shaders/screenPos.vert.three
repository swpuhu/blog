varying vec4 vScreenPos;
void main () {
    vec4 mvPosition = vec4(position, 1.0);
    mvPosition = modelViewMatrix * mvPosition;
    vScreenPos = projectionMatrix * mvPosition;
    gl_Position = vScreenPos;
}