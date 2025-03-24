#version 300 es
precision mediump float;

out vec4 fragColor;

uniform float time;
uniform vec2 u_resolution;

// 定数
vec3 spherePos = vec3(0.0);
float radius = 0.75;
float cameraZ = 25.0;

// rayの設定に使う定数
int maxRaySteps = 100;
float stepSize = 1.0;

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

float hash(float n)
{
  return fract(sin(n) * 43758.5453);
}

float noise(vec3 x)
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    
    f = f * f * (3.0 - 2.0 * f);
    
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    
    float res = mix(mix(mix(hash(n +   0.0), hash(n +   1.0), f.x),
                        mix(hash(n +  57.0), hash(n +  58.0), f.x), f.y),
                    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                        mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    return res;
}

mat3 m = mat3( 0.00,  0.80,  0.60,
              -0.80,  0.36, -0.48,
              -0.60, -0.48,  0.64);

float fbm(vec3 p)
{
    float f;
    f  = 0.5000 * noise(p); p = m * p * 2.02;
    f += 0.2500 * noise(p); p = m * p * 2.03;
    f += 0.1250 * noise(p);
    return f;
}

float scene(vec3 pos)
{
    return 0.1 - length(pos) * 0.05 + fbm(pos * 0.3);
}

mat3 camera(vec3 ro, vec3 ta)
{
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(0.0, 1.0, 0.0);
    vec3 cu = cross(cw, cp);
    vec3 cv = cross(cu, cw);
    return mat3(cu, cv, cw);
}

void main() {
  // -1.0 ~ 1.0 の空間を定義
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // レイの発射元の位置 = カメラの位置
  vec3 cameraPos = vec3(0.0, 0.0, cameraZ);

  // 今計算している座標における、レイの向き
  vec3 rayOrigin = cameraZ * vec3(0.0, 0.0, 1.0);
  vec3 rayDir = normalize(vec3(uv, 0.0) - cameraPos);

  // 何もなければ黒色にする
  vec4 color = vec4(vec3(0.0), 1.0);

  // 光源の位置
  vec3 lightPos = normalize(vec3(1.0));

  // 定数
  float T = 1.0; // 透過率：transmittance
  float A = 100.0; // 吸収率：absorption
  const int sampleCount = 64; // レイマーチングのサンプル数
  const int sampleLightCount = 6; // レイのサンプル点から光源へ向かうベクトル上のサンプル数
  float zMax = 40.0;
  float zStep = zMax / float(sampleCount);
  float zMaxl = 20.0;
  float zStepl = zMaxl / float(sampleLightCount);

  // カメラ
  mat3 c = camera(rayOrigin, vec3(0.0));
  float targetDepth = 1.3;
  vec3 dir = c * normalize(vec3(uv, targetDepth));

  vec3 rayPos = rayOrigin;

  for(int i = 0; i < sampleCount; i++)
  {
    // 現在のレイの位置の密度を計算
    float density = scene(rayPos);

    if(density > 0.0)
    {
      float tmp = density / float(sampleCount);

      T *= 1.0  - (tmp * A);

      if(T <= 0.01)
      {
        break;
      }

      float opacity = 50.0;
      float k = opacity * tmp * T;
      vec4 cloudColor = vec4(1.0);

      color += cloudColor * k;
    }

    rayPos += dir * zStep;
  }

  vec3 bg = mix(vec3(0.1, 0.1, 0.8), vec3(0.9, 0.9, 1.0), 1.0 - (uv.y + 1.0) * 0.5);
  color.rgb += bg;

  fragColor = color;
}