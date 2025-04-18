// prettier-ignore
export type Matrix4 = [
  number, number, number, number, 
  number, number, number, number, 
  number, number, number, number,
  number, number, number, number
]

export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];

export const m4 = {
  projection: function (width: number, height: number, depth: number): Matrix4 {
    // Note: This matrix flips the Y axis so 0 is at the top.
    // prettier-ignore
    return [
      2 / width, 0,           0,         0,
      0,         -2 / height, 0,         0,
      0,         0,           2 / depth, 0,
      -1,        1,           0,         1,
    ];
  },

  orthographic: function (
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
  ): Matrix4 {
    // prettier-ignore
    return [
      2 / (right - left), 0,                  0,                0,
      0,                  2 / (top - bottom), 0,                0,
      0,                  0,                  2 / (near - far), 0,

      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ];
  },

  perspective: function (
    fieldOfViewInRadians: number,
    aspect: number,
    near: number,
    far: number
  ): Matrix4 {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    const rangeInv = 1.0 / (near - far);

    // prettier-ignore
    return [
      f / aspect, 0, 0,                         0,
      0,          -f, 0,                         0,
      0,          0, (near + far) * rangeInv,   -1,
      0,          0, near * far * rangeInv * 2, 0
    ];
  },

  multiply: function (a: Matrix4, b: Matrix4): Matrix4 {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];

    // prettier-ignore
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  },

  translation: function (tx: number, ty: number, tz: number): Matrix4 {
    // prettier-ignore
    return [
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1,
    ];
  },

  xRotation: function (angleInRadians: number): Matrix4 {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    // prettier-ignore
    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  },

  yRotation: function (angleInRadians: number): Matrix4 {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    // prettier-ignore
    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  },

  zRotation: function (angleInRadians: number): Matrix4 {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    // prettier-ignore
    return [
      c, s, 0, 0,
    -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  },

  scaling: function (sx: number, sy: number, sz: number): Matrix4 {
    // prettier-ignore
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ];
  },

  translate: function (
    m: Matrix4,
    tx: number,
    ty: number,
    tz: number
  ): Matrix4 {
    return m4.multiply(m, m4.translation(tx, ty, tz));
  },

  xRotate: function (m: Matrix4, angleInRadians: number): Matrix4 {
    return m4.multiply(m, m4.xRotation(angleInRadians));
  },

  yRotate: function (m: Matrix4, angleInRadians: number): Matrix4 {
    return m4.multiply(m, m4.yRotation(angleInRadians));
  },

  zRotate: function (m: Matrix4, angleInRadians: number): Matrix4 {
    return m4.multiply(m, m4.zRotation(angleInRadians));
  },

  scale: function (m: Matrix4, sx: number, sy: number, sz: number): Matrix4 {
    return m4.multiply(m, m4.scaling(sx, sy, sz));
  },

  makeZToWMatrix: function (fudgeFactor: number): Matrix4 {
    // prettier-ignore
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, fudgeFactor,
      0, 0, 0, 1,
    ]
  },
};
