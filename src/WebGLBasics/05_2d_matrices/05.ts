import fragmentShaderSource from "./shader.fs";
import vertexShaderSource from "./shader.vs";
import {
  assertNonNullable,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
  showWebGLInfo,
  setGeometry,
  getRotationMat3,
  getScalingMat3,
  multiplyMat3,
  getTranslationMat3,
  getProjectionMat3,
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

  const translation: [number, number] = [150, 150];
  const color: [number, number, number, number] = [
    Math.random(),
    Math.random(),
    Math.random(),
    1,
  ];
  const rotationDeg = 10;
  const scale: [number, number] = [0.9, 0.9];

  // create vbo
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  render(gl, {
    program,
    translation,
    color,
    rotationDeg,
    scale,
  });
}

type RenderContext = {
  program: WebGLProgram;
  translation: [number, number];
  color: [number, number, number, number];
  rotationDeg: number;
  scale: [number, number];
};
export function render(
  gl: WebGLRenderingContext,
  { program, translation, color, rotationDeg, scale }: RenderContext
) {
  /**
   * setup for render process
   */
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  // create attribute variables
  const positionAttrLoc = gl.getAttribLocation(program, "a_position"); // look up where the vertex data needs to go.
  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

  // create uniform variables
  const colorUniformLoc = gl.getUniformLocation(program, "u_color");
  const matrixUniformLoc = gl.getUniformLocation(program, "u_matrix");
  if (
    !assertNonNullable<WebGLUniformLocation>(colorUniformLoc) ||
    !assertNonNullable<WebGLUniformLocation>(matrixUniformLoc)
  ) {
    console.error(colorUniformLoc, matrixUniformLoc);
    throw new Error("Error: Failed to get uniform variable location.");
  }

  // set webgl configuration
  // clip space -> pixel space
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // activate created shader programs
  gl.useProgram(program);

  // enable attributes used in shaders
  gl.enableVertexAttribArray(positionAttrLoc);

  // upload vertices of rectangle
  // setRectangle(gl, translation[0], translation[1], width, height);

  gl.vertexAttribPointer(
    positionAttrLoc,
    2 /** size */,
    gl.FLOAT /** type */,
    false /**normalize */,
    0 /** stride */,
    0 /** offset */
  );

  // set color
  gl.uniform4fv(colorUniformLoc, color);

  // set translation
  let matrix = getProjectionMat3(gl.canvas.width, gl.canvas.height);
  matrix = multiplyMat3(matrix, getTranslationMat3(translation));
  matrix = multiplyMat3(matrix, getRotationMat3(rotationDeg));
  matrix = multiplyMat3(matrix, getScalingMat3(scale));
  matrix = multiplyMat3(matrix, getTranslationMat3([-50, -75]));

  gl.uniformMatrix3fv(matrixUniformLoc, false, matrix);

  // draw rectangles
  gl.drawArrays(gl.TRIANGLES, 0, 18);
}

window.onload = main;
