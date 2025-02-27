attribute vec2 a_position;

uniform vec2 u_resolution;

void main() {

  vec2 normalized = a_position / u_resolution;
  vec2 clipSpace = 2.0 * normalized - 1.0;
  vec2 inverseY = vec2(1, -1);

  gl_Position =  vec4(clipSpace * inverseY, 0, 1);
}