uniform float uTime;
uniform float uScene;
uniform float uProgress;
uniform vec2  uResolution;

varying vec2 vUv;
varying vec3 vWorldPos;

// ── noise helpers ──
vec3 mod289(vec3 x) { return x - floor(x*(1./289.))*289.; }
vec4 mod289(vec4 x) { return x - floor(x*(1./289.))*289.; }
vec4 permute(vec4 x) { return mod289((x*34.+1.)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1./6., 1./3.);
  const vec4 D = vec4(0., 0.5, 1., 2.);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g  = step(x0.yzx, x0.xyz);
  vec3 l  = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z+vec4(0.,i1.z,i2.z,1.))
    +i.y+vec4(0.,i1.y,i2.y,1.))
    +i.x+vec4(0.,i1.x,i2.x,1.));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j  = p - 49.*floor(p*ns.z*ns.z);
  vec4 x_ = floor(j*ns.z);
  vec4 y_ = floor(j - 7.*x_);
  vec4 x  = x_*ns.x + ns.yyyy;
  vec4 y  = y_*ns.x + ns.yyyy;
  vec4 h  = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.+1.;
  vec4 s1 = floor(b1)*2.+1.;
  vec4 sh = -step(h, vec4(0.));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
  m = m*m;
  return 42. * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

// ── scene palettes ──
vec3 scene0() {
  // Raphael-gold dawn — cream, warm amber, deep umber
  vec3 sky    = vec3(0.88, 0.78, 0.58);
  vec3 mid    = vec3(0.55, 0.38, 0.22);
  vec3 shadow = vec3(0.12, 0.08, 0.05);
  float t = smoothstep(0.,1., vUv.y + snoise(vec3(vUv*2., uTime*0.08))*0.15);
  return mix(shadow, mix(mid, sky, t*t), t);
}

vec3 scene1() {
  // Vermeer twilight — cobalt, burnt sienna, ivory
  vec3 sky    = vec3(0.18, 0.24, 0.52);
  vec3 mid    = vec3(0.58, 0.32, 0.18);
  vec3 shadow = vec3(0.06, 0.05, 0.14);
  float t = smoothstep(0.,1., vUv.y + snoise(vec3(vUv*1.8, uTime*0.06))*0.12);
  return mix(shadow, mix(mid, sky, pow(t,1.4)), t);
}

vec3 scene2() {
  // Rubens forest — deep viridian, moss, gold shaft
  vec3 sky    = vec3(0.62, 0.74, 0.42);
  vec3 mid    = vec3(0.22, 0.34, 0.20);
  vec3 shadow = vec3(0.06, 0.10, 0.06);
  float t = smoothstep(0.,1., vUv.y + snoise(vec3(vUv*2.4, uTime*0.05))*0.18);
  return mix(shadow, mix(mid, sky, t*t), t);
}

vec3 scene3() {
  // Caravaggio drama — near-black, carmine, candlelight
  vec3 sky    = vec3(0.72, 0.48, 0.20);
  vec3 mid    = vec3(0.42, 0.12, 0.10);
  vec3 shadow = vec3(0.04, 0.03, 0.03);
  float t = smoothstep(0.,1., vUv.y + snoise(vec3(vUv*3., uTime*0.07))*0.20);
  return mix(shadow, mix(mid, sky, pow(t,0.8)), t);
}

vec3 scene4() {
  // Botticelli spring — pale pink, sage, gold
  vec3 sky    = vec3(0.90, 0.82, 0.72);
  vec3 mid    = vec3(0.58, 0.70, 0.52);
  vec3 shadow = vec3(0.16, 0.12, 0.18);
  float t = smoothstep(0.,1., vUv.y + snoise(vec3(vUv*2., uTime*0.04))*0.10);
  return mix(shadow, mix(mid, sky, t), t);
}

// ── craquelure (cracked-paint) layer ──
float craquelure(vec2 uv) {
  float s  = snoise(vec3(uv * 18.,  0.0)) * 0.5
           + snoise(vec3(uv * 36.,  1.0)) * 0.25
           + snoise(vec3(uv * 72.,  2.0)) * 0.125;
  return smoothstep(0.55, 0.70, abs(s));
}

// ── brushstroke vignette ──
float vignette(vec2 uv) {
  vec2 d = (uv - 0.5) * vec2(1.4, 1.1);
  return 1.0 - dot(d, d) * 0.9;
}

// ── painterly warp ──
vec2 paintWarp(vec2 uv) {
  float wx = snoise(vec3(uv * 3.5, uTime * 0.03)) * 0.008;
  float wy = snoise(vec3(uv * 3.5 + 4., uTime * 0.03)) * 0.008;
  return uv + vec2(wx, wy);
}

void main() {
  vec2 uv = paintWarp(vUv);

  // pick & blend adjacent scenes
  int si = int(uScene);
  float sf = fract(uScene);

  vec3 colA, colB;
  if      (si == 0) { colA = scene0(); colB = scene1(); }
  else if (si == 1) { colA = scene1(); colB = scene2(); }
  else if (si == 2) { colA = scene2(); colB = scene3(); }
  else if (si == 3) { colA = scene3(); colB = scene4(); }
  else              { colA = scene4(); colB = scene0(); }

  float blend = smoothstep(0., 1., sf);
  vec3 col = mix(colA, colB, blend);

  // painterly crack overlay
  float crack = craquelure(uv);
  col = mix(col, col * 0.55, crack * 0.35);

  // subtle warm highlight band (simulates a single light source)
  float band = smoothstep(0.45, 0.55, vUv.y) * smoothstep(0.65, 0.55, vUv.y);
  col += band * vec3(0.10, 0.08, 0.04) * (1. - crack);

  // vignette
  col *= vignette(vUv);

  // breathing pulse
  float pulse = sin(uTime * 0.4) * 0.015 + 0.015;
  col += pulse * vec3(0.06, 0.05, 0.02);

  gl_FragColor = vec4(col, 1.0);
}
