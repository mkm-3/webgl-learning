import fragmentShaderSource from "./shader.fs?raw";
import vertexShaderSource from "./shader.vs?raw";
import {
  assertNonNullable,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
  showWebGLInfo,
  setGeometry,
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

  const translation: [number, number] = [100, 100];
  const color: [number, number, number, number] = [
    Math.random(),
    Math.random(),
    Math.random(),
    1,
  ];

  // create vbo
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  render(gl, {
    program,
    translation,
    color,
    rotationDeg: 0,
  });
}

type RenderContext = {
  program: WebGLProgram;
  translation: [number, number];
  rotationDeg?: number;
  color: [number, number, number, number];
};
export function render(
  gl: WebGLRenderingContext,
  { program, translation, color, rotationDeg = 0 }: RenderContext
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
  const resUniformLoc = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resUniformLoc, gl.canvas.width, gl.canvas.height);

  const colorUniformLoc = gl.getUniformLocation(program, "u_color");
  const translationUniformLoc = gl.getUniformLocation(program, "u_translation");
  const rotationRadUniformLoc = gl.getUniformLocation(program, "u_rotation");
  if (
    !assertNonNullable<WebGLUniformLocation>(resUniformLoc) ||
    !assertNonNullable<WebGLUniformLocation>(colorUniformLoc) ||
    !assertNonNullable<WebGLUniformLocation>(translationUniformLoc) ||
    !assertNonNullable<WebGLUniformLocation>(rotationRadUniformLoc)
  ) {
    console.error(
      resUniformLoc,
      colorUniformLoc,
      translationUniformLoc,
      rotationRadUniformLoc
    );
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

  // set uniform variable: resolution
  gl.uniform2f(resUniformLoc, gl.canvas.width, gl.canvas.height);

  // set color
  gl.uniform4fv(colorUniformLoc, color);

  // set translation
  gl.uniform2fv(translationUniformLoc, translation);

  // set rotation
  gl.uniform1f(rotationRadUniformLoc, (Math.PI * rotationDeg) / 180);

  // draw rectangles
  gl.drawArrays(gl.TRIANGLES, 0, 18);
}

window.onload = main;
