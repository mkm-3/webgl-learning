precision mediump float;

// 頂点シェーダから渡された色
varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}