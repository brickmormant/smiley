varying float vAlpha;
varying vec3  vColor;

void main() {
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);
  float a    = 1.0 - smoothstep(0.3, 0.5, dist);
  // soft glow halo
  float halo = 1.0 - smoothstep(0.0, 0.5, dist);
  vec3  col  = vColor + halo * 0.4;
  gl_FragColor = vec4(col, a * vAlpha);
}
