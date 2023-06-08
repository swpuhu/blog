attribute vec4 a_position;
uniform mat4 u_proj;
uniform mat4 u_viewInv;
void main() {
    gl_Position = u_proj * u_viewInv * a_position;
}
