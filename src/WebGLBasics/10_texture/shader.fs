precision mediump float;

// 頂点シェーダから渡された色
varying vec4 v_color;

// 頂点シェーダから渡されたテクスチャ座標系の情報
varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord);
}