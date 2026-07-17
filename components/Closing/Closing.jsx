import React from 'react';

export default function Closing() {
  return (
    <div className="closing-section">
      <section className="slide" data-section="true" data-label="Closing">
        <div className="slide-inner" style={{ flexDirection: 'column', gap: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#4dff8a' }}>VAAYU SWARM</div>
          <div className="text-center-big" style={{ lineHeight: 1.1 }}>
            The future of<br />surveillance is<br />autonomous.
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Private by architecture · Intelligent at the edge · Zero bandwidth until a threat is confirmed.
          </div>
        </div>
      </section>
      <section className="slide">
        <div className="slide-inner" style={{ flexDirection: 'column', gap: 20, textAlign: 'center' }}>
          <div className="text-center-big">VAAYU SWARM</div>
          <div className="cta-sub">AUTONOMOUS EDGE AI DRONE SURVEILLANCE</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginTop: 8 }}>
            VAAYU Technical Report v2.2 · July 2026
          </div>
          <button className="cta-btn">Explore the build</button>
        </div>
      </section>
    </div>
  );
}
