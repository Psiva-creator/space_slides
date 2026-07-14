import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

const NEBULA_VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;
const NEBULA_FRAG = `
precision highp float;varying vec2 vUv;uniform float uTime;uniform float uScroll;uniform vec2 uResolution;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
float fbm(vec2 p){float v=0.,a=.5;mat2 rot=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));for(int i=0;i<6;i++){v+=a*snoise(p);p=rot*p*2.;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/uResolution;float aspect=uResolution.x/uResolution.y;vec2 p=(uv-.5)*vec2(aspect,1.);float t=uTime*.25+uScroll*1.5;float n1=fbm(p*1.4+vec2(t*.2,t*.1));float n2=fbm(p*2.2+vec2(-t*.15,t*.18)+n1*.5);float n3=fbm(p*3.8+vec2(t*.12,-t*.2)+n2*.35);float aurora=smoothstep(.15,.65,n1*.5+.5);aurora+=smoothstep(.2,.75,n2*.5+.5)*.45;aurora+=smoothstep(.3,.85,n3*.5+.5)*.2;aurora=pow(aurora*.35,2.2);vec3 col1=vec3(.005,.02,.005);vec3 col2=vec3(.03,.18,.02);vec3 col3=vec3(.08,.45,.05);vec3 col4=vec3(.25,.7,.12);vec3 color=mix(col1,col2,aurora);color=mix(color,col3,smoothstep(.15,.5,aurora));color=mix(color,col4,smoothstep(.4,.9,aurora));float dist=length(p);color+=vec3(.02,.12,.01)*exp(-dist*2.8)*.15;color*=1.-smoothstep(.2,.95,dist);color*=.85;gl_FragColor=vec4(color,1.);}
`;

const PROBLEMS = [
  { line1:'INDIA IS', line2:'BLIND', source:'NDTV · SURVEILLANCE REPORT', headline:"India's 10M Cameras Record Crime — But Never Stop It", stat:'85%', statLabel:'of cameras are non-intelligent passive recorders', body:"India has spent heavily on cameras as a proxy for safety without building the intelligence layer that makes them act as safety tools. Over 85% only record after the fact.", date:'JULY 2025', img:'/prob-1.png' },
  { line1:'NO ONE', line2:'WATCHING', source:'THE HINDU · METRO', headline:"Delhi's 1,500 Cameras Per Square Mile — Zero Human Coverage", stat:'1,500', statLabel:'cameras per sq. mile, no operator can keep up', body:"At this volume no control room can staff enough operators to cover every feed every hour. More cameras were added as the solution — attention never followed.", date:'JUNE 2025', img:'/prob-2.png' },
  { line1:'AI', line2:'FAILS HERE', source:'TIMES OF INDIA · TECH', headline:'Commercial AI Loses 40–60% Accuracy on Indian Streets', stat:'60%', statLabel:'accuracy drop in real Indian field conditions', body:"Models trained on Western datasets — COCO, ImageNet — fundamentally misread Indian streets. The gap isn't calibration; these models were never built for this environment.", date:'MAY 2025', img:'/prob-3.png' },
  { line1:'TOO', line2:'COSTLY', source:'ECONOMIC TIMES · INFRA', headline:"Replacing India's 10M Legacy Cameras Is Capital Nobody Has", stat:'₹75K Cr', statLabel:'estimated cost — no municipal budget can absorb', body:"With 10 million cameras already installed, the obvious fix — replace with AI-native hardware — isn't financially viable. The math doesn't work at scale.", date:'APRIL 2025', img:'/prob-4.png' },
  { line1:'DATA', line2:'OVERFLOW', source:'MINT · DEEP TECH', headline:'Central AI Processing Creates a Bandwidth Bottleneck at Scale', stat:'∞', statLabel:'server costs grow linearly with every camera added', body:"Traditional AI analytics require constant streaming to central GPU servers. As networks grow, bandwidth clogs and compute costs scale linearly — making national deployment unworkable.", date:'MARCH 2025', img:'/prob-5.png' },
  { line1:'PRIVACY', line2:'EXPOSED', source:'INDIAN EXPRESS · POLICY', headline:'DPDP Act 2023 Makes Every Surveillance Camera a Legal Liability', stat:'2023', statLabel:'DPDP Act — every camera now a compliance risk', body:"Under DPDP Act 2023, any system handling biometric or facial data must answer where footage is stored and who can access it. Unresolved, every camera is a legal liability.", date:'FEB 2025', img:'/prob-6.png' },
];

function sampleText(line1, line2, scaleX, scaleY, offX) {
  const TW = 1200, TH = 480;
  const cv = document.createElement('canvas');
  cv.width = TW; cv.height = TH;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 180px Arial Black, Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(line1, TW / 2, TH * 0.3);
  ctx.fillText(line2, TW / 2, TH * 0.72);
  const px = ctx.getImageData(0, 0, TW, TH).data;
  const pts = [], cols = [];
  const step = 3;
  const c = new THREE.Color();
  for (let y = 0; y < TH; y += step)
    for (let x = 0; x < TW; x += step)
      if (px[(y * TW + x) * 4 + 3] > 100) {
        pts.push((x / TW - 0.5) * scaleX + offX, -(y / TH - 0.5) * scaleY, 0);
        const roll = Math.random();
        // 25% pure white, 50% bright green-white, 25% mid green
        if (roll > 0.75)      c.setHSL(0.0,  0.0,  1.0);                             // pure white
        else if (roll > 0.25) c.setHSL(0.29 + Math.random()*0.06, 0.85, 0.82 + Math.random()*0.18); // bright green
        else                  c.setHSL(0.30 + Math.random()*0.07, 0.70, 0.55 + Math.random()*0.20); // mid green
        cols.push(c.r, c.g, c.b);
      }
  // shuffle
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

export default function App() {
  const canvasRef    = useRef(null);
  const scrollRef    = useRef(null);
  const subtitleRef  = useRef(null);
  const scrollHintRef = useRef(null);
  const probRefs     = useRef([]);

  useEffect(() => {
    const W = innerWidth, H = innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: false, alpha: false });
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.autoClear = false;
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    camera.position.set(0, 0, 480);
    const nebulaScene = new THREE.Scene();
    const nebulaCam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const nebulaGeo   = new THREE.PlaneGeometry(2, 2);
    const nebulaMat   = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0}, uScroll:{value:0}, uResolution:{value:new THREE.Vector2(W,H)} },
      vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG, depthTest:false, depthWrite:false,
    });
    nebulaScene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

    const N = 25000;
    const origPos = new Float32Array(N * 3);
    const origCol = new Float32Array(N * 3);
    const curPos  = new Float32Array(N * 3);
    const curCol  = new Float32Array(N * 3);
    const sz      = new Float32Array(N);
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      origPos[i3]   = (Math.random()-0.5)*1400;
      origPos[i3+1] = (Math.random()-0.5)*700;
      origPos[i3+2] = (Math.random()-0.5)*1400;
      const bright = Math.random() > 0.80;
      if (bright) { c.setHSL(0.26+Math.random()*0.08,1.0,0.65+Math.random()*0.30); sz[i]=2.0+Math.random()*3.0; }
      else         { c.setHSL(0.30+Math.random()*0.1, 0.7,0.20+Math.random()*0.15); sz[i]=0.5+Math.random()*1.0; }
      origCol[i3]=c.r; origCol[i3+1]=c.g; origCol[i3+2]=c.b;
    }
    curPos.set(origPos); curCol.set(origCol);

    // [0] VAAYU SWARM — wide, full screen
    const vaayuS = sampleText('VAAYU','SWARM', 920, 340, 0);
    // [1-6] Problems — left half, wider & taller than before
    // camera z=480, FOV60 → half-width≈277 units. offX=-120, scaleX=330 → range -285 to -45
    const probS  = PROBLEMS.map(p => sampleText(p.line1, p.line2, 330, 230, -120));
    const allSamples = [vaayuS, ...probS];

    // Build target arrays — text particles get big glowing sizes
    const allTargets = allSamples.map(({ pts, cols }, targetIdx) => {
      const tPos = origPos.slice();
      const tCol = origCol.slice();
      const nT = Math.min(pts.length / 3, N);
      for (let i = 0; i < nT; i++) {
        const i3 = i * 3;
        // Tiny random jitter to keep individual particles visible
        tPos[i3]  = pts[i3]   + (Math.random()-0.5)*3;
        tPos[i3+1]= pts[i3+1] + (Math.random()-0.5)*3;
        tPos[i3+2]= pts[i3+2] + (Math.random()-0.5)*8;
        tCol[i3]=cols[i3]; tCol[i3+1]=cols[i3+1]; tCol[i3+2]=cols[i3+2];
        // VAAYU SWARM: 4-8 size; Problem text: 3.5-6.5
        sz[i] = targetIdx === 0
          ? 4.0 + Math.random() * 4.0
          : 3.5 + Math.random() * 3.0;
      }
      return { pos: tPos, col: tCol };
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(curPos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(curCol, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz, 1));
    const ptsMat = new THREE.ShaderMaterial({
      // Wider perspective scaling (320 → bigger dots further out)
      // Soft glow: exp(-r*1.4) → larger, softer halo per particle
      vertexShader:`attribute float size;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*(320./-mv.z);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`varying vec3 vColor;void main(){
        float r=length(2.*gl_PointCoord-1.);
        if(r>1.)discard;
        // Soft glow falloff — bigger, brighter halo
        float core=exp(-r*3.5);
        float halo=exp(-r*1.2)*0.55;
        float a=(core+halo)*0.95;
        gl_FragColor=vec4(vColor*1.9,a);
      }`,
      blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, vertexColors:true,
    });
    const pts = new THREE.Points(geo, ptsMat);
    scene.add(pts);

    // Morph state
    const ms = {
      fromPos: origPos.slice(), fromCol: origCol.slice(),
      toPos: allTargets[0].pos, toCol: allTargets[0].col,
      t: 0, scroll: 1,
    };

    const morphTo = (idx, dur = 1.5) => {
      ms.fromPos = new Float32Array(curPos);
      ms.fromCol = new Float32Array(curCol);
      ms.toPos = allTargets[idx].pos;
      ms.toCol = allTargets[idx].col;
      ms.t = 0;
      gsap.killTweensOf(ms);
      gsap.to(ms, { t: 1, duration: dur, ease: 'power2.inOut' });
    };

    // 1. Form VAAYU SWARM on load
    gsap.to(ms, {
      t: 1, duration: 2.8, delay: 0.7, ease: 'power2.inOut',
      onComplete: () => {
        if (subtitleRef.current)  gsap.to(subtitleRef.current,  { opacity:1, y:0, duration:1.1, ease:'power3.out' });
        if (scrollHintRef.current) gsap.to(scrollHintRef.current, { opacity:1, duration:1, delay:0.7 });
      },
    });

    // 2. Title slide — scatter as it scrolls off (end = when title bottom hits viewport top)
    ScrollTrigger.create({
      trigger: '.title-slide', start: 'top top', end: 'bottom top', scrub: 2,
      onUpdate: (self) => {
        ms.scroll = 1 - self.progress;
        nebulaMat.uniforms.uScroll.value = self.progress * 0.3;
        if (subtitleRef.current)   subtitleRef.current.style.opacity   = Math.max(0, 1 - self.progress*2.5);
        if (scrollHintRef.current) scrollHintRef.current.style.opacity = Math.max(0, 1 - self.progress*4);
      },
    });

    // 3. Problem slides — morph when each slide reaches the TOP of viewport
    PROBLEMS.forEach((_, i) => {
      const el = probRefs.current[i];
      if (!el) return;
      ScrollTrigger.create({
        trigger: el, start: 'top top', end: 'bottom top',
        onEnter:     () => { ms.scroll = 1; morphTo(i + 1); },
        onEnterBack: () => { ms.scroll = 1; morphTo(i + 1); },
        onLeave:     () => { /* keep current text — next slide will morph */ },
      });
    });

    // RAF
    const clk = new THREE.Clock();
    const loop = () => {
      requestAnimationFrame(loop);
      const t = clk.getElapsedTime();
      nebulaMat.uniforms.uTime.value = t;
      camera.position.y = Math.sin(t * 0.18) * 12;
      camera.position.x = Math.sin(t * 0.11) * 6;
      camera.lookAt(0, 0, 0);

      const eff = ms.t * ms.scroll;
      const fP=ms.fromPos, fC=ms.fromCol, tP=ms.toPos, tC=ms.toCol;
      for (let i = 0; i < N * 3; i++) {
        curPos[i] = fP[i] + (tP[i]-fP[i]) * eff;
        curCol[i] = fC[i] + (tC[i]-fC[i]) * eff;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate    = true;

      const rot = (1-eff)*0.014;
      pts.rotation.y = t * rot;
      pts.rotation.x = Math.sin(t*0.05)*0.02*(1-eff);

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
      removeEventListener('resize', onR);
      ScrollTrigger.getAll().forEach(s=>s.kill());
      renderer.dispose(); geo.dispose(); ptsMat.dispose(); nebulaGeo.dispose(); nebulaMat.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas" />
      <nav id="top-nav">
        <div className="nav-left">THE STATE OF THE SWARM</div>
        <div className="nav-logo">VAAYU</div>
        <div className="nav-right">SCROLL TO EXPLORE</div>
      </nav>
      <div className="sidebar-right">
        <div className="sidebar-badge">V.</div>
        <div className="sidebar-label">Swarm</div>
      </div>
      <div className="footer-left">2025</div>
      <div className="footer-right">EDGE AI DRONE PLATFORM</div>

      <div className="title-overlay">
        <div ref={subtitleRef} className="title-subtitle">AUTONOMOUS &nbsp;·&nbsp; EDGE AI &nbsp;·&nbsp; DRONE SURVEILLANCE</div>
        <div ref={scrollHintRef} className="scroll-hint"><span className="scroll-arrow">↓</span> SCROLL TO EXPLORE</div>
      </div>

      <div id="scroll-root" ref={scrollRef}>

        {/* SLIDE 1 — Title */}
        <section className="slide title-slide" />

        {/* SLIDES 2-7 — Problems */}
        {PROBLEMS.map((p, i) => (
          <section
            key={i}
            className="problem-slide"
            ref={el => probRefs.current[i] = el}
          >
            {/* Left half — particle text renders here on canvas; news card at bottom */}
            <div className="prob-left">
              {/* Top 55%: particle text floats here (canvas behind) */}
              <div className="prob-particle-zone" />
              {/* Bottom 45%: news article card */}
              <div className="news-card">
                <div className="news-source">{p.source}</div>
                <div className="news-headline">{p.headline}</div>
                <div className="news-stat-row">
                  <span className="news-stat">{p.stat}</span>
                  <span className="news-stat-label">{p.statLabel}</span>
                </div>
                <p className="news-body">{p.body}</p>
                <div className="news-date">{p.date}</div>
              </div>
            </div>

            {/* Right half — news image */}
            <div className="prob-right">
              <img src={p.img} alt={p.headline} className="prob-img" />
            </div>
          </section>
        ))}

      </div>
    </>
  );
}
