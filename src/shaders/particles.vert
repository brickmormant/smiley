attribute float aSize;
attribute float aPhase;
attribute vec3  aColor;

uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;
varying vec3  vColor;

void main() {
  vec3 pos = position;

  // gentle drift
  pos.x += sin(uTime * 0.3 + aPhase)       * 0.4;
  pos.y += cos(uTime * 0.2 + aPhase * 1.3) * 0.3 + uTime * 0.04;
  pos.z += sin(uTime * 0.15 + aPhase * 0.7) * 0.2;

  // wrap vertically
  pos.y = mod(pos.y + 10., 20.) - 10.;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  float depth = -mvPos.z;
  gl_PointSize = aSize * uPixelRatio * (150.0 / depth);

  vAlpha = smoothstep(0., 2., depth) * (0.4 + 0.6 * sin(uTime * 0.5 + aPhase));
  vColor = aColor;
}
