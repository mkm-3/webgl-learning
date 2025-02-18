attribute vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;

varying vec4 v_color;

void main() {
   // a_positionに移動距離を足す
   vec2 translatedPos = a_position + u_translation;

  vec2 normalized = translatedPos / u_resolution;
  vec2 clipSpace = 2.0 * normalized - 1.0;
  vec2 inverseY = vec2(1, -1);

  gl_Position =  vec4(clipSpace * inverseY, 0, 1);
}