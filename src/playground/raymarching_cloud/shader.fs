#version 300 es
precision mediump float;

out vec4 fragColor;

uniform vec2 u_resolution;

// 定数
vec3 spherePos = vec3(0.0);
float radius = 0.75;
float cameraZ = 20.0;
int raySteps = 100;

// 球の中心とrayの座標の距離を計算する
float calc_dist(vec3 pos, float size)
{
  return length(pos) - size;
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

  for(int i = 0; i < raySteps; i++)
  {
    // 現在のrayの先端の位置が球に衝突していたら、色をつける
    vec3 rayPos = cameraPos + rayDir;
    float dist = calc_dist(rayPos, radius);

    if(dist < 0.0001)
    {
      color = vec4(vec3(1.0), 1.0);
      break;
    }

    // rayの進んだ位置をcameraPosに記録して再利用する
    cameraPos += rayDir * dist;
  }

  fragColor = color;
}