attribute vec2 a_position;

uniform mat3 u_matrix;

varying vec4 v_color;

void main() {
  // vec2 position = (u_matrix * vec3(a_position, 1)).xy;
  // vec2 inverseY = vec2(1, -1);
  gl_Position =  vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
}