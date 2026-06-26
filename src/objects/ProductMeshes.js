import * as THREE from 'three'

// ── shared gold material ──
const goldMat = () => new THREE.MeshStandardMaterial({
  color: 0xc8a96e,
  metalness: 0.85,
  roughness: 0.28,
  envMapIntensity: 1.4,
})

const whiteMat = () => new THREE.MeshStandardMaterial({
  color: 0xf5efe6,
  metalness: 0.05,
  roughness: 0.55,
})

const darkMat = () => new THREE.MeshStandardMaterial({
  color: 0x1a1530,
  metalness: 0.1,
  roughness: 0.7,
})

const mapleMat = () => new THREE.MeshStandardMaterial({
  color: 0xd4a96a,
  metalness: 0.0,
  roughness: 0.8,
})

// ────────────────────────────────────────────
// SNEAKER  (Air-Force-style low-top silhouette)
// ────────────────────────────────────────────
export function buildSneaker() {
  const group = new THREE.Group()

  // sole
  const soleGeo = new THREE.BoxGeometry(1.6, 0.18, 0.7)
  soleGeo.translate(0, 0, 0)
  const sole = new THREE.Mesh(soleGeo, whiteMat())
  sole.position.y = -0.22
  group.add(sole)

  // mid-sole accent strip
  const midGeo = new THREE.BoxGeometry(1.58, 0.06, 0.72)
  const mid = new THREE.Mesh(midGeo, goldMat())
  mid.position.y = -0.12
  group.add(mid)

  // upper body
  const upperGeo = new THREE.BoxGeometry(1.5, 0.38, 0.65)
  const upper = new THREE.Mesh(upperGeo, whiteMat())
  upper.position.y = 0.09
  group.add(upper)

  // heel cup
  const heelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.42, 12, 1, false, Math.PI, Math.PI)
  const heel = new THREE.Mesh(heelGeo, whiteMat())
  heel.position.set(-0.59, 0.08, 0)
  heel.rotation.y = Math.PI / 2
  group.add(heel)

  // toe box
  const toeGeo = new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)
  const toe = new THREE.Mesh(toeGeo, whiteMat())
  toe.position.set(0.72, -0.08, 0)
  toe.rotation.z = -0.18
  group.add(toe)

  // tongue
  const tongueGeo = new THREE.BoxGeometry(0.34, 0.35, 0.04)
  const tongue = new THREE.Mesh(tongueGeo, whiteMat())
  tongue.position.set(0.1, 0.18, 0.31)
  group.add(tongue)

  // laces — thin gold bars
  for (let i = 0; i < 5; i++) {
    const laceGeo = new THREE.BoxGeometry(0.5, 0.025, 0.025)
    const lace = new THREE.Mesh(laceGeo, goldMat())
    lace.position.set(0.04 - i * 0.12, 0.22 + i * 0.01, 0.29)
    group.add(lace)
  }

  // logo emboss
  const logoGeo = new THREE.CircleGeometry(0.07, 8)
  const logo = new THREE.Mesh(logoGeo, goldMat())
  logo.position.set(-0.35, 0.14, 0.325)
  group.add(logo)

  group.castShadow = true
  return group
}

// ────────────────────────────────────────────
// SKATEBOARD
// ────────────────────────────────────────────
export function buildSkateboard() {
  const group = new THREE.Group()

  // deck
  const deckShape = new THREE.Shape()
  deckShape.moveTo(-1, -0.35)
  deckShape.bezierCurveTo(-1, -0.35, -0.8, -0.36, -0.6, -0.35)
  deckShape.lineTo(0.6, -0.35)
  deckShape.bezierCurveTo(0.8, -0.35, 1, -0.34, 1, -0.32)
  deckShape.bezierCurveTo(1, -0.28, 0.98, 0.28, 1, 0.32)
  deckShape.bezierCurveTo(1, 0.34, 0.8, 0.36, 0.6, 0.35)
  deckShape.lineTo(-0.6, 0.35)
  deckShape.bezierCurveTo(-0.8, 0.35, -1, 0.34, -1, 0.32)
  deckShape.bezierCurveTo(-1, 0.28, -0.98, -0.28, -1, -0.32)

  const extSettings = { depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelSegments: 3 }
  const deckGeo = new THREE.ExtrudeGeometry(deckShape, extSettings)
  const deck = new THREE.Mesh(deckGeo, mapleMat())
  deck.rotation.x = Math.PI / 2
  deck.position.y = 0.18
  group.add(deck)

  // grip tape (top face layer)
  const gripGeo = new THREE.BoxGeometry(1.9, 0.005, 0.68)
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
  const grip = new THREE.Mesh(gripGeo, gripMat)
  grip.position.y = 0.255
  group.add(grip)

  // trucks (two axle bars + baseplate)
  [-0.65, 0.65].forEach(x => {
    const plateGeo = new THREE.BoxGeometry(0.28, 0.06, 0.62)
    const plate = new THREE.Mesh(plateGeo, darkMat())
    plate.position.set(x, 0.10, 0)
    group.add(plate)

    const axleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8)
    const axle = new THREE.Mesh(axleGeo, goldMat())
    axle.rotation.x = Math.PI / 2
    axle.position.set(x, 0.06, 0)
    group.add(axle)

    // wheels
    [-0.30, 0.30].forEach(z => {
      const wheelGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.065, 16)
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: 0.9 })
      const wheel = new THREE.Mesh(wheelGeo, wheelMat)
      wheel.rotation.x = Math.PI / 2
      wheel.position.set(x, 0.06, z)
      group.add(wheel)

      const bearingGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.07, 10)
      const bearing = new THREE.Mesh(bearingGeo, goldMat())
      bearing.rotation.x = Math.PI / 2
      bearing.position.copy(wheel.position)
      group.add(bearing)
    })
  })

  group.castShadow = true
  return group
}

// ────────────────────────────────────────────
// SHOPPING BAG  (luxury tote silhouette)
// ────────────────────────────────────────────
export function buildShoppingBag() {
  const group = new THREE.Group()

  const bagMat = new THREE.MeshStandardMaterial({
    color: 0x1a1530,
    metalness: 0.05,
    roughness: 0.7,
  })

  // body — tapered box via scaled plane extrude
  const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5)
  const body = new THREE.Mesh(bodyGeo, bagMat)
  body.position.y = -0.05
  group.add(body)

  // top folded edge
  const edgeGeo = new THREE.BoxGeometry(0.92, 0.06, 0.52)
  const edge = new THREE.Mesh(edgeGeo, goldMat())
  edge.position.y = 0.53
  group.add(edge)

  // base rim
  const baseGeo = new THREE.BoxGeometry(0.92, 0.04, 0.52)
  const base = new THREE.Mesh(baseGeo, goldMat())
  base.position.y = -0.62
  group.add(base)

  // handles (two arch shapes)
  const handleCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.18, 0.55, 0),
    new THREE.Vector3(-0.18, 1.05, 0),
    new THREE.Vector3(0.18, 1.05, 0),
  )
  const pts = handleCurve.getPoints(20)
  const handlePath = new THREE.CatmullRomCurve3(pts)
  const handleGeo = new THREE.TubeGeometry(handlePath, 20, 0.018, 8)

  [-0.24, 0.24].forEach(z => {
    const handle = new THREE.Mesh(handleGeo, goldMat())
    handle.position.z = z
    group.add(handle)
  })

  // tissue paper peeking out top
  const tissueGeo = new THREE.PlaneGeometry(0.7, 0.3)
  const tissueMat = new THREE.MeshStandardMaterial({
    color: 0xf0e4c8,
    side: THREE.DoubleSide,
    roughness: 0.9,
  })
  const tissue = new THREE.Mesh(tissueGeo, tissueMat)
  tissue.position.y = 0.62
  tissue.rotation.x = 0.3
  group.add(tissue)

  // embossed logo patch
  const patchGeo = new THREE.BoxGeometry(0.36, 0.22, 0.01)
  const patch = new THREE.Mesh(patchGeo, goldMat())
  patch.position.set(0, 0.05, 0.251)
  group.add(patch)

  group.castShadow = true
  return group
}

// ────────────────────────────────────────────
// FLOATING FRAME  (gilded picture-frame prop)
// ────────────────────────────────────────────
export function buildFrame(w = 1.4, h = 1.0) {
  const group = new THREE.Group()
  const g = goldMat()
  const thick = 0.06
  const depth = 0.08

  // top / bottom / left / right rails
  const rails = [
    { sx: w + thick * 2, sy: thick, sz: depth, x: 0,        y:  h / 2 + thick / 2 },
    { sx: w + thick * 2, sy: thick, sz: depth, x: 0,        y: -h / 2 - thick / 2 },
    { sx: thick,         sy: h,     sz: depth, x: -w / 2 - thick / 2, y: 0 },
    { sx: thick,         sy: h,     sz: depth, x:  w / 2 + thick / 2, y: 0 },
  ]
  rails.forEach(r => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(r.sx, r.sy, r.sz), g)
    m.position.set(r.x, r.y, 0)
    group.add(m)
  })

  return group
}
