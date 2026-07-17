import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SOLUTION_STAGES } from '../../data/content';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Solutions() {
  const currentIndexRef = useRef(0);
  const navigateRef = useRef(null);
  useEffect(() => {
    const solutionSection = document.querySelector('.solution-section');
    if (!solutionSection) return;

    const panels      = gsap.utils.toArray('.solution-panel');
    const totalPanels  = panels.length;

    // Remove the left mini stack since it's no longer part of the vertical design
    const miniStack = document.querySelector('.solution-mini-stack');
    if (miniStack) {
      miniStack.style.display = 'none';
    }

    const applyStates = (progress) => {
      const H = window.innerHeight;
      
      // We want progress to go from 0 to 1 over (totalPanels - 1) transitions
      // So vScroll goes from 0 to totalPanels - 1.
      const vScroll = progress * (totalPanels - 1);

      // We define properties at integer distances x from focus (0 is active)
      const getLayout = (x) => {
        const absX = Math.abs(x);
        const n = Math.floor(absX);
        const f = absX - n;
        
        const K = [
          { // x = 0 (Active)
            w: 86, // vw
            s: 1.05, 
            o: 1, 
            yOffset: 0, 
            glow: 1,
            contentO: 1,
            padTop: 48,
            padSide: 52
          },
          { // x = 1 (Prev/Next 1)
            w: 50, // vw
            s: 0.90, 
            o: 0.45, 
            yOffset: H * 0.38, 
            glow: 0.2,
            contentO: 0,
            padTop: 32,
            padSide: 36
          },
          { // x = 2 (Prev/Next 2)
            w: 42, // vw
            s: 0.80, 
            o: 0.12, 
            yOffset: H * 0.38 + H * 0.20, 
            glow: 0,
            contentO: 0,
            padTop: 24,
            padSide: 24
          },
          { // x >= 3
            w: 38, // vw
            s: 0.70, 
            o: 0, 
            yOffset: H * 0.38 + H * 0.20 + H * 0.15, 
            glow: 0,
            contentO: 0,
            padTop: 24,
            padSide: 24
          }
        ];
        
        const idx1 = Math.min(n, K.length - 1);
        const idx2 = Math.min(n + 1, K.length - 1);
        
        const k1 = K[idx1];
        const k2 = K[idx2];
        
        // Sine ease for smooth transitions (gives that "scrubbing physical" feel)
        const easeF = 0.5 - Math.cos(f * Math.PI) / 2;
        const lerp = (a, b, t) => a + (b - a) * t;
        const yVal = lerp(k1.yOffset, k2.yOffset, easeF);
        
        return {
          w: lerp(k1.w, k2.w, easeF),
          s: lerp(k1.s, k2.s, easeF),
          o: lerp(k1.o, k2.o, easeF),
          y: x < 0 ? -yVal : yVal, // apply sign for above/below
          glow: lerp(k1.glow, k2.glow, easeF),
          contentO: lerp(k1.contentO, k2.contentO, easeF),
          padTop: lerp(k1.padTop, k2.padTop, easeF),
          padSide: lerp(k1.padSide, k2.padSide, easeF),
        };
      };

      panels.forEach((panel, i) => {
        const x = i - vScroll; 
        const layout = getLayout(x);
        
        // Base styling for centered positioning — no blur filter (too GPU expensive)
        gsap.set(panel, {
          position: 'absolute',
          top: '50%',
          left: '50%',
          xPercent: -50,
          yPercent: -50,
          width: `${layout.w}vw`,
          maxWidth: '1200px',
          padding: `${layout.padTop}px ${layout.padSide}px`,
          y: layout.y,
          scale: layout.s,
          opacity: layout.o,
          filter: 'none',
          zIndex: 100 - Math.round(Math.abs(x) * 10),
          transformOrigin: 'center center',
          boxShadow: layout.glow > 0.01 
            ? `0 0 0 1px rgba(77,255,138, ${0.1 * layout.glow}), 
               0 0 60px rgba(77,255,138, ${0.2 * layout.glow}), 
               0 0 80px rgba(138,77,255, ${0.15 * layout.glow}), 
               0 32px 80px rgba(0,0,0,0.55), 
               inset 0 1px 0 rgba(255,255,255,0.05)`
            : `0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)`,
          borderColor: `rgba(77,255,138, ${0.1 + 0.3 * layout.glow})`
        });

        const desc = panel.querySelector('.solution-panel-desc');
        const bar = panel.querySelector('.solution-panel-bar');
        
        // Hide details by wrapping in opacity and height change
        if (desc) {
          gsap.set(desc, { 
            opacity: layout.contentO,
            height: layout.contentO > 0.05 ? 'auto' : 0,
            margin: layout.contentO > 0.05 ? '0 0 28px 0' : 0,
            overflow: 'hidden'
          });
        }
        if (bar) {
          gsap.set(bar, { opacity: layout.contentO });
        }
      });

      // Dot nav
      const currentIdx = Math.round(vScroll);
      currentIndexRef.current = currentIdx;
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


    // Initialise all panels immediately so Stage 01 is visible on entry
    applyStates(0);

    const st = ScrollTrigger.create({
      trigger:  solutionSection,
      start:    'top top',
      end:      `+=${totalPanels * 120}vh`,
      pin:      true,
      scrub:    0.3,
      onUpdate: (self) => applyStates(self.progress),
      onEnter:     () => applyStates(0),
      onEnterBack: () => applyStates(totalPanels > 1 ? 1 : 0),
      onLeaveBack: () => applyStates(0),
      onRefresh: (self) => {
        // Re-apply layout after GSAP recalculates pinned positions
        const currentProgress = self.progress || 0;
        applyStates(currentProgress);
        // Store stage scroll positions for PageNav
        const stageYs = Array.from({ length: totalPanels }, (_, i) => {
          const progress = totalPanels > 1 ? i / (totalPanels - 1) : 0;
          return Math.round(self.start + progress * (self.end - self.start));
        });
        solutionSection.dataset.stageScrolls = JSON.stringify(stageYs);
        // Tell PageNav to re-collect with the new correct values
        window.dispatchEvent(new CustomEvent('solutions-stages-ready'));
      },
    });

    // ── Button/keyboard navigation ──
    const navigate = (direction) => {
      const newIdx = Math.max(0, Math.min(totalPanels - 1, currentIndexRef.current + direction));
      const targetProgress = totalPanels <= 1 ? 0 : newIdx / (totalPanels - 1);
      const scrollStart = st.start;
      const scrollEnd   = st.end;
      const targetY     = scrollStart + targetProgress * (scrollEnd - scrollStart);
      gsap.to(window, { scrollTo: { y: targetY }, duration: 0.75, ease: 'power2.inOut', overwrite: true });
    };
    navigateRef.current = navigate;

    // Arrow key support (only fires when section is pinned/active)
    const onKeyDown = (e) => {
      const rect = solutionSection.getBoundingClientRect();
      const inView = rect.top <= 10 && rect.bottom >= window.innerHeight * 0.5;
      if (!inView) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
      if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); navigate(-1); }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      st.kill();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <section className="solution-section" data-section="true" data-label="Solutions">
      <div className="solution-stage">
        <div className="solution-glow-orb" />
        <div className="solution-header">
          <div className="solution-eyebrow">OUR APPROACH</div>
          <div className="solution-title-main">The Solution Pipeline</div>
        </div>
        <div className="solution-progress-track">
          <div className="solution-progress-fill" />
        </div>
        {/* Render panels directly for vertical stack */}
        {SOLUTION_STAGES.map((s, i) => (
          <div className="solution-panel" key={i} data-i={i}>
            <div className="solution-panel-top">
              <span className="solution-panel-tag">{s.stage}</span>
              <span className="solution-panel-counter">{s.num} / {String(SOLUTION_STAGES.length).padStart(2,'0')}</span>
            </div>
            <h2 className="solution-panel-heading">{s.title}</h2>
            <div className="solution-panel-desc">{s.desc}</div>
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

        {/* ── Up / Down Arrow Buttons ── */}
        <div className="solution-nav-arrows">
          <button
            className="solution-arrow-btn"
            onClick={() => navigateRef.current?.(-1)}
            aria-label="Previous stage"
          >↑</button>
          <button
            className="solution-arrow-btn"
            onClick={() => navigateRef.current?.(1)}
            aria-label="Next stage"
          >↓</button>
        </div>
      </div>
    </section>
  );
}

