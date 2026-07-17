import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

/**
 * PageNav — step-by-step section navigation.
 *
 * Handles two types of entries in sectionsRef:
 *   { el, fixedScrollY: null  }  →  normal section, getScrollY() walks offsetParent
 *   { el, fixedScrollY: 1234  }  →  Solutions stage, scroll directly to pre-computed Y
 *
 * Solutions exports its stage scroll positions via data-stage-scrolls after
 * GSAP ScrollTrigger initialises. We collect them at 1100ms (after GSAP's 250ms + buffer).
 */
export default function PageNav() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [total, setTotal]           = useState(0);
  const sectionsRef   = useRef([]);
  const isAnimating   = useRef(false);
  const debounceTimer = useRef(null);

  // Build the flat list of navigation entries
  const collect = useCallback(() => {
    const els = Array.from(document.querySelectorAll('[data-section]'));
    const entries = [];

    els.forEach(el => {
      const stageScrollsRaw = el.dataset.stageScrolls;
      if (stageScrollsRaw) {
        // Solutions: expand into one entry per stage
        try {
          const ys = JSON.parse(stageScrollsRaw);
          ys.forEach((y, i) => {
            entries.push({
              el,
              fixedScrollY: y,
              label: `${el.dataset.label || 'Stage'} ${i + 1}/${ys.length}`,
            });
          });
        } catch (e) {
          entries.push({ el, fixedScrollY: null });
        }
      } else {
        entries.push({ el, fixedScrollY: null });
      }
    });

    sectionsRef.current = entries;
    setTotal(entries.length);
  }, []);

  useEffect(() => {
    // Initial collect — fires at 600ms for all non-Solutions sections
    const t = setTimeout(collect, 600);

    // Re-collect when Solutions fires its 'stages-ready' event
    // This guarantees stage scroll positions are always correct
    window.addEventListener('solutions-stages-ready', collect);

    return () => {
      clearTimeout(t);
      window.removeEventListener('solutions-stages-ready', collect);
    };
  }, [collect]);

  // True document-Y — handles GSAP pin-spacer and normal elements
  const getScrollY = useCallback((entry) => {
    if (!entry) return 0;
    if (entry.fixedScrollY !== null && entry.fixedScrollY !== undefined) {
      return entry.fixedScrollY;
    }
    const el = entry.el;
    const parent = el.parentElement;
    const root = (parent && parent.classList.contains('gsap-pin-spacer')) ? parent : el;
    let y = 0, node = root;
    while (node) { y += node.offsetTop || 0; node = node.offsetParent; }
    return y;
  }, []);

  // Navigate to section entry at index idx
  const navigateTo = useCallback((idx) => {
    const entries = sectionsRef.current;
    if (!entries.length || idx < 0 || idx >= entries.length) return;
    if (isAnimating.current) return;

    setCurrentIdx(idx);       // optimistic — prevents next click from using stale idx
    isAnimating.current = true;

    gsap.to(window, {
      scrollTo: { y: getScrollY(entries[idx]), autoKill: false },
      duration: 0.72,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onComplete: () => { isAnimating.current = false; },
    });
  }, [getScrollY]);

  // Debounced scroll sync — only on manual scroll, never during animation
  useEffect(() => {
    const onScroll = () => {
      if (isAnimating.current) return;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const entries = sectionsRef.current;
        if (!entries.length) return;
        const sy = window.scrollY;
        let best = 0, bestDist = Infinity;
        entries.forEach((e, i) => {
          const d = Math.abs(getScrollY(e) - sy);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        setCurrentIdx(best);
      }, 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [total, getScrollY]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e) => {
      const solEl = document.querySelector('.solution-section');
      const solActive = solEl && (() => {
        const r = solEl.getBoundingClientRect();
        return r.top <= 4 && r.bottom >= window.innerHeight * 0.5;
      })();

      if (e.key === 'PageDown' || (e.ctrlKey && e.key === 'ArrowDown')) {
        e.preventDefault(); navigateTo(currentIdx + 1);
      } else if (e.key === 'PageUp' || (e.ctrlKey && e.key === 'ArrowUp')) {
        e.preventDefault(); navigateTo(currentIdx - 1);
      } else if (!solActive) {
        // Only fire plain arrows outside Solutions (Solutions has its own arrow handler)
        if (e.key === 'ArrowDown') { e.preventDefault(); navigateTo(currentIdx + 1); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); navigateTo(currentIdx - 1); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIdx, navigateTo]);

  if (total === 0) return null;

  const atStart = currentIdx === 0;
  const atEnd   = currentIdx === total - 1;

  return (
    <div
      id="page-nav"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 28,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 9000,
      }}
    >
      <NavBtn id="page-nav-up"   onClick={() => navigateTo(currentIdx - 1)} disabled={atStart} label="↑" />
      <div style={counterStyle}>
        <span style={{ color: '#4dff8a', fontWeight: 700, fontSize: 13 }}>
          {String(currentIdx + 1).padStart(2, '0')}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: '0 3px' }}>/</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
          {String(total).padStart(2, '0')}
        </span>
      </div>
      <NavBtn id="page-nav-down" onClick={() => navigateTo(currentIdx + 1)} disabled={atEnd}   label="↓" />
    </div>
  );
}

function NavBtn({ id, onClick, disabled, label }) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      aria-label={label === '↑' ? 'Previous section' : 'Next section'}
      style={{
        width: 42, height: 42, borderRadius: '50%',
        background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(4,12,6,0.92)',
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.07)' : 'rgba(77,255,138,0.5)'}`,
        color: disabled ? 'rgba(255,255,255,0.18)' : '#4dff8a',
        fontSize: 18, cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        outline: 'none',
        boxShadow: disabled ? 'none' : '0 0 14px rgba(77,255,138,0.18)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}

const counterStyle = {
  height: 42, padding: '0 16px', borderRadius: 21,
  background: 'rgba(4,12,6,0.92)',
  border: '1px solid rgba(77,255,138,0.22)',
  display: 'flex', alignItems: 'center', gap: 2,
  fontFamily: 'monospace', letterSpacing: '0.06em',
};
