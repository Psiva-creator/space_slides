import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: '90%', label: 'Reduction in false alerts vs legacy motion detection' },
  { value: '3×',  label: 'Faster threat confirmation via multi-sensor fusion' },
  { value: '< 50mW', label: 'Edge node idle power — sleeps until threat confirmed' },
  { value: '0',   label: 'Bandwidth used until an event is verified by the edge' },
];

export default function Impact() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // gsap.context scopes all animations — cleanup only kills THIS component's triggers
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelectorAll('.impact-stat'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(el.querySelector('.impact-heading'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play none none none' } }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="slide impact-section" ref={sectionRef} data-section="true" data-label="Impact" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
      <div className="slide-inner" style={{ padding: '0 8vw', flexDirection: 'column', gap: 48 }}>
        <div className="impact-heading" style={{ opacity: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4dff8a', marginBottom: 14 }}>MEASURED OUTCOMES</div>
          <h2 style={{ fontSize: 'clamp(32px,5vw,64px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#fff' }}>Real-World Impact</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, width: '100%', maxWidth: 1100 }}>
          {STATS.map((s, i) => (
            <div key={i} className="impact-stat" style={{ opacity: 0, background: 'rgba(10,22,14,0.92)', border: '1px solid rgba(77,255,138,0.15)', borderRadius: 16, padding: '32px 28px' }}>
              <div style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, color: '#4dff8a', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 14 }}>{s.value}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
