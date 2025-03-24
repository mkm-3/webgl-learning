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

function getNow() {
  return performance.now() * 0.001;
}

function main() {
  /**
   * create WebGL context
   */
  const canvas = assertNonNullable(
    document.getElementById("main_canvas") as HTMLCanvasElement | null
  );
  resizeCanvasToDisplaySize(canvas);

  const gl = canvas.getContext("webgl2"); // webgl version 1 (OpenGL ES 1.0)
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

  // clip space -> pixel space
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // clear canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  // activate created shader programs
  gl.useProgram(program);

  // create uniforms
  const resUniformLoc = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resUniformLoc, gl.canvas.width, gl.canvas.height);

  const timeUniformLoc = gl.getUniformLocation(program, "u_time");
  const startTime = getNow();
  gl.uniform1f(timeUniformLoc, startTime);

  // create attributes
  const positionAttrLoc = gl.getAttribLocation(program, "a_position"); // look up where the vertex data needs to go.
  gl.enableVertexAttribArray(positionAttrLoc);

  // set geometry
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const renderScale = 1.0;
  // prettier-ignore
  const positions = new Float32Array([
    -renderScale, -renderScale,
     renderScale, -renderScale,
    -renderScale,  renderScale,
     renderScale,  renderScale
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    positionAttrLoc,
    2 /** size */,
    gl.FLOAT /** type */,
    false /**normalize */,
    0 /** stride */,
    0 /** offset */
  );

  function update() {
    requestAnimationFrame(() => {
      render({
        gl: gl as WebGL2RenderingContext,
        startTime,
        timeUniformLoc,
      });
      // return update();
    });
  }

  update();
}

interface RenderContext {
  gl: WebGL2RenderingContext;
  startTime: number;
  timeUniformLoc: WebGLUniformLocation | null;
}
function render({ gl, timeUniformLoc, startTime }: RenderContext) {
  gl.uniform1f(timeUniformLoc, getNow() - startTime);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.flush();
}

window.onload = main;
