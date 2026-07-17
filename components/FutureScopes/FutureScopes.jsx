import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data from Vaayu Technical Report v2.2 ─────────────────────── */
const HW_ROADMAP = [
  {
    phase: 'V1 · Current',
    chip: 'ESP32-S3',
    color: '#4dff8a',
    specs: '97K FOMO model · 16+ FPS · $15–25/node',
    detail: 'Production demo hardware. Multi-modal fusion (Radar + Audio + NIR + Vision) running fully at the edge.',
    active: true,
  },
  {
    phase: 'V2 · 2027',
    chip: 'Netrasemi NETRA A2000',
    color: '#38bdf8',
    specs: '8 TOPS NPU · Multi-model concurrent · 12nm TSMC',
    detail: 'Indian silicon upgrade. Graph Stream Architecture enables running vision + audio models simultaneously.',
    active: false,
  },
  {
    phase: 'V3 · 2028–29',
    chip: 'NETRA A4000',
    color: '#a78bfa',
    specs: '100 TOPS · Die-to-die interconnect · Server-grade edge',
    detail: 'Server-class inference at the edge. Enables real-time multi-scene video analytics at border posts.',
    active: false,
  },
  {
    phase: 'V4 · 2030+',
    chip: 'RISC-V Custom SoC',
    color: '#f472b6',
    specs: 'InCore-generated · Vaayu-specific workload · Custom ISA',
    detail: 'Fully indigenous silicon. YAML-to-silicon pipeline (InCore) generates a custom SoC optimised for Vaayu\'s exact sensor-fusion workload.',
    active: false,
  },
];

const SW_ROADMAP = [
  { feature: 'Federated Learning', timeline: 'Q3 2026', impact: 'Edge nodes improve shared model without sharing raw data', color: '#4dff8a', icon: '🔗' },
  { feature: 'LLM Integration', timeline: 'Q4 2026', impact: 'Natural language threat description from detection metadata', color: '#38bdf8', icon: '🧠' },
  { feature: 'Drone Integration', timeline: 'Q1 2027', impact: 'Autonomous drone dispatch on multi-modal threat detection', color: '#a78bfa', icon: '🚁' },
  { feature: 'Smart City API', timeline: 'Q2 2027', impact: 'CIBMS + police command centre integration', color: '#f97316', icon: '🏙️' },
  { feature: 'V2X Communication', timeline: '2028', impact: 'Vehicle-to-everything for border patrol coordination', color: '#f472b6', icon: '🚗' },
  { feature: '5G Edge Node', timeline: '2028', impact: 'Ultra-low-latency cloud offload via 5G', color: '#fbbf24', icon: '📶' },
];

const RESEARCH = [
  { title: 'Neuromorphic Computing', icon: '⚡', desc: 'Spiking neural networks for ultra-low-power edge inference — event-driven processing matching biological efficiency.' },
  { title: 'Quantum-Resistant Crypto', icon: '🔐', desc: 'PQC algorithms (already started: pqc_crypto.py) for long-term security against quantum computing threats.' },
  { title: 'Satellite Integration', icon: '🛰️', desc: 'Direct satellite uplink for truly remote border areas — no ground infrastructure required.' },
  { title: 'Digital Twin Border', icon: '🌐', desc: 'Real-time 3D border model with live sensor data overlay — full situational awareness dashboard.' },
];

const MARKETS = [
  { vertical: 'Defense', use: 'Border surveillance & FOBs', market: '$2.4B', color: '#ff6b6b', icon: '🛡️' },
  { vertical: 'Smart Cities', use: 'Public safety & traffic', market: '₹1.44T', color: '#38bdf8', icon: '🏙️' },
  { vertical: 'Industrial', use: 'Perimeter security', market: '$500M+', color: '#f97316', icon: '🏭' },
  { vertical: 'Agriculture', use: 'Crop & livestock monitoring', market: '$30B+', color: '#4dff8a', icon: '🌾' },
  { vertical: 'Coastal', use: 'Vessel tracking', market: '$200M+', color: '#a78bfa', icon: '⚓' },
  { vertical: 'Wildlife', use: 'Poaching prevention', market: '$100M+', color: '#fbbf24', icon: '🐘' },
];

export default function FutureScopes() {
  const sectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState('hw');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelector('.fs-heading'), { opacity: 0, y: 22 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' },
      });
      gsap.fromTo(el.querySelectorAll('.fs-anim'),
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="slide"
      ref={sectionRef}
      data-section="true"
      data-label="Future"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', height: '100vh' }}
    >
      <div className="slide-inner" style={{ padding: '0 6vw', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>

        {/* ── Heading ── */}
        <div className="fs-heading" style={{ opacity: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#38bdf8', marginBottom: 12 }}>
            WHAT'S NEXT
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            Future Roadmap
          </h2>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, alignSelf: 'center' }}>
          {[
            { id: 'hw', label: '⚙️  Hardware Evolution' },
            { id: 'sw', label: '💻  Software Roadmap' },
            { id: 'market', label: '📊  Market Expansion' },
            { id: 'research', label: '🔬  Research Directions' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 100,
                padding: '8px 16px',
                color: activeTab === tab.id ? '#38bdf8' : 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── Hardware Evolution ── */}
        {activeTab === 'hw' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
            {HW_ROADMAP.map((h, i) => (
              <div key={i} className="fs-anim" style={{
                opacity: 0,
                background: h.active ? `rgba(4,16,10,0.95)` : 'rgba(6,6,14,0.85)',
                border: `1px solid ${h.color}${h.active ? '50' : '20'}`,
                borderRadius: 14,
                padding: '20px 18px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: h.active ? `0 0 30px ${h.color}15` : 'none',
              }}>
                {h.active && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: '#4dff8a', borderRadius: 100, padding: '2px 8px', fontSize: 8, fontWeight: 800, color: '#000', letterSpacing: '0.1em' }}>LIVE</div>
                )}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${h.color}, transparent)` }} />
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: h.color, marginBottom: 8, textTransform: 'uppercase' }}>{h.phase}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>{h.chip}</div>
                <div style={{ fontSize: 10, color: h.color, fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{h.specs}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{h.detail}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Software Roadmap ── */}
        {activeTab === 'sw' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
            {SW_ROADMAP.map((r, i) => (
              <div key={i} className="fs-anim" style={{
                opacity: 0,
                background: 'rgba(4,6,14,0.9)',
                border: `1px solid ${r.color}22`,
                borderRadius: 14,
                padding: '18px 18px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}>
                <div style={{ fontSize: 26, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: r.color, textTransform: 'uppercase', marginBottom: 4 }}>{r.timeline}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>{r.feature}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{r.impact}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Market Expansion ── */}
        {activeTab === 'market' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
            {MARKETS.map((m, i) => (
              <div key={i} className="fs-anim" style={{
                opacity: 0,
                background: 'rgba(4,6,14,0.9)',
                border: `1px solid ${m.color}22`,
                borderRadius: 14,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{ fontSize: 30 }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: m.color, textTransform: 'uppercase', marginBottom: 4 }}>{m.vertical}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{m.use}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color, textAlign: 'right', flexShrink: 0 }}>{m.market}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Research Directions ── */}
        {activeTab === 'research' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%', maxWidth: 900, alignSelf: 'center' }}>
            {RESEARCH.map((r, i) => (
              <div key={i} className="fs-anim" style={{
                opacity: 0,
                background: 'rgba(4,6,14,0.9)',
                border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 14,
                padding: '24px 22px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
