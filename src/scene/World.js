import * as THREE from 'three'
import { buildSneaker, buildSkateboard, buildShoppingBag, buildFrame } from '../objects/ProductMeshes.js'

import paintingVert from '../shaders/painting.vert'
import paintingFrag from '../shaders/painting.frag'
import particleVert from '../shaders/particles.vert'
import particleFrag from '../shaders/particles.frag'
import fogFrag      from '../shaders/fog.frag'

export class World {
  constructor(canvas) {
    this.canvas   = canvas
    this.W        = window.innerWidth
    this.H        = window.innerHeight
    this.dpr      = Math.min(window.devicePixelRatio, 2)
    this.clock    = new THREE.Clock()
    this.sceneVal = 0   // 0‒4 float, driven by scroll
    this.mouse    = new THREE.Vector2()

    this._init()
    this._buildBackground()
    this._buildFog()
    this._buildParticles()
    this._buildProducts()
    this._buildLights()
    this._buildEnvMap()
    this._bindResize()
    this._bindMouse()
  }

  _init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(this.W, this.H)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.toneMapping    = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, this.W / this.H, 0.1, 100)
    this.camera.position.set(0, 0, 6)
  }

  _buildBackground() {
    // Full-screen quad behind everything
    const geo = new THREE.PlaneGeometry(30, 20)
    this.bgMat = new THREE.ShaderMaterial({
      vertexShader:   paintingVert,
      fragmentShader: paintingFrag,
      uniforms: {
        uTime:       { value: 0 },
        uScene:      { value: 0 },
        uProgress:   { value: 0 },
        uResolution: { value: new THREE.Vector2(this.W, this.H) },
      },
      depthWrite: false,
    })
    const bg = new THREE.Mesh(geo, this.bgMat)
    bg.position.z = -8
    this.scene.add(bg)
  }

  _buildFog() {
    // Atmospheric fog quad (additive, soft)
    const geo = new THREE.PlaneGeometry(30, 20)
    this.fogMat = new THREE.ShaderMaterial({
      vertexShader:   paintingVert,
      fragmentShader: fogFrag,
      uniforms: {
        uTime:  { value: 0 },
        uScene: { value: 0 },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    })
    const fogPlane = new THREE.Mesh(geo, this.fogMat)
    fogPlane.position.z = -3
    this.scene.add(fogPlane)
  }

  _buildParticles() {
    const COUNT = 280
    const positions = new Float32Array(COUNT * 3)
    const sizes     = new Float32Array(COUNT)
    const phases    = new Float32Array(COUNT)
    const colors    = new Float32Array(COUNT * 3)

    const palette = [
      new THREE.Color(0xc8a96e),
      new THREE.Color(0xe8d5a3),
      new THREE.Color(0xf5efe6),
      new THREE.Color(0x8a72a0),
      new THREE.Color(0xd4956a),
    ]

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2
      sizes[i]  = Math.random() * 3 + 1.5
      phases[i] = Math.random() * Math.PI * 2
      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1))
    geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases,    1))
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors,    3))

    this.particleMat = new THREE.ShaderMaterial({
      vertexShader:   particleVert,
      fragmentShader: particleFrag,
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: this.dpr },
      },
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
    })

    this.particles = new THREE.Points(geo, this.particleMat)
    this.scene.add(this.particles)
  }

  _buildProducts() {
    // Each product group: { mesh, basePos, baseRot, scene }
    this.products = []

    // Scene 1 — Sneaker (right side, scene 1)
    const sneaker = buildSneaker()
    sneaker.scale.setScalar(0.82)
    sneaker.position.set(2.2, -0.1, 0)
    this.scene.add(sneaker)
    this.products.push({ mesh: sneaker, scene: 1, baseY: -0.1, floatAmp: 0.18, floatSpeed: 0.7, phase: 0 })

    // Scene 2 — Skateboard (left side, scene 2)
    const skate = buildSkateboard()
    skate.scale.setScalar(0.9)
    skate.position.set(-2.4, 0.2, 0)
    skate.rotation.x = 0.15
    skate.rotation.z = 0.12
    this.scene.add(skate)
    this.products.push({ mesh: skate, scene: 2, baseY: 0.2, floatAmp: 0.22, floatSpeed: 0.55, phase: 1.5 })

    // Scene 3 — Shopping bag (center, scene 3)
    const bag = buildShoppingBag()
    bag.scale.setScalar(0.78)
    bag.position.set(0.4, 0, 0)
    this.scene.add(bag)
    this.products.push({ mesh: bag, scene: 3, baseY: 0, floatAmp: 0.14, floatSpeed: 0.6, phase: 3 })

    // Floating frames — one per scene for depth
    const framePositions = [
      { x: -3.2, y: 1.4, z: -2.5, rx: 0,    ry: 0.18, s: 1.1 },
      { x:  3.5, y: 0.5, z: -3.0, rx: 0.06, ry:-0.22, s: 0.9 },
      { x: -2.8, y:-1.0, z: -2.0, rx:-0.04, ry: 0.15, s: 0.7 },
      { x:  2.5, y: 1.8, z: -4.0, rx: 0.08, ry:-0.12, s: 1.3 },
    ]
    this.frames = []
    framePositions.forEach(fp => {
      const f = buildFrame()
      f.position.set(fp.x, fp.y, fp.z)
      f.rotation.set(fp.rx, fp.ry, 0)
      f.scale.setScalar(fp.s)
      this.scene.add(f)
      this.frames.push({ mesh: f, baseY: fp.y, phase: Math.random() * Math.PI * 2 })
    })
  }

  _buildLights() {
    // Warm fill
    const ambient = new THREE.AmbientLight(0xf0deb8, 0.6)
    this.scene.add(ambient)

    // Key light — golden chandelier feel
    const key = new THREE.DirectionalLight(0xffe4a0, 2.8)
    key.position.set(4, 6, 5)
    key.castShadow = true
    key.shadow.mapSize.setScalar(1024)
    this.scene.add(key)

    // Rim light — cold blue backlight for drama
    const rim = new THREE.DirectionalLight(0x6080ff, 0.9)
    rim.position.set(-5, 2, -4)
    this.scene.add(rim)

    // Under-glow — warm bounce
    const bounce = new THREE.PointLight(0xc87832, 1.2, 8)
    bounce.position.set(0, -3, 2)
    this.scene.add(bounce)

    this.keyLight = key
  }

  _buildEnvMap() {
    // Simple procedural env map using PMREMGenerator
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const envScene = new THREE.Scene()
    envScene.background = new THREE.Color(0x8a7040)
    this.envMap = pmrem.fromScene(envScene).texture
    this.scene.environment = this.envMap
    pmrem.dispose()
  }

  // Called from main.js with normalized scroll 0‒1
  setSceneValue(val) {
    this.sceneVal = val * 4   // 0 → 4
  }

  setMouseNDC(x, y) {
    this.mouse.set(x, y)
  }

  _getProductAlpha(productScene, currentScene) {
    const dist = Math.abs(productScene - currentScene)
    return Math.max(0, 1 - dist * 1.6)
  }

  update() {
    const t  = this.clock.getElapsedTime()
    const sc = this.sceneVal

    // Update shader uniforms
    this.bgMat.uniforms.uTime.value       = t
    this.bgMat.uniforms.uScene.value      = sc
    this.fogMat.uniforms.uTime.value      = t
    this.fogMat.uniforms.uScene.value     = sc
    this.particleMat.uniforms.uTime.value = t

    // Gentle camera sway with mouse parallax
    const targetX = this.mouse.x * 0.35
    const targetY = this.mouse.y * 0.22
    this.camera.position.x += (targetX - this.camera.position.x) * 0.035
    this.camera.position.y += (targetY - this.camera.position.y) * 0.035
    this.camera.lookAt(0, 0, 0)

    // Camera z pull based on scene — drift slightly closer on transitions
    const baseZ = 6 - Math.sin(sc * Math.PI * 0.5) * 0.4
    this.camera.position.z += (baseZ - this.camera.position.z) * 0.02

    // Animate products: float + fade
    this.products.forEach(p => {
      const alpha = this._getProductAlpha(p.scene, sc)
      p.mesh.visible = alpha > 0.01

      // floating bob
      const bob = Math.sin(t * p.floatSpeed + p.phase) * p.floatAmp
      p.mesh.position.y = p.baseY + bob

      // slow self-rotation
      p.mesh.rotation.y += 0.003

      // fade via material traverse
      p.mesh.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.transparent = true
          c.material.opacity = alpha
        }
      })

      // scale in/out
      const s = 0.6 + alpha * 0.4
      p.mesh.scale.setScalar(s * (p.scene === 2 ? 0.9 : p.scene === 1 ? 0.82 : 0.78))
    })

    // Animate frames
    this.frames.forEach((f, i) => {
      f.mesh.position.y = f.baseY + Math.sin(t * 0.3 + f.phase) * 0.12
      f.mesh.rotation.z = Math.sin(t * 0.18 + f.phase) * 0.015
    })

    // Light colour shift per scene
    const sceneHues = [0xffe4a0, 0xa0b8ff, 0xa0e8a0, 0xff9060, 0xffddaa]
    const si = Math.floor(sc) % sceneHues.length
    const sf = sc - Math.floor(sc)
    const cA = new THREE.Color(sceneHues[si])
    const cB = new THREE.Color(sceneHues[(si + 1) % sceneHues.length])
    this.keyLight.color.lerpColors(cA, cB, sf)

    this.renderer.render(this.scene, this.camera)
  }

  _bindResize() {
    window.addEventListener('resize', () => {
      this.W = window.innerWidth
      this.H = window.innerHeight
      this.renderer.setSize(this.W, this.H)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.camera.aspect = this.W / this.H
      this.camera.updateProjectionMatrix()
      this.bgMat.uniforms.uResolution.value.set(this.W, this.H)
    })
  }

  _bindMouse() {
    window.addEventListener('mousemove', e => {
      this.mouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      )
    })
  }
}
