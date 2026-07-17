import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data from Vaayu Technical Report v2.2 ─────────────────────── */
const CHALLENGES = [
  {
    num: '01',
    icon: '⚠️',
    color: '#ff6b6b',
    title: 'Limited RAM on Edge',
    problem: 'ESP32-S3 has only 8 MB PSRAM — YOLOv8-nano (3.3 MB) repeatedly crashed the device due to memory exhaustion.',
    solution: 'Switched to FOMO (97K params, 19 KB INT8) — 34× smaller, fits in a 512 KB arena, runs at 7–10 FPS real-time.',
    metric: { label: '34×', sub: 'smaller model' },
  },
  {
    num: '02',
    icon: '📡',
    color: '#f97316',
    title: 'Radar ↔ Mic Interference',
    problem: 'HLK-LD2410 radar draws 80–150 mA pulsed current, causing power rail ripple that the PDM microphone amplifies as audio noise.',
    solution: 'Interleaved temporal gating: pause radar via CMD_ENABLE_CONFIG → wait 15 ms for rail to settle → capture clean 256-sample window → resume radar.',
    metric: { label: '15 ms', sub: 'gating window' },
  },
  {
    num: '03',
    icon: '📉',
    color: '#fbbf24',
    title: 'High False-Positive Rate',
    problem: 'Legacy motion detection triggers on wind, animals, and lighting changes — operators suffer severe alert fatigue.',
    solution: 'RLAIF reward shaping (FP penalty −1.2) + weighted training loss (20:1 person:background) + grey-zone gating (stream only when conf ≥ 0.15).',
    metric: { label: '−1.2', sub: 'FP penalty (RLAIF)' },
  },
  {
    num: '04',
    icon: '📶',
    color: '#4dff8a',
    title: 'Bandwidth Overload',
    problem: 'Always-on HD video from dozens of cameras saturates networks. 99% of streamed footage is never reviewed.',
    solution: 'Bi-directional state machine: edge node stays in LOCAL_LOGGING (zero bandwidth) and switches to CLOUD_STREAMING only when FOMO confidence ≥ 0.15.',
    metric: { label: '90%', sub: 'bandwidth saved' },
  },
  {
    num: '05',
    icon: '🔄',
    color: '#a78bfa',
    title: 'JPEG Decode Overhead',
    problem: 'Standard JPEG decode pipeline introduced unacceptable latency on the microcontroller for real-time inference.',
    solution: 'Direct RGB565→Grayscale conversion in firmware — skipping full JPEG decode by processing raw sensor data before encoding.',
    metric: { label: '16+ FPS', sub: 'end-to-end' },
  },
  {
    num: '06',
    icon: '🔁',
    color: '#38bdf8',
    title: 'OTA Model Updates',
    problem: 'Deploying new model weights to edge nodes in the field requires zero-downtime and no physical access.',
    solution: 'Hot-reload from LittleFS filesystem: new model binary downloaded and swapped without device reboot — inference continues during download.',
    metric: { label: 'Zero', sub: 'downtime OTA' },
  },
];

const STACK_COMPARISON = [
  { label: 'YOLOv8-nano', params: '3.3M', size: '3.3 MB', fps: 'CRASH', bar: 100, color: '#ff4444' },
  { label: 'FOMO INT8 (ours)', params: '97K', size: '19 KB', fps: '7–10 FPS', bar: 28, color: '#4dff8a' },
];

export default function Challenges() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.ch-card'),
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo(el.querySelector('.ch-heading'), { opacity: 0, y: 22 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' },
      });
      gsap.fromTo(el.querySelectorAll('.cmp-bar-fill'),
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.2, stagger: 0.2, ease: 'power2.out',
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
      data-label="Challenges"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', height: '100vh' }}
    >
      <div className="slide-inner" style={{ padding: '0 6vw', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>

        {/* ── Heading ── */}
        <div className="ch-heading" style={{ opacity: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#ff6b6b', marginBottom: 12 }}>
            ENGINEERING CHALLENGES
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4.5vw,58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>
            The Challenges
          </h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
            Real firmware & ML engineering constraints solved at the edge
          </div>
        </div>

        {/* ── 3×2 Challenge cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', maxWidth: 1200, alignSelf: 'center' }}>
          {CHALLENGES.map((c, i) => (
            <div
              key={i}
              className="ch-card"
              style={{
                opacity: 0,
                background: 'rgba(12,4,6,0.92)',
                border: `1px solid ${c.color}22`,
                borderRadius: 14,
                padding: '13px 14px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${c.color}, transparent)` }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', color: c.color, marginBottom: 4 }}>{c.num}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{c.title}</div>
                </div>
                <div style={{ fontSize: 22, opacity: 0.7 }}>{c.icon}</div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#ff6b6b', textTransform: 'uppercase', marginBottom: 4 }}>Problem</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{c.problem}</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: c.color, textTransform: 'uppercase', marginBottom: 4 }}>Solution</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{c.solution}</div>
              </div>

              <div style={{ display: 'inline-block', background: `${c.color}15`, border: `1px solid ${c.color}30`, borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: c.color, letterSpacing: '-0.02em' }}>{c.metric.label}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c.metric.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── YOLO vs FOMO Comparison ── */}
        <div style={{ width: '100%', maxWidth: 1200, alignSelf: 'center', background: 'rgba(4,4,10,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 20px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
            Why FOMO Instead of YOLO — Model Size Comparison
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STACK_COMPARISON.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ minWidth: 140, fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</div>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    className="cmp-bar-fill"
                    style={{
                      height: '100%',
                      width: `${m.bar}%`,
                      background: m.color,
                      borderRadius: 8,
                      transformOrigin: 'left',
                      boxShadow: `0 0 8px ${m.color}80`,
                    }}
                  />
                </div>
                <div style={{ minWidth: 60, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{m.size}</div>
                <div style={{ minWidth: 60, fontSize: 11, fontWeight: 700, color: m.color }}>{m.fps}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
