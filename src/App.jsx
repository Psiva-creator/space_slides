import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

const NAV_LABELS = [
  'SCROLL TO DIVE IN','KEEP GOING','KEEP GOING','KEEP GOING',
  'KEEP GOING','KEEP GOING','KEEP GOING','KEEP GOING',
  'KEEP GOING','KEEP GOING','KEEP GOING','KEEP GOING',
  'ALMOST THERE','ALMOST THERE',
];

/* ═══════════════════════════════════════════════════════════
   FULL-SCREEN NEBULA SHADER — green aurora + flowing fog
   This is a single triangle covering the screen, running
   a fragment shader with simplex noise to generate the
   flowing green nebula effect matching the video.
   ═══════════════════════════════════════════════════════════ */

const NEBULA_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const NEBULA_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uResolution;

  // Simplex-ish noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      v += a * snoise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = uTime * 0.08 + uScroll * 1.5;

    // Flowing aurora layers — slow, organic motion
    float n1 = fbm(p * 1.4 + vec2(t * 0.2, t * 0.1));
    float n2 = fbm(p * 2.2 + vec2(-t * 0.15, t * 0.18) + n1 * 0.5);
    float n3 = fbm(p * 3.8 + vec2(t * 0.12, -t * 0.2) + n2 * 0.35);

    // Thin wisps — aggressive power curve pushes most to black
    float aurora = smoothstep(0.15, 0.65, n1 * 0.5 + 0.5);
    aurora += smoothstep(0.2, 0.75, n2 * 0.5 + 0.5) * 0.45;
    aurora += smoothstep(0.3, 0.85, n3 * 0.5 + 0.5) * 0.2;
    aurora = pow(aurora * 0.35, 2.2);

    // Dark green palette — mostly black with green wisps
    vec3 col1 = vec3(0.005, 0.02, 0.005);   // near-black
    vec3 col2 = vec3(0.03, 0.18, 0.02);     // dark forest
    vec3 col3 = vec3(0.08, 0.45, 0.05);     // mid green
    vec3 col4 = vec3(0.25, 0.7, 0.12);      // bright wisps

    vec3 color = mix(col1, col2, aurora);
    color = mix(color, col3, smoothstep(0.15, 0.5, aurora));
    color = mix(color, col4, smoothstep(0.4, 0.9, aurora));

    // Subtle center glow
    float dist = length(p);
    float glow = exp(-dist * 2.8) * 0.15;
    color += vec3(0.02, 0.12, 0.01) * glow;

    // Strong vignette — dark edges like video
    float vig = 1.0 - smoothstep(0.2, 0.95, dist);
    color *= vig;

    // Keep it dark — video is mostly black with wisps
    color *= 0.85;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function App() {
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const [navLabel, setNavLabel] = useState('SCROLL TO DIVE IN');

  /* ── WebGL: nebula shader + particle dots ── */
  useEffect(() => {
    const W = innerWidth, H = innerHeight;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current, antialias: false, alpha: false,
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.autoClear = false;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.set(0, 30, 600);

    /* ── Fullscreen nebula quad ── */
    const nebulaScene  = new THREE.Scene();
    const nebulaCam    = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const nebulaGeo    = new THREE.PlaneGeometry(2, 2);
    const nebulaMat    = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uScroll:     { value: 0 },
        uResolution: { value: new THREE.Vector2(W, H) },
      },
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      depthTest: false,
      depthWrite: false,
    });
    nebulaScene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

    /* ── Scattered bright particles ── */
    const N = 25000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const sz  = new Float32Array(N);
    const c   = new THREE.Color();

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      pos[i3]   = (Math.random() - 0.5) * 1200;
      pos[i3+1] = (Math.random() - 0.5) * 600;
      pos[i3+2] = (Math.random() - 0.5) * 1200;

      const bright = Math.random() > 0.82;
      if (bright) {
        c.setHSL(0.26 + Math.random() * 0.08, 1.0, 0.6 + Math.random() * 0.35);
        sz[i] = 2.0 + Math.random() * 3.0;
      } else {
        c.setHSL(0.30 + Math.random() * 0.1, 0.8, 0.25 + Math.random() * 0.2);
        sz[i] = 0.6 + Math.random() * 1.2;
      }
      col[i3] = c.r; col[i3+1] = c.g; col[i3+2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz, 1));

    const ptsMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (250.0 / -mv.z);
          gl_Position  = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float r = length(2.0 * gl_PointCoord - 1.0);
          if (r > 1.0) discard;
          float a = exp(-r * 2.5);
          gl_FragColor = vec4(vColor * 1.3, a * 0.85);
        }`,
      blending: THREE.AdditiveBlending,
      depthWrite: false, transparent: true, vertexColors: true,
    });
    const pts = new THREE.Points(geo, ptsMat);
    scene.add(pts);

    /* ── Animation loop ── */
    const clk = new THREE.Clock();
    let scrollVal = 0;
    const loop = () => {
      requestAnimationFrame(loop);
      const t = clk.getElapsedTime();
      nebulaMat.uniforms.uTime.value = t;
      nebulaMat.uniforms.uScroll.value = scrollVal;

      pts.rotation.y = t * 0.03;
      pts.rotation.x = Math.sin(t * 0.08) * 0.05;

      // Draw nebula first, then particles on top
      renderer.clear();
      renderer.render(nebulaScene, nebulaCam);
      renderer.render(scene, camera);
    };
    loop();

    /* ── Camera moves on scroll ── */
    gsap.to(camera.position, {
      z: -200, y: 0,
      scrollTrigger: {
        trigger: '#scroll-root', start: 'top top', end: 'bottom bottom',
        scrub: 2,
        onUpdate: (self) => { scrollVal = self.progress; },
      },
    });

    const onR = () => {
      const w = innerWidth, h = innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      nebulaMat.uniforms.uResolution.value.set(w, h);
    };
    addEventListener('resize', onR);
    return () => {
      removeEventListener('resize', onR);
      ScrollTrigger.getAll().forEach(s => s.kill());
      renderer.dispose(); geo.dispose(); ptsMat.dispose();
      nebulaGeo.dispose(); nebulaMat.dispose();
    };
  }, []);

  /* ── Nav label updates ── */
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#scroll-root', start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        const idx = Math.min(
          Math.floor(self.progress * NAV_LABELS.length),
          NAV_LABELS.length - 1
        );
        setNavLabel(NAV_LABELS[idx]);
      },
    });
    return () => st.kill();
  }, []);

  /* ── Slide animations ── */
  useEffect(() => {
    gsap.utils.toArray('.slide-inner').forEach((el) => {
      const slide = el.closest('.slide');
      gsap.fromTo(el,
        { opacity: 0, y: 60, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1,
          scrollTrigger: { trigger: slide, start: 'top 80%', end: 'top 20%', scrub: 1 } }
      );
      gsap.to(el, {
        opacity: 0, y: -40, filter: 'blur(6px)',
        scrollTrigger: { trigger: slide, start: 'bottom 80%', end: 'bottom 20%', scrub: 1 }
      });
    });
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas" />

      {/* Nav — 3-column grid matching video */}
      <nav id="top-nav">
        <div className="nav-left">{navLabel}</div>
        <div className="nav-logo">VAAYU →</div>
        <div className="nav-right">AUDIO OFF &nbsp;···</div>
      </nav>

      {/* Right sidebar */}
      <div className="sidebar-right">
        <div className="sidebar-badge">V.</div>
        <div className="sidebar-label">Conclave</div>
      </div>

      {/* Footer */}
      <div className="footer-left">SHARE</div>
      <div className="footer-right">MADE BY VAAYU TEAM</div>

      {/* ════ SCROLL CONTENT ════ */}
      <div id="scroll-root" ref={scrollRef}>

        {/* 01 — HERO */}
        <section className="slide">
          <div className="slide-inner">
            <div className="hero-top">The state</div>
            <div className="hero-sub">
              AN OVERVIEW OF VAAYU SWARM IN NUMBERS AND FACTS.<br/>
              WHAT'S BUILT, HOW IT DETECTS, AND WHAT MAKES<br/>
              IT THE SMALLEST EDGE AI DRONE PLATFORM TODAY.
            </div>
            <div className="hero-bottom">of the swarm</div>
          </div>
        </section>

        {/* 02 — 107 KB */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">107</div>
              <div className="num-title">107 KB model<span className="num-super">(107)</span></div>
            </div>
            <div className="num-sub">INT8 QUANTIZED · FITS IN ESP32-S3 SRAM</div>
          </div>
        </section>

        {/* 03 — 95% */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">95</div>
              <div className="num-title">Accuracy rate<span className="num-super">(95.05%)</span></div>
            </div>
            <div className="num-sub">PERSON VS NON-PERSON CLASSIFICATION</div>
          </div>
        </section>

        {/* 04 — 99% */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">99</div>
              <div className="num-title">Detection recall<span className="num-super">(99.48%)</span></div>
            </div>
            <div className="num-sub">NEAR-ZERO MISSED DETECTIONS IN THE FIELD</div>
          </div>
        </section>

        {/* 05 — PROBLEM */}
        <section className="slide">
          <div className="slide-inner">
            <div className="hero-top">You've seen</div>
            <div className="hero-sub">
              STANDARD MODELS EXCEED 14 MB — TOO LARGE FOR MCU.<br/>
              NO IR GRAYSCALE SUPPORT. NOISY DATASET LABELS.<br/>
              NO EASY DEPLOYMENT PATH TO ESP-DL.
            </div>
            <div className="hero-bottom">the problem</div>
          </div>
        </section>

        {/* 06 — PIPELINE */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">6</div>
              <div className="num-title">Stage pipeline<span className="num-super">(6)</span></div>
            </div>
            <div className="num-sub">DATA → CLEAN → AUGMENT → TRAIN → QUANTIZE → DEPLOY</div>
          </div>
        </section>

        {/* 07 — TRAINING DATA */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">11K</div>
              <div className="num-title">Training images<span className="num-super">(11,061)</span></div>
            </div>
            <div className="num-sub">CURATED FROM COCO, CROWDHUMAN, AND WEB SOURCES</div>
          </div>
        </section>

        {/* 08 — HARDWARE */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">240</div>
              <div className="num-title">MHz at the edge<span className="num-super">(240)</span></div>
            </div>
            <div className="num-sub">DFROBOT ESP32-S3 · OV3660 IR · 8MB PSRAM · 940NM IR LEDS</div>
          </div>
        </section>

        {/* 09 — COMMS */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">433</div>
              <div className="num-title">LoRa swarm link<span className="num-super">(433 MHz)</span></div>
            </div>
            <div className="num-sub">LONG-RANGE DRONE-TO-DRONE COMMUNICATION</div>
          </div>
        </section>

        {/* 10 — POWER */}
        <section className="slide">
          <div className="slide-inner">
            <div className="hero-top">Solar</div>
            <div className="hero-sub">
              MPPT ENERGY HARVESTING FOR AUTONOMOUS DEPLOYMENT.<br/>
              CONTINUOUS 24/7 PERIMETER MONITORING WITHOUT<br/>
              HUMAN INTERVENTION OR BATTERY SWAPS.
            </div>
            <div className="hero-bottom">powered</div>
          </div>
        </section>

        {/* 11 — INPUT */}
        <section className="slide">
          <div className="slide-inner">
            <div className="num-wrap">
              <div className="num-ghost">96</div>
              <div className="num-title">Input tensor<span className="num-super">(96×96 px)</span></div>
            </div>
            <div className="num-sub">GRAYSCALE IR COMPATIBLE · INT8 QUANTIZED</div>
          </div>
        </section>

        {/* 12 — USE CASES */}
        <section className="slide">
          <div className="slide-inner">
            <div className="hero-top">Built for</div>
            <div className="hero-sub">
              BORDER SURVEILLANCE. WILDLIFE MONITORING.<br/>
              DISASTER RESCUE. INDUSTRIAL SECURITY.<br/>
              AGRICULTURAL PATROL. SEARCH AND RESCUE.
            </div>
            <div className="hero-bottom">the edge</div>
          </div>
        </section>

        {/* 13 — CLOSING */}
        <section className="slide">
          <div className="slide-inner">
            <div className="text-center-big">Now start exploring</div>
          </div>
        </section>

        {/* 14 — CTA */}
        <section className="slide">
          <div className="slide-inner">
            <div className="text-center-big">VAAYU SWARM</div>
            <div className="cta-sub">AUTONOMOUS EDGE AI DRONE SURVEILLANCE</div>
            <button className="cta-btn">Explore the build</button>
          </div>
        </section>

      </div>
    </>
  );
}
