import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data from Vaayu Technical Report v2.2 — Section 16 ─────────── */
const CATEGORIES = [
  {
    id: 'market',
    label: '📈 Market Research',
    color: '#38bdf8',
    refs: [
      { num: 1, title: 'Mordor Intelligence — India CCTV Market Report', detail: '2026–2031 · USD 4.8B → $14.25B @ 19.88% CAGR', url: '#' },
      { num: 2, title: 'Mordor Intelligence — India Video Surveillance', detail: '2026–2031 · USD 4.40B → $7.77B @ 9.94% CAGR', url: '#' },
      { num: 3, title: '6Wresearch — India AI Edge Computing Market', detail: '2025–2031 · Comprehensive market analysis', url: '#' },
      { num: 4, title: 'MarketsandMarkets — Edge Computing Report', detail: '2026–2031 · USD 111.34B → $317.39B @ 23.3% CAGR', url: '#' },
    ],
  },
  {
    id: 'industry',
    label: '🏭 Industry & Companies',
    color: '#4dff8a',
    refs: [
      { num: 5, title: 'EE Times — Indian Startup Builds Full-Stack Edge AI Chips', detail: 'Netrasemi profile · $14.5M raised · NETRA A2000 (8 TOPS)', url: '#' },
      { num: 6, title: 'InCore Semiconductors — RISC-V SoC Design Automation', detail: 'Chennai · YAML-to-silicon · < 14 days convergence', url: '#' },
      { num: 7, title: 'Axiro Semiconductor — India Fabless Semiconductor Revolution', detail: 'Indian chip ecosystem analysis', url: '#' },
      { num: 8, title: 'Blue D Air Control — AI Chips in India (15+ companies)', detail: 'Comprehensive Indian AI chip landscape', url: '#' },
    ],
  },
  {
    id: 'policy',
    label: '⚖️ Policy & Legal',
    color: '#f97316',
    refs: [
      { num: 9,  title: 'MHA — CIBMS and Smart Border Management Programme', detail: 'Ministry of Home Affairs · Comprehensive Integrated Border Management', url: '#' },
      { num: 10, title: 'NITI Aayog — Border Area Economic Contribution Report', detail: '22% GDP contribution from border regions', url: '#' },
      { num: 11, title: 'Oxford Human Rights Hub — AI, Surveillance & Privacy in India', detail: '2024 · Privacy-by-design analysis', url: '#' },
      { num: 12, title: 'DPDPA 2023 — Section 17 National Interest Exemption', detail: 'Digital Personal Data Protection Act · Architectural compliance', url: '#' },
      { num: 13, title: 'KS Puttaswamy v Union of India (2017)', detail: 'Right to Privacy as Fundamental Right · Constitutional basis', url: '#' },
    ],
  },
  {
    id: 'tech',
    label: '🔬 Technical References',
    color: '#a78bfa',
    refs: [
      { num: 14, title: 'Edge Impulse — FOMO (Faster Objects, More Objects)', detail: 'Microcontroller-class object detection · Heatmap output', url: '#' },
      { num: 15, title: 'TensorFlow Lite Micro — ESP32-S3 Deployment Guide', detail: 'INT8 quantization · 512 KB arena · PIE SIMD acceleration', url: '#' },
      { num: 16, title: 'Ultralytics — RT-DETR-L and YOLOv8n-pose Architecture', detail: 'Server-side inference · Teacher model for distillation', url: '#' },
      { num: 17, title: 'HLK-LD2410 — 24 GHz Radar Module Datasheet', detail: 'FMCW · Range + velocity + energy gates', url: '#' },
      { num: 18, title: 'LLVIP Dataset — Visible-Infrared Pedestrian Detection', detail: 'Low-light multi-spectral training data', url: '#' },
      { num: 19, title: 'KAIST Multi-Spectral Pedestrian Detection Benchmark', detail: 'Color-Thermal pairs · Multi-modal training', url: '#' },
    ],
  },
  {
    id: 'gov',
    label: '🏛️ Government Programs',
    color: '#fbbf24',
    refs: [
      { num: 20, title: 'Semiconductor Mission — $10 Billion Incentive Program', detail: 'Government of India · Semiconductor manufacturing incentives', url: '#' },
      { num: 21, title: 'PLI Scheme — ₹76,000 Crore for Chip Manufacturing', detail: 'Production-Linked Incentive · Full semiconductor stack', url: '#' },
      { num: 22, title: 'DLI Program — Design Linked Incentive', detail: 'Chip startups · Design subsidy scheme', url: '#' },
      { num: 23, title: 'C2S Scheme — Chips to Startup', detail: 'Academia-industry collaboration · IIT + chip ecosystem', url: '#' },
      { num: 24, title: 'Smart Cities Mission — 76,000 Cameras in 100 Cities', detail: '₹98,000 crore · India smart city infrastructure', url: '#' },
    ],
  },
];

const MARKET_STATS = [
  { label: 'India CCTV 2031', value: '$14.25B', sub: '19.88% CAGR', color: '#38bdf8' },
  { label: 'Global Edge Computing', value: '$317B', sub: '23.3% CAGR by 2031', color: '#4dff8a' },
  { label: 'Smart City Cameras', value: '76,000', sub: 'Installed across India', color: '#a78bfa' },
  { label: 'Smart Cities Value', value: '₹1.44T', sub: 'Mission project value', color: '#f97316' },
  { label: 'Border Budget', value: '$2.4B', sub: 'Annual infrastructure', color: '#ff6b6b' },
  { label: 'AI Camera CAGR', value: '20.55%', sub: 'India market growth', color: '#fbbf24' },
];

export default function References() {
  const sectionRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('market');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelector('.ref-heading'), { opacity: 0, y: 22 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' },
      });
      gsap.fromTo(el.querySelectorAll('.stat-chip'),
        { opacity: 0, scale: 0.85 },
        {
          opacity: 1, scale: 1, duration: 0.7, stagger: 0.07, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const cat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <section
      className="slide"
      ref={sectionRef}
      data-section="true"
      data-label="References"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', height: '100vh' }}
    >
      <div className="slide-inner" style={{ padding: '0 6vw', flexDirection: 'column', gap: 22, justifyContent: 'center' }}>

        {/* ── Heading ── */}
        <div className="ref-heading" style={{ opacity: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#38bdf8', marginBottom: 12 }}>
            SECTION 16
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            Research References
          </h2>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 10 }}>
            Vaayu Technical Report v2.2 · July 2026 · 24 citations across 5 domains
          </div>
        </div>

        {/* ── Market Stats bar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
          {MARKET_STATS.map((s, i) => (
            <div key={i} className="stat-chip" style={{
              opacity: 0,
              background: 'rgba(4,8,16,0.9)',
              border: `1px solid ${s.color}25`,
              borderRadius: 12,
              padding: '14px 12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#fff', marginTop: 4, letterSpacing: '-0.01em' }}>{s.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '0.04em' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Category tabs ── */}
        <div style={{ display: 'flex', gap: 8, alignSelf: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                background: activeCategory === c.id ? `rgba(56,189,248,0.1)` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeCategory === c.id ? c.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 100,
                padding: '7px 14px',
                color: activeCategory === c.id ? c.color : 'rgba(255,255,255,0.45)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >{c.label}</button>
          ))}
        </div>

        {/* ── Reference list ── */}
        <div style={{ width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
          <div style={{
            background: 'rgba(4,6,14,0.9)',
            border: `1px solid ${cat.color}20`,
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* header */}
            <div style={{ padding: '14px 22px', borderBottom: `1px solid ${cat.color}20`, background: `${cat.color}08` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: cat.color, textTransform: 'uppercase' }}>{cat.label}</div>
            </div>
            {/* rows */}
            {cat.refs.map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '14px 22px',
                  borderBottom: i < cat.refs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${cat.color}15`,
                  border: `1px solid ${cat.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                  color: cat.color,
                }}>{r.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.4 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{r.detail}</div>
                </div>
                <div style={{ flexShrink: 0, fontSize: 10, color: cat.color, opacity: 0.6, paddingTop: 4 }}>↗</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
