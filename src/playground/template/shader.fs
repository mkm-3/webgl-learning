#version 300 es
precision mediump float;

out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
  fragColor = vec4(vec3((sin(u_time) + 1.0), (cos(u_time) + 1.0), (sin(u_time) * cos(u_time) + 1.0)) / 2.0, 1.0);
}