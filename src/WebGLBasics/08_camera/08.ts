import { m4, v3, Vector3 } from "./math";
import {
  assertNonNullable,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
  showWebGLInfo,
} from "./util";

// import shaders
import fragmentShaderSource from "./shader.fs?raw";
import vertexShaderSource from "./shader.vs?raw";
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

  // rendering params
  const translation: Vector3 = [0, 0, 0];
  const rotation: Vector3 = [0, 0, 0];
  const scale: Vector3 = [2.0, 2.0, 2.0];
  const fieldOfViewDegrees = 100;
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 1;
  const zFar = 2000;

  render(gl, {
    program,
    translation,
    rotation,
    scale,
    matrixUniformLoc,
    fieldOfViewDegrees,
    aspect,
    zNear,
    zFar,
  });
}

type RenderContext = {
  program: WebGLProgram;
  translation: Vector3;
  rotation: Vector3;
  scale: Vector3;
  matrixUniformLoc: WebGLUniformLocation;
  fieldOfViewDegrees: number;
  aspect: number;
  zNear: number;
  zFar: number;
};
export function render(
  gl: WebGLRenderingContext,
  {
    program,
    translation,
    rotation,
    scale,
    matrixUniformLoc,
    fieldOfViewDegrees,
    aspect,
    zNear,
    zFar,
  }: RenderContext
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
  gl.clear(gl.DEPTH_BUFFER_BIT);

  // activate created shader programs
  gl.useProgram(program);

  // 深度テストを有効化
  gl.enable(gl.DEPTH_TEST);

  // uniform変数計算：matrix
  {
    // params
    const radius = 200;
    const numObj = 5;
    const cameraAngleDegrees = 105;
    const cameraAngleRadians = (Math.PI * cameraAngleDegrees) / 180;

    const objPosition = v3.new(radius, 0, 0);

    // calculate camera matrix -> view-projection matrix
    let cameraMatrix = m4.translate(
      m4.yRotation(cameraAngleRadians),
      0,
      0,
      radius * 1.5
    );
    const cameraPosition = v3.new(
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14]
    );
    const cameraUp = v3.new(0, 1, 0);
    cameraMatrix = m4.lookAt(cameraPosition, objPosition, cameraUp); // カメラ行列を計算

    const viewMatrix = m4.inverse(cameraMatrix); // objectをカメラの前に移動させる
    // const projectionMatrix = m4.projection(
    //   gl.canvas.width,
    //   gl.canvas.height,
    //   1000
    // );

    const fieldOfViewRadians = (Math.PI * fieldOfViewDegrees) / 180;
    const projectionMatrix = m4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar
    );

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // draw "F"

    // objMatrix = m4.translate(objMatrix, ...translation);
    // objMatrix = m4.xRotate(objMatrix, rotation[0]);
    // objMatrix = m4.yRotate(objMatrix, rotation[1]);
    // objMatrix = m4.zRotate(objMatrix, rotation[2]);
    // objMatrix = m4.scale(objMatrix, ...scale);

    for (let i = 0; i < numObj; i++) {
      const angle = (i * Math.PI * 2) / numObj;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // view-projection と obj 行列からobj行列を計算する
      const matrix = m4.translate(viewProjectionMatrix, x, 0, y);
      gl.uniformMatrix4fv(matrixUniformLoc, false, matrix);

      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      const count = 16 * 6;
      gl.drawArrays(primitiveType, offset, count);
    }

    // gl.uniformMatrix4fv(matrixUniformLoc, false, matrix);
  }

  // 前向き三角形のみ描画
  // gl.enable(gl.CULL_FACE);
}

window.onload = main;
