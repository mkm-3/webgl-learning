#version 300 es
in vec2 a_position;

uniform vec2 u_resolution; // (canvas.width, canvas.height)

void main() {
  gl_Position =  vec4(a_position, 0.0, 1.0);
}