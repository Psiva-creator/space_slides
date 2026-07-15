import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AIModel.css';

gsap.registerPlugin(ScrollTrigger);

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

export default function AIModel() {
  const flowSectionRef = useRef(null);
  const titleRef       = useRef(null);
  const scrollHintRef  = useRef(null);
  const [edgeAnimate,   setEdgeAnimate]   = useState(false);
  const [serverAnimate, setServerAnimate] = useState(false);

  // Title slide animations using GSAP
  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 24 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.4, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
    if (scrollHintRef.current) {
      gsap.fromTo(scrollHintRef.current,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: 1.0, 
          delay: 0.8, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: scrollHintRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }, []);

  // Scroll Trigger to animate the flow boxes
  useEffect(() => {
    if (!flowSectionRef.current) return;
    const trigger = ScrollTrigger.create({
      trigger: flowSectionRef.current,
      start: 'top 60%',
      onEnter: () => {
        setEdgeAnimate(true);
        setTimeout(() => setServerAnimate(true), 900);
      },
      onEnterBack: () => {
        setEdgeAnimate(true);
        setServerAnimate(true);
      }
    });
    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div className="ai-model-wrapper">
      {/* ── SLIDE 1: Landing ── */}
      <section className="ai-landing-slide slide">
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
      <section className="ai-flow-slide slide" ref={flowSectionRef}>
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
  );
}
