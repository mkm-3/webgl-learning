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
  const fieldOfViewDegrees = 100;
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 1;
  const zFar = 2000;
  const cameraRadius = 200;
  const cameraAngleRotDegreesPerSec = 0.1;
  let cameraAngleDegrees = 0;

  function update(deltaTimeMs: number) {
    cameraAngleDegrees += cameraAngleRotDegreesPerSec * deltaTimeMs;
  }

  let prevTime = 0;
  function draw(gl: WebGLRenderingContext, deltaTime: number) {
    update(deltaTime);

    render(gl, {
      program,
      matrixUniformLoc,
      fieldOfViewDegrees,
      aspect,
      zNear,
      zFar,
      cameraAngleDegrees,
      cameraRadius,
    });

    return requestAnimationFrame((now: number) => {
      const deltaTime = now - prevTime;
      prevTime = now;

      draw(gl, deltaTime);
    });
  }

  draw(gl, 0);
}

type RenderContext = {
  program: WebGLProgram;
  matrixUniformLoc: WebGLUniformLocation;
  fieldOfViewDegrees: number;
  aspect: number;
  zNear: number;
  zFar: number;
  cameraAngleDegrees: number;
  cameraRadius: number;
};
export function render(
  gl: WebGLRenderingContext,
  {
    program,
    matrixUniformLoc,
    fieldOfViewDegrees,
    aspect,
    zNear,
    zFar,
    cameraAngleDegrees,
    cameraRadius,
  }: RenderContext
) {
  /**
   * setup for render process
   */
  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

  // clip space -> pixel space
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // activate created shader programs
  gl.useProgram(program);

  // 深度テストを有効化
  gl.enable(gl.DEPTH_TEST);

  // uniform変数計算：matrix
  {
    // params
    const cameraAngleRadians = (Math.PI * cameraAngleDegrees) / 180;

    const objPosition = v3.new(0, 0, 0);

    // calculate camera matrix -> view-projection matrix
    let cameraMatrix = m4.translate(
      m4.yRotation(cameraAngleRadians),
      0,
      0,
      cameraRadius
    );
    const cameraPosition = v3.new(
      cameraMatrix[12],
      cameraMatrix[13],
      cameraMatrix[14]
    );
    const cameraUp = v3.new(0, 1, 0);
    cameraMatrix = m4.lookAt(cameraPosition, objPosition, cameraUp); // カメラ行列を計算

    const viewMatrix = m4.inverse(cameraMatrix); // objectをカメラの前に移動させる

    const fieldOfViewRadians = (Math.PI * fieldOfViewDegrees) / 180;
    const projectionMatrix = m4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar
    );

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // draw "F"
    {
      const matrix = m4.translate(viewProjectionMatrix, 0, 0, 0);
      gl.uniformMatrix4fv(matrixUniformLoc, false, matrix);

      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      const count = 16 * 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }
}

window.onload = main;
