export const assertNonNullable = <T = unknown>(
  ref: T | null | undefined,
  logError?: string
): T => {
  if (ref == null) {
    logError && console.error(logError);
    throw new Error(`Assertion Failed for ${ref}`);
  }

  return ref;
};

export const resizeCanvasToDisplaySize = (canvas: HTMLCanvasElement) => {
  const toCssPixelsRatio = window.devicePixelRatio;

  const displayWidth = Math.floor(canvas.clientWidth * toCssPixelsRatio);
  const displayHeight = Math.floor(canvas.clientHeight * toCssPixelsRatio);

  // Render buffer size
  canvas.width = displayWidth;
  canvas.height = displayHeight;
};

export const showWebGLInfo = (gl: WebGLRenderingContext) => {
  console.log("=====================================");
  console.log("WebGL environment info");
  console.log("OpenGL Version: " + gl.getParameter(gl.VERSION));
  console.log(
    "Shading Language Version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
  );
  console.log("Vendor: " + gl.getParameter(gl.VENDOR));
  console.log("=====================================");
};

/**
 * Load shader and returns compiled result.
 */
export const createShader = (
  gl: WebGLRenderingContext,
  type: GLenum,
  sourceTxt: string
) => {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Error: No available shader in this environment.");
    return null;
  }
  gl.shaderSource(shader, sourceTxt);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Failed to compile shader.
    console.error("Error: Failed to compile shader source.");
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

/**
 * Create program, attach and link shaders to it.
 */
export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    console.error("Error: Failed to link program.");
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

export const randomInt = (range: number) => {
  return Math.floor(Math.random() * range);
};
