attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_rotation; // rotation (rad)

varying vec4 v_color;

void main() {
  vec2 rotatedPosition = vec2(
    a_position.x * cos(u_rotation) + a_position.y * sin(u_rotation),
    -1.0 * a_position.x * sin(u_rotation) + a_position.y * cos(u_rotation)
  );
  vec2 position = rotatedPosition + u_translation;
  vec2 normalized = position / u_resolution;
  vec2 clipSpace = 2.0 * normalized - 1.0;
  vec2 inverseY = vec2(1, -1);

  gl_Position =  vec4(clipSpace * inverseY, 0, 1);
}