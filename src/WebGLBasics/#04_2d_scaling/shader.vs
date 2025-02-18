attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_rotation; // radian
uniform vec2 u_scale;

varying vec4 v_color;

void main() {
  mat2 rot = mat2(
    cos(u_rotation), -sin(u_rotation),
    sin(u_rotation), cos(u_rotation)
  );
  mat2 scale = mat2(
    u_scale.x, 0,
    0,         u_scale.y
  );
  vec2 position = a_position * scale * rot + u_translation;
  vec2 normalized = position / u_resolution;
  vec2 clipSpace = 2.0 * normalized - 1.0;
  vec2 inverseY = vec2(1, -1);

  gl_Position =  vec4(clipSpace * inverseY, 0, 1);
}