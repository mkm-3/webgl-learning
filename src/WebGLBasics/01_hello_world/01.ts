import fragmentShaderSource from "./shader.fs?raw";
import vertexShaderSource from "./shader.vs?raw";
import {
  assertNonNullable,
  createProgram,
  createShader,
  randomInt,
  setRectangle,
  resizeCanvasToDisplaySize,
  showWebGLInfo,
} from "../06_3d_ortho_depth/util";

function main() {
  /**
   * create WebGL context
   */
  const canvas = document.getElementById("main_canvas");
  if (!assertNonNullable<HTMLCanvasElement>(canvas)) {
    throw new Error("No canvas ref found.");
  }

  resizeCanvasToDisplaySize(canvas);

  const gl = canvas.getContext("webgl"); // webgl version 1 (OpenGL ES 1.0)
  if (!gl) {
    throw new Error("Error: No available shader in this environment.");
  }
  showWebGLInfo(gl);

  // create shader program
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  if (!vertexShader || !fragmentShader) {
    return;
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    throw new Error("Error: No available shader program.");
  }

  /**
   * setup for render process
   */
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  const positionAttrLoc = gl.getAttribLocation(program, "a_position"); // set attribute variable
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const resUniformLoc = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resUniformLoc, gl.canvas.width, gl.canvas.height);

  const colorUniformLoc = gl.getUniformLocation(program, "u_color");

  // prettier-ignore
  const positions = new Float32Array([
    100, 200,
    800, 200,
    100, 600,
    100, 600,
    800, 200,
    800, 600,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(
    positionAttrLoc /** location */,
    2 /** size */,
    gl.FLOAT /** type */,
    false /** normalization */,
    0 /** offset */,
    0 /** stride */
  );
  gl.enableVertexAttribArray(positionAttrLoc);
  // gl.drawArrays(gl.TRIANGLES, 0, 6);

  for (let i = 0; i < 50; i++) {
    setRectangle(
      gl,
      randomInt(300),
      randomInt(300),
      randomInt(300),
      randomInt(300)
    );

    gl.uniform4f(
      colorUniformLoc,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

window.onload = main;
