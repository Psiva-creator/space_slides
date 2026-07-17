import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data from Vaayu Technical Report v2.2 ─────────────────────── */
const STAGES = [
  {
    id: '01',
    step: 'DISTILL',
    label: 'Stage 1 — Supervised Warm-up',
    title: 'Teacher → Student Distillation',
    body: 'RT-DETR-L (server-side) generates soft Gaussian heatmaps centered on bounding-box centroids (σ=0.8). The FOMO student (97K params) learns spatial uncertainty via MSE loss — never hard binary labels.',
    color: '#a78bfa',
    metrics: [
      { k: 'Teacher Model', v: 'RT-DETR-L' },
      { k: 'Confidence Filter', v: '≥ 0.60' },
      { k: 'Loss', v: 'MSE (soft Gaussian)' },
      { k: 'Epochs', v: '8 (default)' },
    ],
    reward: null,
  },
  {
    id: '02',
    step: 'REINFORCE',
    label: 'Stage 2 — RLAIF Policy Gradient',
    title: 'Reward-Shaped RL Fine-tuning',
    body: 'A REINFORCE agent treats the FOMO model as an Actor producing stochastic 0/1 detection actions. Reward shaping heavily penalises false positives to minimise alert fatigue in real deployments.',
    color: '#f472b6',
    metrics: null,
    reward: [
      { event: 'True Positive  (TP)', val: '+1.5', good: true },
      { event: 'False Positive (FP)', val: '−1.2', good: false },
      { event: 'False Negative (FN)', val: '−0.8', good: false },
      { event: 'True Negative  (TN)', val: '+0.1', good: true },
    ],
  },
  {
    id: '03',
    step: 'QUANTISE',
    label: 'Stage 3 — Deployment Export',
    title: 'INT8 Quantization & OTA Push',
    body: 'The fine-tuned model is quantised to INT8 (TFLite Micro) using a representative calibration dataset. The 19 KB binary is hot-reloaded into LittleFS on the ESP32-S3 without a device reboot.',
    color: '#4dff8a',
    metrics: [
      { k: 'Format', v: 'TFLite INT8 / ONNX / ESP-DL' },
      { k: 'Model Size', v: '19 KB' },
      { k: 'Arena', v: '512 KB PSRAM' },
      { k: 'OTA', v: 'Hot-reload via LittleFS' },
    ],
    reward: null,
  },
  {
    id: '04',
    step: 'HARVEST',
    label: 'Stage 4 — Active Learning Loop',
    title: 'Edge Harvest → Retrain Cycle',
    body: 'Uncertain frames (entropy + margin scoring) are uploaded via POST /harvest. Human reviewers annotate in Label Studio; COCO exports retrain FOMO and the improved model is OTA-pushed — closing the loop.',
    color: '#38bdf8',
    metrics: [
      { k: 'Scoring', v: 'Entropy + Margin + Embedding' },
      { k: 'Storage', v: 'SQLite uncertainty queue' },
      { k: 'Annotation', v: 'Label Studio (COCO/YOLO)' },
      { k: 'Trigger', v: 'Grey-zone gating (conf ≥ 0.15)' },
    ],
    reward: null,
  },
];

const PERF = [
  { label: 'Cell Accuracy', value: 99.04, unit: '%', color: '#a78bfa' },
  { label: 'Cell F1-Score', value: 89.54, unit: '%', color: '#f472b6' },
  { label: 'Model Size (INT8)', value: 19, unit: 'KB', color: '#4dff8a' },
  { label: 'Inference Time', value: 62, unit: 'ms', color: '#38bdf8' },
];

function RadialBar({ value, max, color, size = 88 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 1.2s ease' }}
      />
    </svg>
  );
}

export default function RLHF() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.rlhf-card'),
        { opacity: 0, y: 48 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.13, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo(el.querySelector('.rlhf-heading'), { opacity: 0, y: 22 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' },
      });
      gsap.fromTo(el.querySelectorAll('.rlhf-perf'),
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play none none none' },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const s = STAGES[active];

  return (
    <section
      className="slide"
      ref={sectionRef}
      data-section="true"
      data-label="RLAIF"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', height: '100vh' }}
    >
      <div className="slide-inner" style={{ padding: '0 6vw', flexDirection: 'column', gap: 32, justifyContent: 'center' }}>

        {/* ── Heading ── */}
        <div className="rlhf-heading" style={{ opacity: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#a78bfa', marginBottom: 12 }}>
            ML TRAINING PIPELINE
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            RLAIF Pipeline
          </h2>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 10, fontWeight: 400 }}>
            Reinforcement Learning from AI Feedback — distillation warm-up then reward-shaped policy gradient
          </div>
        </div>

        {/* ── Main layout: Stage selector + Detail panel ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, width: '100%', maxWidth: 1100, alignSelf: 'center', alignItems: 'stretch' }}>

          {/* LEFT: Stage tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STAGES.map((st, i) => (
              <button
                key={i}
                className="rlhf-card"
                onClick={() => setActive(i)}
                style={{
                  opacity: 0,
                  background: active === i ? `rgba(${st.color === '#a78bfa' ? '167,139,250' : st.color === '#f472b6' ? '244,114,182' : st.color === '#4dff8a' ? '77,255,138' : '56,189,248'},0.12)` : 'rgba(8,4,20,0.7)',
                  border: `1px solid ${active === i ? st.color : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  boxShadow: active === i ? `0 0 20px ${st.color}22` : 'none',
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', color: st.color, marginBottom: 6 }}>
                  {st.id} — {st.step}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: active === i ? '#fff' : 'rgba(255,255,255,0.65)', letterSpacing: '-0.01em' }}>
                  {st.title}
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT: Detail panel */}
          <div style={{
            background: 'rgba(8,4,20,0.85)',
            border: `1px solid ${s.color}33`,
            borderRadius: 16,
            padding: '28px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxShadow: `0 0 40px ${s.color}18`,
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* accent line */}
            <div style={{ position: 'absolute', left: 0, top: '12%', height: '76%', width: 2, borderRadius: 2, background: `linear-gradient(to bottom, transparent, ${s.color}, transparent)` }} />

            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: s.color }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>{s.body}</div>

            {/* Metrics grid */}
            {s.metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                {s.metrics.map((m, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>{m.k}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{m.v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Reward table */}
            {s.reward && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Reward Shaping</div>
                {s.reward.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: r.good ? 'rgba(77,255,138,0.06)' : 'rgba(255,107,107,0.06)', border: `1px solid ${r.good ? 'rgba(77,255,138,0.15)' : 'rgba(255,107,107,0.15)'}`, borderRadius: 8, padding: '9px 14px' }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{r.event}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: r.good ? '#4dff8a' : '#ff6b6b', letterSpacing: '-0.01em' }}>{r.val}</div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: 'monospace' }}>
                  loss = −log_prob × advantage + entropy_reg
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Performance bar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '100%', maxWidth: 1100, alignSelf: 'center' }}>
          {PERF.map((p, i) => (
            <div key={i} className="rlhf-perf" style={{ opacity: 0, background: 'rgba(10,6,26,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <RadialBar value={p.value} max={p.unit === '%' ? 100 : p.unit === 'KB' ? 100 : 200} color={p.color} size={72} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: p.color }}>
                  {p.value}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{p.value}<span style={{ fontSize: 11, fontWeight: 500, color: p.color, marginLeft: 2 }}>{p.unit}</span></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
