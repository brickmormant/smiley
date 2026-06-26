import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { World } from './scene/World.js'

gsap.registerPlugin(ScrollTrigger)

// ─── DOM REFS ───────────────────────────────
const canvas   = document.getElementById('webgl-canvas')
const loader   = document.getElementById('loader')
const fill     = loader.querySelector('.loader-progress-fill')
const cursorEl = document.getElementById('cursor')
const dot      = cursorEl.querySelector('.cursor-dot')
const ring     = cursorEl.querySelector('.cursor-ring')

// ─── LOAD SIMULATION ────────────────────────
let loadPct = 0
const loadInterval = setInterval(() => {
  loadPct = Math.min(loadPct + Math.random() * 18, 95)
  fill.style.width = loadPct + '%'
}, 120)

// ─── WORLD INIT ─────────────────────────────
const world = new World(canvas)

// Give Three.js a moment to warm up, then finish the loader
setTimeout(() => {
  clearInterval(loadInterval)
  fill.style.width = '100%'

  setTimeout(() => {
    loader.classList.add('hidden')
    initApp()
  }, 500)
}, 1400)

// ─── CURSOR ─────────────────────────────────
let curX = 0, curY = 0, ringX = 0, ringY = 0

window.addEventListener('mousemove', e => {
  curX = e.clientX
  curY = e.clientY
})

function tickCursor() {
  dot.style.transform  = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`
  ringX += (curX - ringX) * 0.12
  ringY += (curY - ringY) * 0.12
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
  requestAnimationFrame(tickCursor)
}
tickCursor()

// hover state
document.querySelectorAll('a, button, .product-cta').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'))
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'))
})

// ─── MAIN APP INIT ──────────────────────────
function initApp() {
  setupLenis()
  setupHeroAnimations()
  setupSceneAnimations()
  startRenderLoop()
}

// ─── LENIS SMOOTH SCROLL ────────────────────
let lenis
function setupLenis() {
  lenis = new Lenis({
    duration: 1.6,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
    infinite: false,
  })

  lenis.on('scroll', ({ scroll, limit }) => {
    const progress = scroll / limit
    world.setSceneValue(progress)
    ScrollTrigger.update()
  })

  gsap.ticker.add(time => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

// ─── HERO ENTRANCE ANIMATIONS ───────────────
function setupHeroAnimations() {
  const tl = gsap.timeline({ delay: 0.3 })

  tl.to('.hero-eyebrow', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  })

  tl.to('.title-line', {
    opacity: 1,
    y: '0%',
    duration: 1.2,
    stagger: 0.18,
    ease: 'power4.out',
  }, '-=0.5')

  tl.to('.hero-sub', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
  }, '-=0.6')

  tl.to('.hero-scroll-cue', {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.4')
}

// ─── SCROLL-TRIGGERED SCENE ANIMATIONS ──────
function setupSceneAnimations() {
  // Scenes 1-4: stagger-reveal their content
  document.querySelectorAll('.scene:not(.scene-hero)').forEach((section, i) => {
    const content = section.querySelector('.scene-content')
    if (!content) return

    const els = content.querySelectorAll('.product-label, .scene-title, .title-serif, .title-block, .title-italic, .scene-desc, .product-cta, .finale-eyebrow, .finale-title, .finale-sub, .finale-actions')

    gsap.set(els, { opacity: 0, y: 48 })

    ScrollTrigger.create({
      trigger: section,
      start: 'top 72%',
      onEnter: () => {
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'power3.out',
        })
      },
      onLeaveBack: () => {
        gsap.to(els, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power2.in',
        })
      },
    })
  })

  // Parallax depth for the scene-content blocks
  document.querySelectorAll('.scene').forEach(section => {
    const content = section.querySelector('.scene-content')
    if (!content) return

    gsap.to(content, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.8,
      },
    })
  })

  // Horizontal marquee shift for hero title
  gsap.to('.hero-title', {
    xPercent: -4,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scene-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 2,
    },
  })

  // Bloom pulse lines between sections
  createDividers()
}

function createDividers() {
  // Inject a thin gold rule between each scene
  const scenes = document.querySelectorAll('.scene')
  scenes.forEach((s, i) => {
    if (i === scenes.length - 1) return
    const rule = document.createElement('div')
    rule.style.cssText = `
      position: relative; z-index: 3;
      height: 1px;
      background: linear-gradient(90deg, transparent, #c8a96e 30%, #c8a96e 70%, transparent);
      opacity: 0; margin: 0 clamp(40px, 8vw, 120px);
    `
    s.after(rule)

    ScrollTrigger.create({
      trigger: rule,
      start: 'top 80%',
      onEnter: () => gsap.to(rule, { opacity: 0.45, duration: 1.2, ease: 'power2.out' }),
      onLeaveBack: () => gsap.to(rule, { opacity: 0, duration: 0.5 }),
    })
  })
}

// ─── RENDER LOOP ────────────────────────────
function startRenderLoop() {
  function raf() {
    world.update()
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
}
