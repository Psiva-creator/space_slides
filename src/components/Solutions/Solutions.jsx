import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SOLUTION_STAGES } from '../../data/content';

gsap.registerPlugin(ScrollTrigger);

export default function Solutions() {
  useEffect(() => {
    const solutionSection = document.querySelector('.solution-section');
    if (!solutionSection) return;

    const panels      = gsap.utils.toArray('.solution-panel');
    const totalPanels  = panels.length;
    const MINI_LEFT_X  = 36;

    // Quintic smoothstep — ultra-smooth s-curve
    const ss = (a, b, x) => {
      const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
      return t * t * t * (t * (t * 6 - 15) + 10);
    };

    const computeLayout = () => {
      const W = window.innerWidth, H = window.innerHeight;
      const panelW    = Math.min(740, W * 0.82);
      const panelH    = 280;
      const maxMiniW  = Math.max(60, (W - panelW) / 2 - MINI_LEFT_X - 20);
      const miniScale = Math.min(0.26, maxMiniW / panelW);
      const miniSlotH = panelH * miniScale + 16;
      const stackTopY = Math.max(110, (H - totalPanels * miniSlotH) / 2);
      const cX = (W - panelW) / 2;
      const cY = (H - panelH) / 2;
      return { W, H, panelW, panelH, miniScale, miniSlotH, stackTopY, cX, cY };
    };

    // Progress 0→1 is divided into totalPanels equal segments.
    // Each segment: [0 → ENTER_END] enter, [ENTER_END → EXIT_START] dwell, [EXIT_START → 1] exit.
    // The LAST card never exits — it stays at dwell until ScrollTrigger releases.
    const applyStates = (progress) => {
      const { W, miniScale, miniSlotH, stackTopY, cX, cY } = computeLayout();

      // Map progress [0,1] → [0, totalPanels]. Card i owns [i, i+1).
      // At progress=1 we clamp to the last card dwelling.
      const scaled     = Math.min(progress * totalPanels, totalPanels - 0.001);
      const currentIdx = Math.floor(scaled);
      const subT       = scaled - currentIdx;
      const isLast     = currentIdx === totalPanels - 1;

      const ENTER_END  = 0.40;   // 0%→40% of card's window: enter
      const EXIT_START = 0.75;   // 75%→100%: shrink to mini (skipped for last card)

      panels.forEach((panel, i) => {
        const miniY = stackTopY + i * miniSlotH;

        if (i < currentIdx) {
          // ── PAST: shrunk in mini stack ──
          const depth = currentIdx - 1 - i;
          gsap.set(panel, {
            x: MINI_LEFT_X, y: miniY,
            scale: miniScale,
            opacity: Math.max(0.15, 0.6 - depth * 0.12),
            filter: 'blur(0px)',
            transformOrigin: 'top left',
          });
        } else if (i === currentIdx) {
          // ── ACTIVE CARD ──
          if (subT < ENTER_END && currentIdx > 0) {
            // Enter: sweep from bottom-right
            const p = ss(0, ENTER_END, subT);
            gsap.set(panel, {
              x: cX + (1 - p) * W * 0.18,
              y: cY + (1 - p) * 60,
              scale: 0.86 + 0.14 * p,
              opacity: p,
              filter: `blur(${14 * (1 - p)}px)`,
              transformOrigin: 'top left',
            });
          } else if (subT > EXIT_START && !isLast) {
            // Exit: drift to mini slot on left
            const p = ss(EXIT_START, 1.0, subT);
            gsap.set(panel, {
              x: cX + (MINI_LEFT_X - cX) * p,
              y: cY + (miniY - cY) * p,
              scale: 1 + (miniScale - 1) * p,
              opacity: 1 - p * 0.4,
              filter: `blur(${p * 3}px)`,
              transformOrigin: 'top left',
            });
          } else {
            // Dwell: centered, fully visible
            gsap.set(panel, {
              x: cX, y: cY, scale: 1, opacity: 1,
              filter: 'blur(0px)', transformOrigin: 'top left',
            });
          }
        } else {
          // ── FUTURE: hidden off-screen ──
          gsap.set(panel, {
            x: cX + W * 0.18, y: cY + 60,
            scale: 0.86, opacity: 0,
            filter: 'blur(14px)',
            transformOrigin: 'top left',
          });
        }
      });

      // Mini card highlights
      document.querySelectorAll('.solution-mini-card').forEach((mc, mi) => {
        mc.classList.toggle('active', mi === currentIdx);
        mc.classList.toggle('past',   mi <  currentIdx);
      });
      // Dot nav
      document.querySelectorAll('.solution-dot').forEach((dot, di) => {
        dot.classList.toggle('active', di === currentIdx);
      });
      // HUD
      const hudEl = document.querySelector('.solution-hud-num');
      if (hudEl) hudEl.textContent = String(currentIdx + 1).padStart(2, '0');
      // Progress bar
      const bar = document.querySelector('.solution-progress-fill');
      if (bar) bar.style.width = `${(progress * 100).toFixed(1)}%`;
    };

    gsap.set(panels, { opacity: 0 });

    const st = ScrollTrigger.create({
      trigger:  solutionSection,
      start:    'top top',
      end:      `+=${totalPanels * 100}vh`,
      pin:      true,
      scrub:    1.5,
      onUpdate: (self) => applyStates(self.progress),
      // Re-initialize when scrolling back into the section
      onEnter:     () => applyStates(0),
      onEnterBack: () => applyStates(1),
      onLeaveBack: () => { gsap.set(panels, { opacity: 0 }); },
    });

    // Fade out particle canvas as solution section enters
    ScrollTrigger.create({
      trigger: solutionSection, start:'top 80%', end:'top 5%', scrub:true,
      onUpdate:(self)=>{ const c=document.getElementById('bg-canvas'); if(c) c.style.opacity=1-self.progress; },
    });

    return () => ScrollTrigger.getAll().forEach(s => s.kill());
  }, []);

  return (
    <section className="solution-section">
      <div className="solution-stage">
        <div className="solution-glow-orb" />
        <div className="solution-header">
          <div className="solution-eyebrow">OUR APPROACH</div>
          <div className="solution-title-main">The Solution Pipeline</div>
        </div>
        <div className="solution-progress-track">
          <div className="solution-progress-fill" />
        </div>
        <div className="solution-mini-stack">
          {SOLUTION_STAGES.map((s, i) => (
            <div className="solution-mini-card" data-i={i} key={i}>
              <span className="solution-mini-num">{s.num}</span>
              <span className="solution-mini-title">{s.title}</span>
            </div>
          ))}
        </div>
        {SOLUTION_STAGES.map((s, i) => (
          <div className="solution-panel" key={i} data-i={i}>
            <div className="solution-panel-top">
              <span className="solution-panel-tag">{s.stage}</span>
              <span className="solution-panel-counter">{s.num} / {String(SOLUTION_STAGES.length).padStart(2,'0')}</span>
            </div>
            <h2 className="solution-panel-heading">{s.title}</h2>
            <p className="solution-panel-desc">{s.desc}</p>
            <div className="solution-panel-bar" />
          </div>
        ))}
        <div className="solution-dots">
          {SOLUTION_STAGES.map((_, i) => (
            <span className="solution-dot" data-i={i} key={i} />
          ))}
        </div>
        <div className="solution-hud">
          <span className="solution-hud-num">01</span>
          <span className="solution-hud-total"> / {String(SOLUTION_STAGES.length).padStart(2,'0')}</span>
        </div>
      </div>
    </section>
  );
}
