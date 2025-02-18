import fragmentShaderSource from "./shader.fs?raw";
import vertexShaderSource from "./shader.vs?raw";
import {
  assertNonNullable,
  createProgram,
  createShader,
  resizeCanvasToDisplaySize,
  showWebGLInfo,
  setGeometry,
} from "../../utils";

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

  // create attribute variables
  const positionAttrLoc = gl.getAttribLocation(program, "a_position"); // look up where the vertex data needs to go.

  // create uniform variables
  const resUniformLoc = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resUniformLoc, gl.canvas.width, gl.canvas.height);

  const colorUniformLoc = gl.getUniformLocation(program, "u_color");
  const translationUniformLoc = gl.getUniformLocation(program, "u_translation");
  if (
    !assertNonNullable<WebGLUniformLocation>(resUniformLoc) ||
    !assertNonNullable<WebGLUniformLocation>(colorUniformLoc) ||
    !assertNonNullable<WebGLUniformLocation>(translationUniformLoc)
  ) {
    console.error(resUniformLoc, colorUniformLoc, translationUniformLoc);
    throw new Error("Error: Failed to get uniform variable location.");
  }

  const translation: [number, number] = [100, 100];
  const color: [number, number, number, number] = [
    Math.random(),
    Math.random(),
    Math.random(),
    1,
  ];

  // create position buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  render(gl, {
    program,
    positionAttrLoc,
    resUniformLoc,
    colorUniformLoc,
    translationUniformLoc,
    translation,
    color,
  });
}

type RenderContext = {
  program: WebGLProgram;
  positionAttrLoc: number;
  resUniformLoc: WebGLUniformLocation;
  colorUniformLoc: WebGLUniformLocation;
  translationUniformLoc: WebGLUniformLocation;
  translation: [number, number];
  color: [number, number, number, number];
};
export function render(
  gl: WebGLRenderingContext,
  {
    program,
    positionAttrLoc,
    resUniformLoc,
    colorUniformLoc,
    translationUniformLoc,
    translation,
    color,
  }: RenderContext
) {
  resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

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

  // draw rectangles
  gl.drawArrays(gl.TRIANGLES, 0, 18);
}

window.onload = main;
