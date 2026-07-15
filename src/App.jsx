import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import './App.css';

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
  { line1:'AI', line2:'FAILS HERE', source:'TIMES OF INDIA · TECH', headline:'Commercial AI Loses 40–60% Accuracy on Indian Streets', stat:'60%', statLabel:'accuracy drop in real Indian field conditions', body:"Models trained on Western datasets fundamentally misread Indian streets.", date:'MAY 2025', img:'/prob-3.png' },
  { line1:'TOO', line2:'COSTLY', source:'ECONOMIC TIMES · INFRA', headline:"Replacing India's 10M Legacy Cameras Is Capital Nobody Has", stat:'₹75K Cr', statLabel:'estimated cost — no municipal budget can absorb', body:"With 10 million cameras already installed, the obvious fix isn't financially viable.", date:'APRIL 2025', img:'/prob-4.png' },
  { line1:'DATA', line2:'OVERFLOW', source:'MINT · DEEP TECH', headline:'Central AI Processing Creates a Bandwidth Bottleneck at Scale', stat:'∞', statLabel:'server costs grow linearly with every camera added', body:"Traditional AI analytics require constant streaming to central GPU servers.", date:'MARCH 2025', img:'/prob-5.png' },
  { line1:'PRIVACY', line2:'EXPOSED', source:'INDIAN EXPRESS · POLICY', headline:'DPDP Act 2023 Makes Every Surveillance Camera a Legal Liability', stat:'2023', statLabel:'DPDP Act — every camera now a compliance risk', body:"Under DPDP Act 2023, any system handling biometric or facial data must answer where footage is stored.", date:'FEB 2025', img:'/prob-6.png' },
];

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

export default function App() {
  const canvasRef     = useRef(null);
  const subtitleRef   = useRef(null);
  const scrollHintRef = useRef(null);
  const titleSlideRef = useRef(null);
  const probRefs      = useRef([]);

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

    const allTargets = allSamples.map(({ pts, cols }, ti) => {
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
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(curPos,3));
    geo.setAttribute('color',    new THREE.BufferAttribute(curCol,3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sz,1));
    const ptsMat = new THREE.ShaderMaterial({
      vertexShader:`attribute float size;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*(320./-mv.z);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`varying vec3 vColor;void main(){float r=length(2.*gl_PointCoord-1.);if(r>1.)discard;float a=exp(-r*3.)*0.95+exp(-r*1.1)*0.5;gl_FragColor=vec4(vColor*2.1,a*.92);}`,
      blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, vertexColors:true,
    });
    const ptsObj = new THREE.Points(geo, ptsMat);
    // NO rotation on the object — particles only dismantle/reform, never spin
    ptsObj.rotation.set(0,0,0);
    scene.add(ptsObj);

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

    // Scroll listener — ONLY for nebula tint + subtitle fade. Does NOT touch ms.t
    const onScroll = () => {
      const prog = Math.min(1, scrollY / innerHeight);
      nebulaMat.uniforms.uScroll.value = prog * 0.3;
      if (subtitleRef.current)   subtitleRef.current.style.opacity   = Math.max(0, 1 - prog*2.2);
      if (scrollHintRef.current) scrollHintRef.current.style.opacity = Math.max(0, 1 - prog*3.5);
    };
    addEventListener('scroll', onScroll, { passive:true });

    // IntersectionObserver — ONLY thing that triggers morphTo
    // Threshold 0.5: fires reliably after CSS scroll-snap completes
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target === titleSlideRef.current) {
          morphTo(0, 2.0, 0); showSubtitle(); return;
        }
        const idx = probRefs.current.indexOf(entry.target);
        if (idx >= 0) morphTo(idx+1, 2.2, 0.1);
      });
    }, { threshold: 0.5 });

    if (titleSlideRef.current) obs.observe(titleSlideRef.current);
    probRefs.current.forEach(el => el && obs.observe(el));

    // RAF — no rotation on ptsObj, only subtle camera drift
    const clk = new THREE.Clock();
    const loop = () => {
      requestAnimationFrame(loop);
      const t = clk.getElapsedTime();
      nebulaMat.uniforms.uTime.value = t;
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
      <div className="sidebar-right"><div className="sidebar-badge">V.</div><div className="sidebar-label">Swarm</div></div>
      <div className="footer-left">2025</div>
      <div className="footer-right">EDGE AI DRONE PLATFORM</div>
      <div className="title-overlay">
        <div ref={subtitleRef} className="title-subtitle">AUTONOMOUS &nbsp;·&nbsp; EDGE AI &nbsp;·&nbsp; DRONE SURVEILLANCE</div>
        <div ref={scrollHintRef} className="scroll-hint"><span className="scroll-arrow">↓</span> SCROLL TO EXPLORE</div>
      </div>

      <div id="scroll-root">
        <section className="slide title-slide" ref={titleSlideRef} />
        {PROBLEMS.map((p, i) => (
          <section key={i} className="problem-slide" ref={el => probRefs.current[i] = el}>
            <div className="prob-left">
              <div className="prob-particle-zone" />
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
            <div className="prob-right">
              <img src={p.img} alt={p.headline} className="prob-img" />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
