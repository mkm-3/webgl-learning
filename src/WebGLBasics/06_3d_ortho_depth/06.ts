import { m4, Vector3 } from "./math";
import {
  assertNonNullable,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
  showWebGLInfo,
} from "./util";

// import shaders
import fragmentShaderSource from "./shader.fs";
import vertexShaderSource from "./shader.vs";
import { setColors, setGeometry } from "./primitive";

function main() {
  /**
   * create WebGL context
   */
  const canvas = assertNonNullable(
    document.getElementById("main_canvas") as HTMLCanvasElement | null
  );
  resizeCanvasToDisplaySize(canvas);

  const gl = canvas.getContext("webgl"); // webgl version 1 (OpenGL ES 1.0)
  if (!gl) {
    throw new Error("Error: No available shader in this environment.");
  }
  showWebGLInfo(gl);

  // create shader program
  const vertexShader = assertNonNullable(
    createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  );
  const fragmentShader = assertNonNullable(
    createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  );

  const program = assertNonNullable(
    createProgram(gl, vertexShader, fragmentShader)
  );

  const translation: Vector3 = [150, 150, 150];
  const rotation: Vector3 = [Math.PI / 8, Math.PI / 8, Math.PI / 8];
  const scale: Vector3 = [2.0, 2.0, 2.0];

  render(gl, {
    program,
    translation,
    rotation,
    scale,
  });
}

type RenderContext = {
  program: WebGLProgram;
  translation: Vector3;
  rotation: Vector3;
  scale: Vector3;
};
export function render(
  gl: WebGLRenderingContext,
  { program, translation, rotation, scale }: RenderContext
) {
  /**
   * setup for render process
   */
  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

  // clip space -> pixel space
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // activate created shader programs
  gl.useProgram(program);

  // create uniform variables
  // const colorUniformLoc = gl.getUniformLocation(program, "u_color");
  const matrixUniformLoc = assertNonNullable(
    gl.getUniformLocation(program, "u_matrix")
  );

  // create attribute variables
  const positionAttrLoc = gl.getAttribLocation(program, "a_position"); // look up where the vertex data needs to go.
  gl.enableVertexAttribArray(positionAttrLoc);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);
  gl.vertexAttribPointer(
    positionAttrLoc,
    3 /** size */,
    gl.FLOAT /** type */,
    false /**normalize */,
    0 /** stride */,
    0 /** offset */
  );

  // create color variables
  const colorAttrLoc = gl.getAttribLocation(program, "a_color");
  gl.enableVertexAttribArray(colorAttrLoc);
  // 色バッファ作成
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);
  {
    // 属性にどうやってcolorBuffer（ARRAY_BUFFER)からデータを取り出すか。
    const size = 3; // 呼び出すごとに3つの数値
    const type = gl.UNSIGNED_BYTE; // データは8ビット符号なし整数
    const normalize = true; // データをnormalizeする（０〜２５５から０−１に）
    const stride = 0; // シェーダーを呼び出すごとに進む距離
    // 0 = size * sizeof(type)
    var offset = 0; // バッファーの頭から取り始める
    gl.vertexAttribPointer(colorAttrLoc, size, type, normalize, stride, offset);
  }

  // matrix
  {
    // 正投影
    // const left = 0;
    // const right = gl.canvas.width;
    // const bottom = gl.canvas.width;
    // const top = 0;
    // const near = 400;
    // const far = -400;
    // const projection = m4.orthographic(left, right, bottom, top, near, far);

    // 透視投影
    const projection = m4.projection(gl.canvas.width, gl.canvas.height, 1000);

    let matrix = projection;
    matrix = m4.translate(matrix, ...translation);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, ...scale);

    gl.uniformMatrix4fv(matrixUniformLoc, false, matrix);
  }

  // 前向き三角形のみ描画
  gl.enable(gl.CULL_FACE);

  // 深度テストを有効化
  gl.enable(gl.DEPTH_TEST);

  // draw rectangles
  gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
}

window.onload = main;
