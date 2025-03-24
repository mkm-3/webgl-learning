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
import { setColors, setGeometry, setTexcoords } from "./primitive";

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

  // create texture information.
  const texcoordAttrLoc = gl.getAttribLocation(program, "a_texcoord");
  gl.enableVertexAttribArray(texcoordAttrLoc);
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);
  gl.vertexAttribPointer(texcoordAttrLoc, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])
  );

  const image = new Image();
  image.src = "/f-texture.png";
  // image.src = "https://webglfundamentals.org/webgl/resources/f-texture.png";
  image.onload = () => {
    console.log("Image loaded.");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };

  const textureLocation = gl.getUniformLocation(program, "u_texture");
  gl.uniform1i(textureLocation, 0);

  // rendering params
  const fieldOfViewDegrees = 100;
  const aspect = gl.canvas.width / gl.canvas.height;
  const zNear = 1;
  const zFar = 2000;

  // camera params
  const cameraRadius = 200;
  let cameraAngleDegrees = 0;

  // model params
  const position = v3.new(0, 0, 0);
  const translation = v3.new(0, 0, 0);
  const rotation = v3.new(0, 0, 0);
  const scale = v3.new(1.0, 1.0, 1.0);

  function update() {
    rotation[1] += (1 * Math.PI) / 180;
  }

  let prevTime = 0;
  function draw(gl: WebGLRenderingContext, _deltaTime: number) {
    update();
    render(gl, {
      program,
      matrixUniformLoc,
      fieldOfViewDegrees,
      aspect,
      zNear,
      zFar,
      position,
      translation,
      rotation,
      scale,
      cameraAngleDegrees,
      cameraRadius,
    });

    return requestAnimationFrame((now: number) => {
      const deltaTime = now - prevTime; // アニメーション用に計算しておく
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
  position: Vector3;
  translation: Vector3;
  rotation: Vector3;
  scale: Vector3;
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
    position,
    translation,
    rotation,
    scale,
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
    // const objPosition = v3.new(0, 0, 0);

    // calculate projection matrix of model
    // let matrix = m4.perspective(fieldOfViewRadians);

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
    cameraMatrix = m4.lookAt(cameraPosition, position, cameraUp); // カメラ行列を計算

    const viewMatrix = m4.inverse(cameraMatrix); // objectをカメラの前に移動させる

    const fieldOfViewRadians = (Math.PI * fieldOfViewDegrees) / 180;

    let objMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    objMatrix = m4.translate(objMatrix, ...translation);
    objMatrix = m4.xRotate(objMatrix, rotation[0]);
    objMatrix = m4.yRotate(objMatrix, rotation[1]);
    objMatrix = m4.zRotate(objMatrix, rotation[2]);
    objMatrix = m4.scale(objMatrix, ...scale);

    const viewProjectionMatrix = m4.multiply(objMatrix, viewMatrix);

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
