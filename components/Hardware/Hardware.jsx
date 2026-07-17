import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data from Vaayu Technical Report v2.2 ─────────────────────── */
const HARDWARE = [
  {
    tag: 'EDGE NODE',
    icon: '⚡',
    name: 'ESP32-S3 AI Camera',
    model: 'DFRobot DFR1154',
    color: '#4dff8a',
    specs: [
      { label: 'SoC', value: 'Dual-core Xtensa LX7 @ 240 MHz' },
      { label: 'RAM', value: '16 MB Flash + 8 MB PSRAM' },
      { label: 'Camera', value: 'OV3660 3MP · 160° · IR F/2.0' },
      { label: 'Wireless', value: '2.4 GHz Wi-Fi + BLE 5' },
      { label: 'Power', value: '5V USB-C or 3.7–15V VIN' },
      { label: 'Power Draw', value: '< 50mW idle · ~300mW active' },
    ],
    badge: '97K PARAMS · 19 KB',
  },
  {
    tag: 'DOPPLER RADAR',
    icon: '📡',
    name: 'HLK-LD2410',
    model: '24 GHz FMCW Radar',
    color: '#f97316',
    specs: [
      { label: 'Frequency', value: '24 GHz microwave FMCW' },
      { label: 'Features', value: 'Range · Velocity · Moving energy' },
      { label: 'Gate Detection', value: 'Stationary + dynamic targets' },
      { label: 'Peak Draw', value: '80–150 mA (pulsed)' },
      { label: 'Interface', value: 'UART1 · GPIO44/43' },
      { label: 'Resolution', value: '± 0.1 m/s velocity' },
    ],
    badge: '8 m RANGE',
  },
  {
    tag: 'AUDIO SENSOR',
    icon: '🎙',
    name: 'I2S PDM Microphone',
    model: 'MAX98357A Amplifier',
    color: '#f472b6',
    specs: [
      { label: 'Interface', value: 'I2S PDM Digital' },
      { label: 'Features', value: 'dB SPL · Spectral energy · Voice band' },
      { label: 'Data Pin', value: 'GPIO39 · Clock GPIO38' },
      { label: 'Sample Window', value: '256-sample · 16 ms clean window' },
      { label: 'Power', value: '< 1 mA active' },
      { label: 'Anti-interference', value: 'Temporal gating vs radar ripple' },
    ],
    badge: '8 FEATURES',
  },
  {
    tag: 'NIR / ALS',
    icon: '💡',
    name: 'LTR-308 ALS + IR LED',
    model: 'Ambient Light Sensor',
    color: '#38bdf8',
    specs: [
      { label: 'Sensor', value: 'LTR-308 NIR + ambient lux' },
      { label: 'Interface', value: 'I2C · SDA GPIO8 · SCL GPIO9' },
      { label: 'IR LED', value: 'GPIO47 (active HIGH)' },
      { label: 'Features', value: 'Lux · NIR intensity · IR strobe detect' },
      { label: 'Power', value: '< 0.5 mA' },
      { label: 'Use case', value: 'Night-mode trigger + illumination' },
    ],
    badge: '< 0.5 mW',
  },
];

const FUSION_CLASSES = [
  { cls: 0, name: 'IDLE / CLEAR', conf: '0.30', color: 'rgba(255,255,255,0.25)', condition: 'All sensors quiet' },
  { cls: 1, name: 'RADAR ONLY', conf: '0.70', color: '#f97316', condition: 'move_energy > 10' },
  { cls: 2, name: 'ACOUSTIC', conf: '0.65', color: '#f472b6', condition: 'audio_voice > 0.3 dB' },
  { cls: 3, name: 'CRITICAL THREAT', conf: '0.85', color: '#ff4444', condition: 'Radar + Audio + Vision' },
];

export default function Hardware() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.hw-card'),
        { opacity: 0, y: 52 },
        {
          opacity: 1, y: 0, duration: 1.0, stagger: 0.11, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo(el.querySelector('.hw-heading'), { opacity: 0, y: 22 }, {
        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' },
      });
      gsap.fromTo(el.querySelectorAll('.fusion-row'),
        { opacity: 0, x: -24 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 55%', toggleActions: 'play none none none' },
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
      data-label="Hardware"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', height: '100vh' }}
    >
      <div className="slide-inner" style={{ padding: '0 6vw', flexDirection: 'column', gap: 28, justifyContent: 'center' }}>

        {/* ── Heading ── */}
        <div className="hw-heading" style={{ opacity: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4dff8a', marginBottom: 12 }}>
            SENSOR STACK
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            Demonstration Hardware
          </h2>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 10 }}>
            Multi-modal sensor fusion — Radar · Vision · Audio · NIR on a single $15–25 edge node
          </div>
        </div>

        {/* ── Hardware Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
          {HARDWARE.map((h, i) => (
            <div
              key={i}
              className="hw-card"
              style={{
                opacity: 0,
                background: 'rgba(4,10,8,0.92)',
                border: `1px solid ${h.color}28`,
                borderRadius: 14,
                padding: '20px 18px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
            >
              {/* glow corner */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${h.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: h.color, marginBottom: 8 }}>
                {h.tag}
              </div>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{h.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2, letterSpacing: '-0.02em' }}>{h.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 16, letterSpacing: '0.04em' }}>{h.model}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {h.specs.map((sp, j) => (
                  <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: h.color, letterSpacing: '0.1em', textTransform: 'uppercase', minWidth: 56, paddingTop: 1, opacity: 0.8 }}>{sp.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{sp.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, display: 'inline-block', background: `${h.color}15`, border: `1px solid ${h.color}30`, borderRadius: 100, padding: '4px 10px', fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', color: h.color }}>
                {h.badge}
              </div>
            </div>
          ))}
        </div>

        {/* ── Fusion threat classifier ── */}
        <div style={{ width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12, textAlign: 'center' }}>
            Tri-Modal Threat Classification Output
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {FUSION_CLASSES.map((fc, i) => (
              <div
                key={i}
                className="fusion-row"
                style={{
                  opacity: 0,
                  background: 'rgba(6,6,12,0.85)',
                  border: `1px solid ${fc.color}40`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>CLASS {fc.cls}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: fc.color }}>conf {fc.conf}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{fc.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{fc.condition}</div>
                {/* confidence bar */}
                <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 4 }}>
                  <div style={{ height: '100%', width: `${parseFloat(fc.conf) * 100}%`, background: fc.color, borderRadius: 3, boxShadow: `0 0 6px ${fc.color}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
