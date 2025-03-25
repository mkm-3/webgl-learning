#version 300 es
precision mediump float;

out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;

// 定数
vec3 spherePos = vec3(0.0);
float radius = 0.75;
float cameraZ = 20.0;
int raySteps = 100;

// https://www.shadertoy.com/view/XtcBDH
float random(in vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// https://www.shadertoy.com/view/XtcBDH
float noise(in vec2 st)
{
    // Splited integer and float values.
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i + vec2(0.0, 0.0));
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    // -2.0f^3 + 3.0f^2
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// フラクタルブラウン運動を計算する
float fbm(vec2 freq)
{
  float res;
  float amp = 1.0;
  const int OCTAVES = 5;

  // 周波数を一定の割合で増加させ（２倍にする）、振幅を減らしながらノイズを繰り返し重ねる
  for(int i = 0; i < OCTAVES; i++)
  {
    res += amp * noise(freq);
    amp /= 2.0;
    freq *= 2.0;
  }

  return res;
}

float marble_pattern_noise(vec2 uv)
{
  vec2 q = vec2(0.0);
  q.x = fbm(uv);
  q.y = fbm(uv  + vec2(1.0));

  vec2 r= vec2(0.0);
  r.x = fbm(uv + (4.0 * q) + vec2(1.7, 9.2) + (0.15 * u_time));
  r.y = fbm(uv + (4.0 * q) + vec2(8.3, 2.8) + (0.12 * u_time));

  float f = fbm(uv + 4.0 * r);
  return f * f * f + (0.6 * f * f) + (0.5 * f);
}


// 球の中心とrayの座標の距離を計算する
float calc_dist(vec3 pos, float size)
{
  return length(pos) - size;
}

// 陰関数の微分により、球表面の任意座標における法線ベクトルを計算する
vec3 get_normal(vec3 pos, float size)
{
  float v = 0.0001;
  float d = calc_dist(pos, size);
  return normalize(
    vec3(
      d - calc_dist(vec3(pos.x - v, pos.y,     pos.z    ), size),
      d - calc_dist(vec3(pos.x,     pos.y - v, pos.z    ), size),
      d - calc_dist(vec3(pos.x,     pos.y,     pos.z - v), size)
    )
  );
}

void main() {
  // -1.0 ~ 1.0 の空間を定義
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // レイの発射元の位置 = カメラの位置
  vec3 cameraPos = vec3(0.0, 0.0, cameraZ);

  // 今計算している座標における、レイの向き
  vec3 rayDir = normalize(vec3(uv, 0.0) - cameraPos);

  // 何もなければ黒色にする
  vec4 color = vec4(vec3(0.0), 1.0);

  // 光源の位置
  vec3 lightPos = normalize(vec3(1.0));

  for(int i = 0; i < raySteps; i++)
  {
    // 現在のrayの先端の位置が球に衝突していたら、色をつける
    vec3 rayPos = cameraPos + rayDir;
    float dist = calc_dist(rayPos, radius);

    if(dist < 0.0001)
    {
      // 光源の影響を計算
      vec3 normal = get_normal(rayPos, radius);
      float diff = dot(normal, lightPos);

      // 動くマーブル模様を計算する
      float coef = diff * marble_pattern_noise(uv);

      // 表面の色を計算する
      /*
        Target colors
        =============
        x   color
        0.0 vec4(0.0471, 0.0471, 0.0471, 1.0);
        0.2 vec4(1.0, 0.5, 0.4, 1.0);
        0.4 vec4(1.0, 1.0, 0.5, 1.0);
        0.6 vec4(0.4, 0.85, 0.4, 1.0);
        0.8 vec4(0.2, 0.7, 1.0, 1.0);
        1.0 vec4(0.8, 0.3, 0.8, 1.0);
      */

      vec2 st = (uv + vec2(1.0)) / 2.0;

      float r = cos(u_time / 2.0) * 0.7;
      float g = sin(u_time / 2.0) * 0.7;
      float b = sin(1.0 - g) * 0.7;

      // noiseをmixせずに乗算すると正しくブレンドされない
      color = vec4(mix(vec3(r, g, b), vec3(coef), 0.7) , 1.0);
      break;
    }

    // rayの進んだ位置をcameraPosに記録して再利用する
    cameraPos += rayDir * dist;
  }

  fragColor = color;
}