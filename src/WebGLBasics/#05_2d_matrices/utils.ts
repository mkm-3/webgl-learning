export const assertNonNullable = <T>(ref: unknown): ref is T => ref != null;

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

export const setRectangle = (
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]),
    gl.STATIC_DRAW
  );
};

export const setGeometry = (gl: WebGLRenderingContext) => {
  // "F" shape
  gl.bufferData(
    gl.ARRAY_BUFFER,
    // prettier-ignore
    new Float32Array([
      // 左縦列
      0, 0,
      30, 0,
      0, 150,
      0, 150,
      30, 0,
      30, 150,

      // 上の横棒
      30, 0,
      100, 0,
      30, 30,
      30, 30,
      100, 0,
      100, 30,

      // 下の横棒
      30, 60,
      67, 60,
      30, 90,
      30, 90,
      67, 60,
      67, 90,     
    ]),
    gl.STATIC_DRAW
  );
};

export const getRotationMat3 = (rotationDeg: number) => {
  const rad = (Math.PI * rotationDeg) / 180;

  // prettier-ignore
  return [
    Math.cos(rad),  -Math.sin(rad), 0,
    Math.sin(rad),  Math.cos(rad),  0,
    0,              0,              1,
  ];
};

export const getTranslationMat3 = (translate: [number, number]) =>
  // prettier-ignore
  [
    1,            0,            0,
    0,            1,            0,
    translate[0], translate[1], 1,
  ];
export const getScalingMat3 = (scale: [number, number]) =>
  // prettier-ignore
  [
    scale[0], 0,        0,
    0,        scale[1], 0,
    0,        0,        1,
  ];

export const getIdentMat3 = () =>
  // prettier-ignore
  [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ];

export const getProjectionMat3 = (width: number, height: number) =>
  // prettier-ignore
  [
    2 / width, 0,           0,
    0,         -2 / height, 0,
    -1,        1,           1,
  ];

export const multiplyMat3 = (a: number[], b: number[]) => {
  if (a.length !== 9) {
    throw new Error("Error: length has to be 9, but " + a.length);
  }
  if (b.length !== 9) {
    throw new Error("Error: length has to be 9, but " + b.length);
  }

  var a00 = a[0 * 3 + 0];
  var a01 = a[0 * 3 + 1];
  var a02 = a[0 * 3 + 2];
  var a10 = a[1 * 3 + 0];
  var a11 = a[1 * 3 + 1];
  var a12 = a[1 * 3 + 2];
  var a20 = a[2 * 3 + 0];
  var a21 = a[2 * 3 + 1];
  var a22 = a[2 * 3 + 2];
  var b00 = b[0 * 3 + 0];
  var b01 = b[0 * 3 + 1];
  var b02 = b[0 * 3 + 2];
  var b10 = b[1 * 3 + 0];
  var b11 = b[1 * 3 + 1];
  var b12 = b[1 * 3 + 2];
  var b20 = b[2 * 3 + 0];
  var b21 = b[2 * 3 + 1];
  var b22 = b[2 * 3 + 2];

  return [
    b00 * a00 + b01 * a10 + b02 * a20,
    b00 * a01 + b01 * a11 + b02 * a21,
    b00 * a02 + b01 * a12 + b02 * a22,
    b10 * a00 + b11 * a10 + b12 * a20,
    b10 * a01 + b11 * a11 + b12 * a21,
    b10 * a02 + b11 * a12 + b12 * a22,
    b20 * a00 + b21 * a10 + b22 * a20,
    b20 * a01 + b21 * a11 + b22 * a21,
    b20 * a02 + b21 * a12 + b22 * a22,
  ];
};
