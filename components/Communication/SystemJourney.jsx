import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  RadioReceiver, 
  Server, 
  BrainCircuit, 
  Bell, 
  ShieldCheck, 
  Camera, 
  Bot, 
  Activity, 
  CheckCircle,
  Eye,
  Zap,
  Lock
} from 'lucide-react';
import peRobotVideo from '../../assets/pe_robot_camera.mp4';
import './SystemJourney.css';

gsap.registerPlugin(ScrollTrigger);

const CyberCard = ({ num, title, desc, icon: Icon, colorClass }) => (
  <div className={`cyber-card-wrapper ${colorClass} fb-inner-card`}>
    <div className="cyber-card-inner">
      {num && <div className="cyber-num">{num}</div>}
      <div className="cyber-content-row">
        <div className="cyber-icon-box">
          {Icon && <Icon className="cyber-icon" size={36} />}
        </div>
        <div className="cyber-text">
          <h3>{title}</h3>
          <p className="cyber-desc">{desc}</p>
        </div>
      </div>
    </div>
  </div>
);

const RightCard = ({ label, title, desc, icon: Icon, videoSrc, colorClass }) => (
  <div className={`cyber-card-wrapper ${colorClass} fb-inner-card`}>
    <div className="cyber-card-inner right-layout">
      <div className="cyber-text">
        {label && <div className="cyber-label">{label}</div>}
        <h3>{title}</h3>
        <p className="cyber-desc">{desc}</p>
      </div>
      <div className="cyber-icon-box large-icon">
        {videoSrc ? (
          <video src={videoSrc} autoPlay loop muted playsInline className="cyber-video" />
        ) : (
          Icon && <Icon className="cyber-icon" size={54} />
        )}
      </div>
    </div>
  </div>
);

const MergeUI = () => (
  <div className="cyber-panel-wrapper blue fb-inner-card">
    <div className="cyber-panel-inner video-analysis">
      <div className="video-feed-mock">
        <div className="target-box"></div>
      </div>
      <div className="analysis-steps">
        <div className="step-item"><CheckCircle size={14} className="step-icon"/> DETECTION</div>
        <div className="step-item"><Activity size={14} className="step-icon"/> ANALYSIS</div>
        <div className="step-item"><CheckCircle size={14} className="step-icon"/> CLASSIFICATION</div>
        <div className="event-detected-btn">EVENT DETECTED ✔</div>
      </div>
    </div>
  </div>
);

const DashboardUI = () => (
  <div className="cyber-panel-wrapper purple fb-inner-card">
    <div className="cyber-panel-inner dashboard-mock">
      <div className="dash-header">
        <span>VAAYU SWARM</span>
        <span className="operator">Operator ⌄</span>
      </div>
      <div className="dash-body">
        <div className="dash-sidebar">
          <div className="dash-nav active">Dashboard</div>
          <div className="dash-nav">Cameras</div>
          <div className="dash-nav">Alerts</div>
        </div>
        <div className="dash-main">
          <div className="dash-live-feed">
            <div className="threat-alert-box">⚠️ THREAT DETECTED</div>
          </div>
          <div className="dash-stats">
            <div className="stat-box"><span>TOTAL</span><h3>24</h3></div>
            <div className="stat-box red"><span>HIGH RISK</span><h3>7</h3></div>
          </div>
        </div>
        <div className="dash-alert-panel">
          <h4>ALERT</h4>
          <h2>HIGH RISK</h2>
          <p>Time: 10:24 AM<br/>Cam: AI CAM 02</p>
          <button>DETAILS</button>
        </div>
      </div>
    </div>
  </div>
);

const LedgerUI = () => (
  <div className="cyber-panel-wrapper lime fb-inner-card">
    <div className="cyber-panel-inner ledger-flow-box">
      <div className="ledger-header">
        <Lock size={16}/> TAMPER-PROOF LEDGER
      </div>
      <div className="ledger-steps">
        <div className="l-step"><Eye size={20}/><span>DETECT</span></div>
        <div className="l-arrow">→</div>
        <div className="l-step"><Bell size={20}/><span>ALERT</span></div>
        <div className="l-arrow">→</div>
        <div className="l-step"><Zap size={20}/><span>ACTION</span></div>
        <div className="l-arrow">→</div>
        <div className="l-step sealed"><ShieldCheck size={20} color="#000"/><span>SEALED</span></div>
      </div>
      <div className="hash-verify">HASH CHAIN VERIFIED ✔</div>
    </div>
  </div>
);

const blocksData = [
  {
    id: 1,
    rgb: "209, 247, 52",
    left: <CyberCard num="01" title="EDGE NODE" desc="Edge device comes online and captures the environment." icon={RadioReceiver} colorClass="lime" />,
    right: <RightCard label="ANIMATION" title="ESP32 VIDEO MOTION" desc="ESP32 camera captures live video stream." icon={Camera} colorClass="purple" />
  },
  {
    id: 2,
    rgb: "209, 247, 52",
    left: <CyberCard num="02" title="SERVER PULLS LEGACY CAMERA" desc="Server pulls video feed from existing / legacy camera infrastructure." icon={Server} colorClass="lime" />,
    right: <RightCard label="ANIMATION" title="PE ROBOT AI CAMERA" desc="Legacy / AI camera in action in the field." videoSrc={peRobotVideo} colorClass="purple" />
  },
  {
    id: 3,
    rgb: "209, 247, 52",
    left: <CyberCard num="03" title="AI MODELS CLASSIFY THE EVENT" desc="AI analyzes video, detects objects / events and classifies the situation." icon={BrainCircuit} colorClass="lime" />,
    right: <MergeUI />
  },
  {
    id: 4,
    rgb: "176, 38, 255",
    left: <CyberCard num="04" title="DASHBOARD RECEIVES INSTANT ALERT" desc="Instant alert is pushed to the dashboard." icon={Bell} colorClass="purple" />,
    right: <DashboardUI />
  },
  {
    id: 5,
    rgb: "209, 247, 52",
    left: <CyberCard num="05" title="EVERY ACTION RECORDED TAMPER-PROOF" desc="All events and actions are securely recorded in a tamper-proof ledger." icon={ShieldCheck} colorClass="lime" />,
    right: <LedgerUI />
  }
];

export default function SystemJourney() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const blocksRef = useRef([]);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const progressRef = useRef(null);
  const counterRef = useRef(null);
  const dotsRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const blocks = blocksRef.current.filter(Boolean);
      const total = blocks.length;
      if (!total) return;

      // ── PRE-CACHE all DOM queries ONCE (never query inside scroll handler) ──
      const blockRGBs = blocks.map(b => b.style.getPropertyValue('--rgb'));
      const blockDescs = blocks.map(b => Array.from(b.querySelectorAll('.cyber-desc, .cyber-label')));
      const dots = dotsRef.current.filter(Boolean);
      const progressEl = progressRef.current;
      const counterEl = counterRef.current;
      let lastActiveIdx = -1;

      // Set static positioning once (never re-set these in the scroll handler)
      blocks.forEach(block => {
        block.style.position = 'absolute';
        block.style.top = '50%';
        block.style.left = '50%';
        block.style.maxWidth = '1100px';
        block.style.transformOrigin = 'center center';
        block.style.willChange = 'transform, opacity';
      });

      /* ── HIGH-PERF layout engine ── */
      const applyLayout = (progress) => {
        const vScroll = progress * (total - 1);
        const activeIdx = Math.round(vScroll);

        for (let i = 0; i < total; i++) {
          const block = blocks[i];
          const dist = i - vScroll;
          const absDist = Math.abs(dist);
          const sign = dist < 0 ? -1 : 1;

          // Fast interpolation via cosine ease
          const t1 = absDist < 1 ? absDist : 1;
          const ease1 = 0.5 - 0.5 * Math.cos(t1 * 3.14159265);

          let w, s, o, y, glow, descO;

          if (absDist < 0.001) {
            w = 82; s = 1; o = 1; y = 0; glow = 1; descO = 1;
          } else if (absDist <= 1) {
            w = 82 - 30 * ease1;
            s = 1 - 0.12 * ease1;
            o = 1 - 0.55 * ease1;
            y = 260 * ease1 * sign;
            glow = 1 - 0.85 * ease1;
            descO = 1 - ease1;
          } else if (absDist <= 2) {
            const t2 = absDist - 1;
            const ease2 = 0.5 - 0.5 * Math.cos(t2 * 3.14159265);
            w = 52 - 10 * ease2;
            s = 0.88 - 0.10 * ease2;
            o = 0.45 - 0.33 * ease2;
            y = (260 + 180 * ease2) * sign;
            glow = 0; descO = 0;
          } else {
            w = 38; s = 0.72; o = 0;
            y = 540 * sign;
            glow = 0; descO = 0;
          }

          // Single composite transform string (GPU-accelerated, no layout thrash)
          block.style.transform = `translate(-50%, -50%) translateY(${y}px) scale(${s})`;
          block.style.width = `${w}vw`;
          block.style.opacity = o;
          block.style.zIndex = 50 - (absDist * 10 | 0);

          // Border glow (simple string, no template literals in hot path for inactive)
          if (glow > 0.01) {
            const rgb = blockRGBs[i];
            const bAlpha = (0.15 + 0.4 * glow).toFixed(2);
            const sAlpha = (0.12 * glow).toFixed(2);
            const sSize = (40 * glow) | 0;
            block.style.borderColor = `rgba(${rgb},${bAlpha})`;
            block.style.boxShadow = `0 0 ${sSize}px rgba(${rgb},${sAlpha}),0 ${(20 * glow) | 0}px ${(60 * glow) | 0}px rgba(0,0,0,0.5)`;
          } else {
            block.style.borderColor = 'rgba(255,255,255,0.05)';
            block.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
          }

          // Collapse descriptions (pre-cached array, no DOM query)
          const descs = blockDescs[i];
          for (let d = 0; d < descs.length; d++) {
            const el = descs[d];
            el.style.opacity = descO;
            el.style.maxHeight = descO > 0.05 ? '200px' : '0';
          }
        }

        // Progress bar (single style write)
        if (progressEl) {
          progressEl.style.width = (progress * 100).toFixed(1) + '%';
        }

        // Counter + dots (only update when active card changes)
        if (activeIdx !== lastActiveIdx) {
          lastActiveIdx = activeIdx;
          if (counterEl) {
            counterEl.textContent = String(activeIdx + 1).padStart(2, '0');
          }
          for (let d = 0; d < dots.length; d++) {
            dots[d].classList.toggle('flow-dot-active', d === activeIdx);
          }
        }
      };

      // Initialize
      applyLayout(0);

      if (headerRef.current) {
        gsap.set(headerRef.current, { opacity: 1 });
      }

      // ScrollTrigger — scrub: 0.2 for near-instant scroll coupling
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${total * 110}vh`,
        pin: true,
        scrub: 0.2,
        anticipatePin: 1,
        onUpdate: (self) => applyLayout(self.progress),
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section data-section="true" data-label="Communication" ref={sectionRef} className="comm-section">
      <div ref={stageRef} className="comm-stage">
        {/* Ambient background glow */}
        <div className="comm-glow-orb" />

        {/* Header */}
        <div ref={headerRef} className="comm-header">
          <div className="comm-eyebrow">COMMUNICATION</div>
          <div className="comm-title-main">System Flow</div>
        </div>

        {/* Progress bar */}
        <div className="comm-progress-track">
          <div ref={progressRef} className="comm-progress-fill" />
        </div>

        {/* Cards */}
        {blocksData.map((b, i) => (
          <div
            key={b.id}
            ref={el => blocksRef.current[i] = el}
            className="flow-block"
            style={{ '--rgb': b.rgb }}
          >
            <div className="fb-col fb-left-col">{b.left}</div>
            <div className="fb-connector">
              <div className="fb-dot" />
              <div className="fb-line" />
              <div className="fb-dot" />
            </div>
            <div className="fb-col fb-right-col">{b.right}</div>
          </div>
        ))}

        {/* Dot nav */}
        <div className="comm-dots">
          {blocksData.map((_, i) => (
            <span
              key={i}
              ref={el => dotsRef.current[i] = el}
              className={`flow-dot ${i === 0 ? 'flow-dot-active' : ''}`}
            />
          ))}
        </div>

        {/* HUD counter */}
        <div className="comm-hud">
          <span ref={counterRef} className="comm-hud-num">01</span>
          <span className="comm-hud-total"> / {String(blocksData.length).padStart(2, '0')}</span>
        </div>

        {/* Footer */}
        <div className="comm-footer">
          <CheckCircle size={18} className="comm-footer-icon" />
          <span>END TO END SECURE MONITORING</span>
        </div>
      </div>
    </section>
  );
}
