import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import './App.css';
import './AIApp.css';

/* ─── Nebula GLSL ─── */
const NEBULA_VERT = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;
const NEBULA_FRAG = `
precision highp float;varying vec2 vUv;uniform float uTime;uniform vec2 uResolution;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
float fbm(vec2 p){float v=0.,a=.5;mat2 rot=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));for(int i=0;i<6;i++){v+=a*snoise(p);p=rot*p*2.;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/uResolution;float aspect=uResolution.x/uResolution.y;vec2 p=(uv-.5)*vec2(aspect,1.);float t=uTime*.25;float n1=fbm(p*1.4+vec2(t*.2,t*.1));float n2=fbm(p*2.2+vec2(-t*.15,t*.18)+n1*.5);float n3=fbm(p*3.8+vec2(t*.12,-t*.2)+n2*.35);float aurora=smoothstep(.15,.65,n1*.5+.5);aurora+=smoothstep(.2,.75,n2*.5+.5)*.45;aurora+=smoothstep(.3,.85,n3*.5+.5)*.2;aurora=pow(aurora*.35,2.2);vec3 col1=vec3(.005,.02,.005);vec3 col2=vec3(.03,.18,.02);vec3 col3=vec3(.08,.45,.05);vec3 col4=vec3(.25,.7,.12);vec3 color=mix(col1,col2,aurora);color=mix(color,col3,smoothstep(.15,.5,aurora));color=mix(color,col4,smoothstep(.4,.9,aurora));float dist=length(p);color+=vec3(.02,.12,.01)*exp(-dist*2.8)*.15;color*=1.-smoothstep(.2,.95,dist);color*=.85;gl_FragColor=vec4(color,1.);}
`;

/* ═══════════════════════════════
   CONTENT
═══════════════════════════════ */
const EDGE_STAGES = [
  { id:'e1', title:'Camera Feed',         body:'Existing camera hardware, nothing changes. Streams continuously via RTSP or ONVIF. The edge sensor kit mounts alongside and taps this feed without any hardware swap.' },
  { id:'e2', title:'Doppler Radar',       body:'Low-power microwave sensor stays near-dormant at under 50mW. The moment it detects a moving mass — person, vehicle, or animal — it wakes the next stage. Lets the system sleep 90%+ of the time.' },
  { id:'e3', title:'IR Thermal Array',    body:'Once motion is confirmed, checks whether the object has a living or vehicle-like heat signature. Separates a real intruder from a plastic bag blowing across the frame — motion alone is not enough.' },
  { id:'e4', title:'Optical Differencing',body:'ESP32-S3 grabs low-res frames and compares pixel changes on-chip. Filters out wind-blown leaves, shifting shadows, and thermal drift — all locally, before anything expensive gets triggered.' },
  { id:'e5', title:'Trigger Event',       body:'Only when all three sensors agree — movement, heat, and real visual change — does the edge node fire a signal to the server. This is the only data that ever crosses from the camera side.' },
];

const SERVER_STAGES = [
  { id:'s1', title:'Stream Pulled',        body:'On trigger arrival, server reaches back to the camera and pulls the full high-res stream via RTSP/ONVIF. Nothing was streaming before this — server was idle. Bandwidth stays at zero until a confirmed event fires.' },
  { id:'s2', title:'RT-DETR-L',            body:'Classifies exactly what triggered the alert — person, vehicle, pushcart, or animal — at around 45fps. Built for dense Indian street scenes, avoiding the misclassifications generic Western-trained models make here.' },
  { id:'s3', title:'YOLOv8n-Pose',         body:'Extracts a 17-point skeleton from any detected person and watches body movement at 80fps. Catches anomalous physical behavior — climbing, crouching, abnormal gait — not just the presence of a person.' },
  { id:'s4', title:'ResNet50 Re-ID',       body:'Generates a unique vector fingerprint per detected person or vehicle. When they move between cameras the system recognises the same target rather than treating it as a new event — enabling full perimeter tracing.' },
  { id:'s5', title:'Operator Dashboard',   body:'A single verified alert lands here — with classification, movement data, and cross-camera tracking already done — shown to a human for the final call. Operators see only the moments the system has already decided matter.' },
];

const HANDOFF = {
  title: 'Handoff',
  body: 'Fires only when Doppler motion + IR heat + optical change all agree. The single crossing point — nothing else leaves the edge unless all three sensors confirm together.',
};

/* ═══════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════ */
function FlowBox({ title, body, variant, delay, animate }) {
  return (
    <div
      className={`flow-box flow-box--${variant} ${animate ? 'flow-box--visible' : ''}`}
      style={{ transitionDelay: animate ? `${delay}ms` : '0ms' }}
    >
      <span className="flow-box-title">{title}</span>
      <div className="flow-box-divider" />
      <p className="flow-box-body">{body}</p>
    </div>
  );
}

function Arrow({ variant, animate, delay }) {
  return (
    <div
      className={`flow-arrow flow-arrow--${variant} ${animate ? 'flow-arrow--visible' : ''}`}
      style={{ transitionDelay: animate ? `${delay + 60}ms` : '0ms' }}
    >
      <div className="flow-arrow-line" />
      <div className="flow-arrow-head" />
    </div>
  );
}

function HandoffNode({ animate, delay }) {
  return (
    <div className="handoff-wrap">
      <div
        className={`handoff-node ${animate ? 'handoff-node--visible' : ''}`}
        style={{ transitionDelay: animate ? `${delay}ms` : '0ms' }}
      >
        <span className="handoff-title">{HANDOFF.title.toUpperCase()}</span>
        <div className="flow-box-divider handoff-divider" />
        <p className="handoff-body">{HANDOFF.body}</p>
      </div>
      <div
        className={`handoff-vline ${animate ? 'handoff-vline--visible' : ''}`}
        style={{ transitionDelay: animate ? `${delay + 100}ms` : '0ms' }}
      />
    </div>
  );
}

/* ═══════════════════════════════
   MAIN
═══════════════════════════════ */
export default function AIApp() {
  const canvasRef     = useRef(null);
  const flowSectionRef = useRef(null);
  const titleRef       = useRef(null);
  const scrollHintRef  = useRef(null);
  const [edgeAnimate,   setEdgeAnimate]   = useState(false);
  const [serverAnimate, setServerAnimate] = useState(false);

  /* ── Three.js setup ── */
  useEffect(() => {
    const W = innerWidth, H = innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.autoClear = false;

    const nebulaScene = new THREE.Scene();
    const nebulaCam   = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const nebulaGeo   = new THREE.PlaneGeometry(2,2);
    const nebulaMat   = new THREE.ShaderMaterial({
      uniforms: { uTime:{value:0}, uResolution:{value:new THREE.Vector2(W,H)} },
      vertexShader: NEBULA_VERT, fragmentShader: NEBULA_FRAG,
      depthTest:false, depthWrite:false,
    });
    nebulaScene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

    const N=18000, pos=new Float32Array(N*3), col=new Float32Array(N*3), sz=new Float32Array(N), vel=new Float32Array(N*3);
    const c=new THREE.Color();
    for(let i=0;i<N;i++){
      const i3=i*3;
      pos[i3]=(Math.random()-.5)*1400; pos[i3+1]=(Math.random()-.5)*700; pos[i3+2]=(Math.random()-.5)*1200;
      vel[i3]=(Math.random()-.5)*.06; vel[i3+1]=(Math.random()-.5)*.05;
      const bright=Math.random()>.8;
      if(bright){c.setHSL(.26+Math.random()*.08,1,.65+Math.random()*.3);sz[i]=2+Math.random()*3;}
      else{c.setHSL(.30+Math.random()*.10,.7,.2+Math.random()*.15);sz[i]=.5+Math.random();}
      col[i3]=c.r;col[i3+1]=c.g;col[i3+2]=c.b;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',   new THREE.BufferAttribute(col,3));
    geo.setAttribute('size',    new THREE.BufferAttribute(sz,1));
    const ptsMat=new THREE.ShaderMaterial({
      vertexShader:`attribute float size;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*(300./-mv.z);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`varying vec3 vColor;void main(){float r=length(2.*gl_PointCoord-1.);if(r>1.)discard;float a=exp(-r*3.)*.95+exp(-r*1.1)*.5;gl_FragColor=vec4(vColor*2.1,a*.9);}`,
      blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,vertexColors:true,
    });
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(60,W/H,.1,2000);
    camera.position.set(0,0,480);
    scene.add(new THREE.Points(geo,ptsMat));

    let rafId;
    const clk=new THREE.Clock();
    const loop=()=>{
      rafId=requestAnimationFrame(loop);
      const t=clk.getElapsedTime();
      nebulaMat.uniforms.uTime.value=t;
      camera.position.y=Math.sin(t*.18)*6; camera.position.x=Math.sin(t*.11)*3;
      camera.lookAt(0,0,0);
      for(let i=0;i<N;i++){
        const i3=i*3; pos[i3]+=vel[i3]; pos[i3+1]+=vel[i3+1];
        if(pos[i3]>700)pos[i3]=-700; if(pos[i3]<-700)pos[i3]=700;
        if(pos[i3+1]>350)pos[i3+1]=-350; if(pos[i3+1]<-350)pos[i3+1]=350;
      }
      geo.attributes.position.needsUpdate=true;
      renderer.clear();
      renderer.render(nebulaScene,nebulaCam);
      renderer.render(scene,camera);
    };
    loop();

    const onR=()=>{
      const w=innerWidth,h=innerHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h); nebulaMat.uniforms.uResolution.value.set(w,h);
    };
    addEventListener('resize',onR);
    return()=>{cancelAnimationFrame(rafId);removeEventListener('resize',onR);renderer.dispose();geo.dispose();ptsMat.dispose();nebulaGeo.dispose();nebulaMat.dispose();};
  }, []);

  /* ── Landing title fade-in ── */
  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.4, delay: 0.6, ease: 'power3.out' }
      );
    }
    if (scrollHintRef.current) {
      gsap.fromTo(scrollHintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.0, delay: 1.8, ease: 'power2.out' }
      );
    }
  }, []);

  /* ── Scroll trigger on the fixed scroll container ── */
  useEffect(() => {
    let fired = false;
    const container = document.getElementById('ai-scroll-root');
    if (!container) return;
    const onScroll = () => {
      if (fired) return;
      if (container.scrollTop > window.innerHeight * 0.2) {
        fired = true;
        setEdgeAnimate(true);
        setTimeout(() => setServerAnimate(true), 900);
        container.removeEventListener('scroll', onScroll);
      }
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas" />

      {/* Scroll root */}
      <div id="ai-scroll-root">

        {/* ── SLIDE 1: Landing ── */}
        <section className="ai-landing-slide">
          <div ref={titleRef} className="ai-landing-content">
            <div className="ai-landing-tag">VAAYU SWARM</div>
            <h1 className="ai-landing-headline">System Architecture</h1>
            <p className="ai-landing-sub">
              CAMERA · EDGE &nbsp;→&nbsp; SERVER · CLOUD
            </p>
          </div>
          <div ref={scrollHintRef} className="ai-scroll-hint">
            <span className="ai-scroll-arrow">↓</span>
            SCROLL TO EXPLORE
          </div>
        </section>

        {/* ── SLIDE 2: Flow Diagram ── */}
        <section className="ai-flow-slide" ref={flowSectionRef}>

          {/* Header */}
          <div className="ai-flow-header">
            <span className="ai-tag">ARCHITECTURE PIPELINE</span>
            <div className="ai-header-right">
              <span className="ai-dot ai-dot--edge" /> EDGE &nbsp;
              <span className="ai-dot ai-dot--server" /> SERVER
            </div>
          </div>

          {/* Row 1 — Edge */}
          <div className="flow-row-wrap">
            <div className="flow-row-label">CAMERA · EDGE DEVICE</div>
            <div className="flow-row">
              {EDGE_STAGES.map((s, i) => (
                <div key={s.id} className="flow-cell">
                  <FlowBox title={s.title} body={s.body} variant="edge" delay={i * 130} animate={edgeAnimate} />
                  {i < EDGE_STAGES.length - 1 && <Arrow variant="edge" animate={edgeAnimate} delay={i * 130 + 80} />}
                  {i === EDGE_STAGES.length - 1  && <Arrow variant="edge" animate={edgeAnimate} delay={i * 130 + 80} />}
                </div>
              ))}
              <HandoffNode animate={edgeAnimate} delay={EDGE_STAGES.length * 130 + 60} />
            </div>
          </div>

          {/* Row 2 — Server */}
          <div className="flow-row-wrap flow-row-wrap--server">
            <div className="flow-row-label">SERVER · CLOUD PROCESSING</div>
            <div className="flow-row">
              {SERVER_STAGES.map((s, i) => (
                <div key={s.id} className="flow-cell">
                  <FlowBox title={s.title} body={s.body} variant="server" delay={i * 130} animate={serverAnimate} />
                  {i < SERVER_STAGES.length - 1 && <Arrow variant="server" animate={serverAnimate} delay={i * 130 + 80} />}
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>
    </>
  );
}
