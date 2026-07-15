import React from 'react';

export default function Layout({ children }) {
  return (
    <>
      <nav id="top-nav">
        <div className="nav-left">THE STATE OF THE SWARM</div>
        <div className="nav-logo">VAAYU</div>
        <div className="nav-right">SCROLL TO EXPLORE</div>
      </nav>
      <div className="sidebar-right"><div className="sidebar-badge">V.</div><div className="sidebar-label">Swarm</div></div>
      <div className="footer-left">2025</div>
      <div className="footer-right">EDGE AI DRONE PLATFORM</div>
      {children}
    </>
  );
}
