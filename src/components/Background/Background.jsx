import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NEBULA_VERT, NEBULA_FRAG, PROBLEMS } from '../../data/content';
import { createProceduralDrone } from '../../ProceduralDrone';

gsap.registerPlugin(ScrollTrigger);

function sampleText(line1, line2, scaleX, scaleY, offX) {
  const TW = 1400, TH = 520;
  const cv = document.createElement('canvas');
  cv.width = TW; cv.height = TH;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 175px Arial Black, Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(line1, TW / 2, TH * 0.3);
  ctx.fillText(line2, TW / 2, TH * 0.72);
  const px = ctx.getImageData(0, 0, TW, TH).data;
  const pts = [], cols = [];
  const c = new THREE.Color();
  for (let y = 0; y < TH; y += 3)
    for (let x = 0; x < TW; x += 3)
      if (px[(y * TW + x) * 4 + 3] > 100) {
        pts.push((x / TW - 0.5) * scaleX + offX, -(y / TH - 0.5) * scaleY, 0);
        const r = Math.random();
        if (r > 0.65)      c.setHSL(0.33, 0.10, 0.93);
        else if (r > 0.25) c.setHSL(0.28 + Math.random()*0.06, 0.75, 0.82 + Math.random()*0.12);
        else               c.setHSL(0.30 + Math.random()*0.07, 0.90, 0.65 + Math.random()*0.15);
        cols.push(c.r, c.g, c.b);
      }
  const n = pts.length / 3;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    for (let k = 0; k < 3; k++) {
      [pts[i*3+k], pts[j*3+k]] = [pts[j*3+k], pts[i*3+k]];
      [cols[i*3+k], cols[j*3+k]] = [cols[j*3+k], cols[i*3+k]];
    }
  }
  return { pts, cols };
}

export default function Background({ titleSlideRef, subtitleRef, scrollHintRef, probRefs }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const W = innerWidth, H = innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: false });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.autoClear = false;
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.set(0, 0, 480);
    const nebulaScene = new THREE.Scene();
    const nebulaCam   = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const nebulaGeo   = new THREE.PlaneGeometry(2,2);
    const nebulaMat   = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0}, uScroll:{value:0}, uResolution:{value:new THREE.Vector2(W,H)} },
      vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG, depthTest:false, depthWrite:false,
    });
    nebulaScene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

    const N = 25000;
    const origPos = new Float32Array(N*3), origCol = new Float32Array(N*3);
    const curPos  = new Float32Array(N*3), curCol  = new Float32Array(N*3);
    const sz = new Float32Array(N);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const i3 = i*3;
      origPos[i3]   = (Math.random()-.5)*1400;
      origPos[i3+1] = (Math.random()-.5)*700;
      origPos[i3+2] = (Math.random()-.5)*1400;
      const bright = Math.random() > 0.8;
      if (bright) { c.setHSL(0.26+Math.random()*.08,1,.65+Math.random()*.3); sz[i]=2+Math.random()*3; }
      else         { c.setHSL(0.30+Math.random()*.1,.7,.2+Math.random()*.15); sz[i]=.5+Math.random(); }
      origCol[i3]=c.r; origCol[i3+1]=c.g; origCol[i3+2]=c.b;
    }
    curPos.set(origPos); curCol.set(origCol);

    // Three.js FOV is VERTICAL. Aspect=W/H≈1.78
    // half-height=480*tan(30°)=277, half-WIDTH=277*1.78=493
    // Left-half center = -493/2 = -246
    const vaayuS = sampleText('VAAYU','SWARM', 880, 320, 0);
    const probS  = PROBLEMS.map(p => sampleText(p.line1, p.line2, 420, 250, -246));
    const allSamples = [vaayuS, ...probS];

    const allTargets = [
      ...allSamples.map(({ pts, cols }, ti) => {
        const tPos = origPos.slice(), tCol = origCol.slice();
        const nT = Math.min(pts.length/3, N);
        for (let i = 0; i < nT; i++) {
          const i3=i*3;
          tPos[i3]  = pts[i3]   + (Math.random()-.5)*2;
          tPos[i3+1]= pts[i3+1] + (Math.random()-.5)*2;
          tPos[i3+2]= pts[i3+2] + (Math.random()-.5)*6;
          tCol[i3]=cols[i3]; tCol[i3+1]=cols[i3+1]; tCol[i3+2]=cols[i3+2];
          sz[i] = ti===0 ? 4.5+Math.random()*3.5 : 4+Math.random()*3;
        }
        return { pos:tPos, col:tCol };
      }),
      { pos: origPos, col: origCol }
    ];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(curPos,3));
    geo.setAttribute('color',    new THREE.BufferAttribute(curCol,3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz,1));
    
    // Shader with uAlpha uniform for fading text out
    const ptsMat = new THREE.ShaderMaterial({
      uniforms: {
        uAlpha: { value: 1.0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (320.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float uAlpha;
        void main() {
          float r = length(2.0 * gl_PointCoord - 1.0);
          if (r > 1.0) discard;
          float a = exp(-r * 3.0) * 0.95 + exp(-r * 1.1) * 0.5;
          gl_FragColor = vec4(vColor * 2.1, a * 0.92 * uAlpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });
    
    const ptsObj = new THREE.Points(geo, ptsMat);
    ptsObj.rotation.set(0,0,0);
    scene.add(ptsObj);

    // ── Instantiate Procedural Drone ──
    const { mesh: droneMesh, material: droneMat } = createProceduralDrone();
    // Scale drone mesh to fit nicely inside z=480 perspective camera view
    droneMesh.scale.set(8.5, 8.5, 8.5);
    droneMesh.position.set(0, -5, 0); // slightly lowered
    droneMesh.rotation.x = 0.15; // default fly tilt
    scene.add(droneMesh);

    const ms = { fromPos:origPos.slice(), fromCol:origCol.slice(), toPos:allTargets[0].pos, toCol:allTargets[0].col, t:0 };

    // Smooth expo morph — particles dismantle then stream to new positions
    const morphTo = (idx, dur=2.0, delay=0) => {
      ms.fromPos = new Float32Array(curPos);
      ms.fromCol = new Float32Array(curCol);
      ms.toPos = allTargets[idx].pos;
      ms.toCol = allTargets[idx].col;
      ms.t = 0;
      gsap.killTweensOf(ms);
      gsap.to(ms, { t:1, duration:dur, delay, ease:'expo.inOut' });
    };

    // Initial VAAYU SWARM formation
    let subtitleShown = false;
    const showSubtitle = () => {
      if (subtitleShown) return; subtitleShown = true;
      gsap.to(subtitleRef.current,   { opacity:1, y:0, duration:1.2, ease:'power3.out' });
      gsap.to(scrollHintRef.current, { opacity:1, duration:1.0, delay:0.8 });
    };
    gsap.to(ms, { t:1, duration:2.8, delay:0.5, ease:'expo.inOut', onComplete:showSubtitle });

    // Scroll listener — ONLY for continuous Z-axis space travel + subtitle fade. Does NOT touch ms.t
    const onScroll = () => {
      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const maxScroll = document.body.scrollHeight - innerHeight;
      const totalProg = maxScroll > 0 ? scrollY / maxScroll : 0;
      
      const prog = Math.min(1, scrollY / innerHeight);
      
      // Continuous warp effect for nebula
      nebulaMat.uniforms.uScroll.value = totalProg * 6.0; 
      
      // Continuous Z-axis travel for the camera
      camera.position.z = 480 - totalProg * 280;

      if (subtitleRef.current)   subtitleRef.current.style.opacity   = Math.max(0, 1 - prog*2.2);
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = Math.max(0, 1 - prog*3.5);
    };
    addEventListener('scroll', onScroll, { passive:true });

    const solEl = document.querySelector('.solution-section');

    // IntersectionObserver — ONLY thing that triggers morphTo
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target === titleSlideRef.current) {
          morphTo(0, 2.0, 0); showSubtitle(); return;
        }
        if (entry.target === solEl) {
          morphTo(7, 2.2, 0); return;
        }
        const idx = probRefs.current.indexOf(entry.target);
        if (idx >= 0) morphTo(idx+1, 2.2, 0.1);
      });
    }, { threshold: 0.5 });

    if (titleSlideRef.current) obs.observe(titleSlideRef.current);
    probRefs.current.forEach(el => el && obs.observe(el));
    if (solEl) obs.observe(solEl);

    // ── Drone assembly scroll-linked trigger ──
    const droneTrigger = ScrollTrigger.create({
      trigger: '.closing-section',
      start: 'top bottom', // when closing section starts entering
      end: 'bottom bottom', // when it is fully visible
      scrub: 1.2,
      onUpdate: (self) => {
        const prog = self.progress;

        // 1. Fade out text particles (ptsMat) using the uAlpha uniform
        if (ptsMat.uniforms.uAlpha) {
          ptsMat.uniforms.uAlpha.value = 1.0 - prog;
        }

        // 2. Animate drone assembly progress (uProgress)
        // Drone builds between progress 0.10 and 0.85
        const droneProg = Math.max(0, Math.min(1, (prog - 0.10) / 0.75));
        droneMat.uniforms.uProgress.value = droneProg;

        // 3. Rotate the drone as it builds
        droneMesh.rotation.y = prog * Math.PI * 3.0;
        
        // 4. Vertical drift
        droneMesh.position.y = -5 + 3.5 * Math.sin(prog * Math.PI);
      },
      onLeaveBack: () => {
        droneMat.uniforms.uProgress.value = 0.0;
        if (ptsMat.uniforms.uAlpha) {
          ptsMat.uniforms.uAlpha.value = 1.0;
        }
      }
    });

    // RAF — no rotation on ptsObj, only subtle camera drift
    const clk = new THREE.Clock();
    const loop = () => {
      requestAnimationFrame(loop);
      const t = clk.getElapsedTime();
      nebulaMat.uniforms.uTime.value = t;
      
      // Update drone time uniform to animate rotors and float hover
      if (droneMat) {
        droneMat.uniforms.uTime.value = t;
      }
      
      // Camera gently drifts — gives life without spinning particles
      camera.position.y = Math.sin(t*0.18)*8;
      camera.position.x = Math.sin(t*0.11)*4;
      camera.lookAt(0,0,0);

      // Use ms.t directly — no ms.scroll interference
      const eff = ms.t;
      const fP=ms.fromPos, fC=ms.fromCol, tP=ms.toPos, tC=ms.toCol;
      for (let i = 0; i < N*3; i++) {
        curPos[i] = fP[i] + (tP[i]-fP[i])*eff;
        curCol[i] = fC[i] + (tC[i]-fC[i])*eff;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate    = true;

      renderer.clear();
      renderer.render(nebulaScene, nebulaCam);
      renderer.render(scene, camera);
    };
    loop();

    const onR = () => {
      const w=innerWidth, h=innerHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h); nebulaMat.uniforms.uResolution.value.set(w,h);
    };
    addEventListener('resize', onR);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onR);
      obs.disconnect();
      if (droneTrigger) droneTrigger.kill();
      ScrollTrigger.getAll().forEach(s => s.kill());
      renderer.dispose(); geo.dispose(); ptsMat.dispose(); nebulaGeo.dispose(); nebulaMat.dispose();
      if (droneMesh) {
        scene.remove(droneMesh);
        droneMesh.geometry.dispose();
      }
      if (droneMat) {
        droneMat.dispose();
      }
    };
  }, [titleSlideRef, subtitleRef, scrollHintRef, probRefs]);

  return <canvas ref={canvasRef} id="bg-canvas" />;
}
