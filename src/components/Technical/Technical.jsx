import React, { useEffect, useRef, useState } from "react";

/**
 * Technical
 * ------------------------------------------------------------------
 * Branching flowchart carrying the site's motion language:
 *
 *  - Title forms from drifting particles (canvas), triggering once on scroll into view.
 *  - A soft aurora/nebula layer drifts continuously behind everything.
 *  - Every reveal (lines, cards, nodes) eases on expo.inOut, slow and weighted.
 *  - The whole diagram carries a barely-there 3D drift (rotateX/Y) so it never feels static.
 *  - Micro-interactions: hover/focus adds a soft glow + opacity shift on siblings.
 *  - prefers-reduced-motion disables the canvas, the drift, and the aurora loop.
 */

const ML_CHILDREN = [
  {
    title: "LEGACY STREAM PULL",
    desc: "Pulls the high-resolution feed from the legacy camera over RTSP / ONVIF — triggered only when Edge Inference confirms a threat.",
  },
  {
    title: "RT-DETR",
    desc: "Real-time object classification on the incoming video feed. Categorizes targets — person, vehicle — in complex environments.",
  },
  {
    title: "YOLOPOSE 3D",
    desc: "Parallel 3D skeletal pose estimation. Flags anomalous movement and behavioral triggers as they happen.",
  },
];

const DASH_CHILDREN = [
  {
    title: "DATA LABELLING",
    desc: "Review interface for edge-triggered events. Operators annotate visual data to continuously refine model accuracy.",
  },
  {
    title: "CCTV MANAGEMENT",
    desc: "Primary command interface. Filters out dormant feeds — surfaces only verified, classified, prioritized alerts.",
  },
];

const MODALITIES = [
  {
    title: "MODALITY 1 — DOPPLER RADAR",
    lines: ["Velocity & Range Vector", "3-Frame Temporal Gating"],
  },
  {
    title: "MODALITY 2 — I2S PDM MIC",
    lines: ["Dynamic Noise Floor Tracker", "Voice & Impact DSP Bands"],
  },
  {
    title: "MODALITY 3 — IR / NIR CAMERA",
    lines: ["Single-Channel 96×96×1", "RT-DETR Distilled FOMO INT8"],
  },
];

const THREAT_CLASSES = [
  "0 — IDLE / CLEAR",
  "1 — RADAR TRIGGERED",
  "2 — ACOUSTIC ALERT",
  "3 — CRITICAL THREAT",
];

const TITLE_LINES = ["CORE", "TECHNOLOGIES"];

function easeInOutExpo(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* Particle-formed title — dissolves in from scattered points into the
   heading, same technique as the hero's morphing canvas text. */
function ParticleTitle({ lines, reduced }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTriggered(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (reduced || !triggered) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;

    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const off = document.createElement("canvas");
    off.width = cssW;
    off.height = cssH;
    const octx = off.getContext("2d");
    octx.fillStyle = "#fff";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    const lineHeight = cssH / lines.length;
    lines.forEach((line, i) => {
      const fontSize = Math.min(cssW / (line.length * 0.6), lineHeight * 0.8);
      octx.font = `900 ${fontSize}px "Arial Black", Arial, sans-serif`;
      octx.fillText(line, cssW / 2, lineHeight * (i + 0.5));
    });

    const imgData = octx.getImageData(0, 0, cssW, cssH).data;
    let gap = 3.6;
    let targets = [];
    const sample = () => {
      targets = [];
      for (let y = 0; y < cssH; y += gap) {
        for (let x = 0; x < cssW; x += gap) {
          const idx = (Math.floor(y) * cssW + Math.floor(x)) * 4;
          if (imgData[idx + 3] > 128) targets.push({ x, y });
        }
      }
    };
    sample();
    while (targets.length > 3600) {
      gap += 0.6;
      sample();
    }

    const particles = targets.map((t) => ({
      x: Math.random() * cssW,
      y: t.y + (Math.random() > 0.5 ? -cssH : cssH) * (0.6 + Math.random() * 0.6),
      tx: t.x,
      ty: t.y,
      hue: 70 + Math.random() * 55,
      sat: 25 + Math.random() * 55,
      light: 55 + Math.random() * 38,
      r: Math.random() * 1.3 + 0.55,
      phase: Math.random() * Math.PI * 2,
    }));

    const duration = 1500;
    const start = performance.now();
    let idleT = 0;
    let rafId;

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const e = easeInOutExpo(t);
      ctx.clearRect(0, 0, cssW, cssH);
      idleT += 0.006;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const x = p.x + (p.tx - p.x) * e;
        const y = p.y + (p.ty - p.y) * e;
        const idle = t >= 1 ? Math.sin(idleT + p.phase) * 1.1 : 0;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${0.5 + e * 0.5})`;
        ctx.shadowColor = "rgba(209,247,52,0.55)";
        ctx.shadowBlur = 4;
        ctx.arc(x, y + idle, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [triggered, reduced, lines]);

  if (reduced) {
    return (
      <h2 className="vs-flow-heading vs-flow-heading--static">
        {lines.map((line) => (
          <span key={line} className="vs-flow-heading-line">
            {line}
          </span>
        ))}
      </h2>
    );
  }

  return (
    <div className="vs-particle-title" ref={wrapRef}>
      <canvas ref={canvasRef} className="vs-particle-canvas" />
    </div>
  );
}

function HBar({ count }) {
  const inset = 100 / (count * 2);
  return <div className="vs-hbar" style={{ left: `${inset}%`, right: `${inset}%` }} />;
}

function VLine({ delay = 0 }) {
  return <div className="vs-vline" style={{ transitionDelay: `${delay}ms` }} />;
}

function Card({ title, desc, lines, delay }) {
  return (
    <div className="vs-card" style={{ transitionDelay: `${delay}ms` }}>
      <div className="vs-card-title">{title}</div>
      {desc && <div className="vs-card-desc">{desc}</div>}
      {lines &&
        lines.map((l) => (
          <div className="vs-card-line" key={l}>
            {l}
          </div>
        ))}
    </div>
  );
}

function EdgeInferenceFlow({ active }) {
  return (
    <div className={`vs-edge-flow${active ? " is-active" : ""}`}>
      <VLine delay={0} />
      <div className="vs-node vs-node--mini" style={{ transitionDelay: "60ms" }}>
        ESP32-S3 SENSORS
        <span className="vs-node-sub">splits into 3 parallel streams</span>
      </div>

      <VLine delay={140} />
      <HBar count={3} />
      <div className="vs-children-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {MODALITIES.map((m, i) => (
          <div className="vs-child-col" key={m.title}>
            <VLine delay={200 + i * 120} />
            <Card title={m.title} lines={m.lines} delay={260 + i * 140} />
          </div>
        ))}
      </div>

      <VLine delay={640} />
      <div className="vs-node vs-node--mini" style={{ transitionDelay: "700ms" }}>
        32-FLOAT FEATURE VECTOR
        <span className="vs-node-sub">radar + audio + nir</span>
      </div>

      <VLine delay={800} />
      <div className="vs-node vs-node--accent" style={{ transitionDelay: "860ms" }}>
        4-CLASS THREAT ENGINE
        <div className="vs-chip-row">
          {THREAT_CLASSES.map((c) => (
            <span className="vs-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChildCards({ children, active }) {
  return (
    <div className={`vs-children-wrap${active ? " is-active" : ""}`}>
      <VLine delay={0} />
      <HBar count={children.length} />
      <div className="vs-children-row" style={{ gridTemplateColumns: `repeat(${children.length}, 1fr)` }}>
        {children.map((c, i) => (
          <div className="vs-child-col" key={c.title}>
            <VLine delay={140 + i * 120} />
            <Card title={c.title} desc={c.desc} delay={200 + i * 140} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Technical() {
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();

  const branches = [
    { id: "edge", index: "01", label: "EDGE INFERENCE" },
    { id: "ml", index: "02", label: "ML MODELS" },
    { id: "dash", index: "03", label: "DASHBOARD" },
  ];

  const handleEnter = (id) => setActive(id);
  const handleLeave = () => setActive(null);
  const handleClick = (id) => setActive((cur) => (cur === id ? null : id));

  return (
    <section className={`vs-flow${reduced ? " vs-flow--reduced" : ""}`}>
      <style>{`
        .vs-flow {
          --ease-expo: cubic-bezier(0.87, 0, 0.13, 1);
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: transparent;
          color: #fff;
          padding: 96px 5vw 120px;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        /* ---------- drifting aurora / nebula layer ---------- */
        .vs-aurora {
          position: absolute;
          inset: -12%;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(38% 30% at 20% 18%, rgba(20,115,13,0.34), transparent 62%),
            radial-gradient(30% 26% at 82% 12%, rgba(64,179,31,0.20), transparent 66%),
            radial-gradient(44% 34% at 55% 88%, rgba(8,46,5,0.55), transparent 70%),
            radial-gradient(25% 20% at 88% 78%, rgba(20,115,13,0.18), transparent 65%);
          filter: blur(60px);
          mix-blend-mode: screen;
          opacity: 0.85;
          animation: vsAuroraDrift 28s var(--ease-expo) infinite alternate;
          will-change: transform;
        }
        @keyframes vsAuroraDrift {
          0%   { transform: translate3d(-2%, -1%, 0) scale(1) rotate(0deg); }
          50%  { transform: translate3d(2.5%, 2%, 0) scale(1.07) rotate(1.4deg); }
          100% { transform: translate3d(-1.5%, 3%, 0) scale(1.02) rotate(-1deg); }
        }

        /* ---------- ambient 3D camera drift on the whole diagram ---------- */
        .vs-scene {
          position: relative;
          z-index: 1;
          perspective: 1600px;
        }
        .vs-drift {
          animation: vsCameraDrift 24s ease-in-out infinite alternate;
          transform-style: preserve-3d;
          will-change: transform;
        }
        @keyframes vsCameraDrift {
          0%   { transform: rotateX(0.5deg) rotateY(-0.7deg) translateZ(0px); }
          50%  { transform: rotateX(-0.45deg) rotateY(0.8deg) translateZ(5px); }
          100% { transform: rotateX(0.35deg) rotateY(-0.55deg) translateZ(-4px); }
        }

        /* ---------- title ---------- */
        .vs-flow-title {
          position: relative;
          z-index: 1;
          text-align: center;
          margin-bottom: 96px;
        }
        .vs-flow-eyebrow {
          display: inline-block;
          font-family: 'Fira Code', monospace;
          font-size: 12px;
          letter-spacing: 0.35em;
          color: rgba(209,247,52,0.85);
          text-transform: uppercase;
          margin-bottom: 18px;
          opacity: 0;
          animation: vsFadeIn 1.2s var(--ease-expo) 1.5s forwards;
        }
        .vs-flow--reduced .vs-flow-eyebrow { opacity: 1; animation: none; }
        @keyframes vsFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .vs-particle-title {
          width: 100%;
          height: clamp(150px, 20vw, 230px);
          max-width: 900px;
          margin: 0 auto;
        }
        .vs-particle-canvas { width: 100%; height: 100%; display: block; }

        .vs-flow-heading {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          font-size: clamp(32px, 5.5vw, 64px);
          line-height: 1.05;
          letter-spacing: 0.02em;
          margin: 0;
          color: #fff;
        }
        .vs-flow-heading-line { display: block; }

        /* ---------- branch layout ---------- */
        .vs-branches {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 1100px;
          margin: 0 auto;
        }
        .vs-branches::before {
          content: '';
          position: absolute;
          top: -40px;
          left: 16.66%;
          right: 16.66%;
          height: 1px;
          background: rgba(255,255,255,0.2);
        }
        .vs-branches::after {
          content: '';
          position: absolute;
          top: -40px;
          left: 50%;
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          transform: translateX(-50%);
        }

        .vs-branch-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 0 16px;
          transition: opacity 0.9s var(--ease-expo);
        }
        .vs-branch-col.is-dimmed { opacity: 0.32; }

        .vs-node {
          position: relative;
          border: 1px solid rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          padding: 18px 22px;
          text-align: center;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.9);
          cursor: pointer;
          user-select: none;
          transition: border-color 0.7s var(--ease-expo), background 0.7s var(--ease-expo), box-shadow 0.7s var(--ease-expo);
          width: 100%;
          box-sizing: border-box;
        }
        .vs-node:focus-visible { outline: 2px solid #D1F734; outline-offset: 3px; }

        .vs-branch-index {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.45);
          margin-bottom: 8px;
        }
        .vs-branch-label {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          letter-spacing: 0.06em;
          color: #fff;
        }

        .vs-node.is-active,
        .vs-branch-col:hover > .vs-node {
          border-color: #D1F734;
          background: rgba(209,247,52,0.08);
          box-shadow: 0 0 30px rgba(209,247,52,0.26);
        }

        .vs-node--mini {
          font-size: 12px;
          padding: 12px 16px;
          max-width: 260px;
          opacity: 0;
          transform: translateY(-12px);
          transition: opacity 0.9s var(--ease-expo), transform 0.9s var(--ease-expo);
          cursor: default;
        }
        .vs-edge-flow.is-active .vs-node--mini { opacity: 1; transform: translateY(0); }
        .vs-node-sub {
          display: block;
          margin-top: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
        }

        .vs-node--accent {
          opacity: 0;
          transform: translateY(-12px);
          transition: opacity 0.9s var(--ease-expo), transform 0.9s var(--ease-expo);
          border-color: rgba(209,247,52,0.4);
          background: rgba(209,247,52,0.05);
          max-width: 320px;
          cursor: default;
        }
        .vs-edge-flow.is-active .vs-node--accent { opacity: 1; transform: translateY(0); }

        .vs-chip-row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 12px; }
        .vs-chip {
          font-family: 'Fira Code', monospace;
          font-size: 9.5px;
          letter-spacing: 0.03em;
          color: #D1F734;
          border: 1px solid rgba(209,247,52,0.35);
          border-radius: 2px;
          padding: 3px 7px;
          white-space: nowrap;
        }

        .vs-vline {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.2);
          margin: 0 auto;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 1.1s var(--ease-expo), background 0.7s var(--ease-expo);
        }
        .vs-edge-flow.is-active .vs-vline,
        .vs-children-wrap.is-active .vs-vline {
          transform: scaleY(1);
          background: rgba(209,247,52,0.4);
        }
        .vs-hbar {
          position: relative;
          height: 1px;
          background: rgba(255,255,255,0.2);
          transform: scaleX(0);
          transition: transform 1.1s var(--ease-expo) 0.12s, background 0.7s var(--ease-expo);
        }
        .vs-children-wrap.is-active .vs-hbar { transform: scaleX(1); background: rgba(209,247,52,0.4); }

        .vs-children-row { display: grid; gap: 18px; width: 100%; }
        .vs-child-col { display: flex; flex-direction: column; align-items: stretch; }

        .vs-card {
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          border-radius: 3px;
          padding: 16px 16px 18px;
          opacity: 0;
          transform: translateY(-12px);
          transition: opacity 0.95s var(--ease-expo), transform 0.95s var(--ease-expo), border-color 0.5s var(--ease-expo);
        }
        .vs-children-wrap.is-active .vs-card,
        .vs-edge-flow.is-active .vs-card {
          opacity: 1;
          transform: translateY(0);
        }
        .vs-card:hover { border-color: rgba(209,247,52,0.5); }

        .vs-card-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          letter-spacing: 0.04em;
          color: #D1F734;
          margin-bottom: 8px;
        }
        .vs-card-desc { font-family: 'Inter', sans-serif; font-size: 12px; line-height: 1.5; color: rgba(255,255,255,0.55); }
        .vs-card-line { font-family: 'Fira Code', monospace; font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 4px; }

        .vs-edge-flow, .vs-children-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; }

        /* ---------- scroll hint ---------- */
        .vs-scroll-hint {
          position: absolute;
          left: 50%;
          bottom: 28px;
          transform: translateX(-50%);
          z-index: 1;
          opacity: 0.55;
        }
        .vs-scroll-hint svg { display: block; animation: vsArrowBounce 1.8s ease-in-out infinite; }
        @keyframes vsArrowBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(7px); opacity: 0.85; }
        }

        /* ---------- reduced motion ---------- */
        .vs-flow--reduced .vs-aurora,
        .vs-flow--reduced .vs-drift,
        .vs-flow--reduced .vs-scroll-hint svg { animation: none; }
        .vs-flow--reduced .vs-vline,
        .vs-flow--reduced .vs-hbar,
        .vs-flow--reduced .vs-node--mini,
        .vs-flow--reduced .vs-node--accent,
        .vs-flow--reduced .vs-card {
          transition: opacity 0.25s linear !important;
          transform: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .vs-aurora, .vs-drift, .vs-scroll-hint svg { animation: none !important; }
          .vs-vline, .vs-hbar, .vs-node--mini, .vs-node--accent, .vs-card {
            transition: opacity 0.25s linear !important;
            transform: none !important;
          }
        }

        @media (max-width: 720px) {
          .vs-branches { flex-direction: column; gap: 56px; }
          .vs-branches::before, .vs-branches::after { display: none; }
          .vs-children-row { grid-template-columns: 1fr !important; }
          .vs-hbar { display: none; }
        }
      `}</style>

      <div className="vs-aurora" />

      <div className="vs-scene">
        <div className="vs-drift">
          <div className="vs-flow-title">
            <span className="vs-flow-eyebrow">System Architecture</span>
            <ParticleTitle lines={TITLE_LINES} reduced={reduced} />
          </div>

          <div className="vs-branches">
            {branches.map((b) => {
              const isActive = active === b.id;
              const isDimmed = active !== null && active !== b.id;
              return (
                <div
                  key={b.id}
                  className={`vs-branch-col${isDimmed ? " is-dimmed" : ""}`}
                  onMouseEnter={() => handleEnter(b.id)}
                  onMouseLeave={handleLeave}
                >
                  <div
                    className={`vs-node${isActive ? " is-active" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isActive}
                    onFocus={() => handleEnter(b.id)}
                    onBlur={handleLeave}
                    onClick={() => handleClick(b.id)}
                  >
                    <span className="vs-branch-index">{b.index}</span>
                    <span className="vs-branch-label">{b.label}</span>
                  </div>

                  {b.id === "edge" && <EdgeInferenceFlow active={isActive} />}
                  {b.id === "ml" && <ChildCards children={ML_CHILDREN} active={isActive} />}
                  {b.id === "dash" && <ChildCards children={DASH_CHILDREN} active={isActive} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="vs-scroll-hint" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v14M5 12l7 7 7-7" stroke="#D1F734" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
