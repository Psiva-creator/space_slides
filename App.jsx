import React, { useRef } from 'react';
import './App.css';
import Layout from './components/Layout/Layout';
import Background from './components/Background/Background';
import Problems from './components/Problems/Problems';
import Solutions from './components/Solutions/Solutions';
import Impact from './components/Impact/Impact';
import Technical from './components/Technical/Technical';
import Communication from './components/Communication/Communication';
import AIModel from './components/AIModel/AIModel';
import RLHF from './components/RLHF/RLHF';
import Hardware from './components/Hardware/Hardware';
import Challenges from './components/Challenges/Challenges';
import FutureScopes from './components/FutureScopes/FutureScopes';
import References from './components/References/References';
import Closing from './components/Closing/Closing';
import PageNav from './components/PageNav/PageNav';

export default function App() {
  const subtitleRef   = useRef(null);
  const scrollHintRef = useRef(null);
  const titleSlideRef = useRef(null);
  const probRefs      = useRef([]);
  const scrollRef     = useRef(null);

  return (
    <Layout>
      <Background 
        titleSlideRef={titleSlideRef}
        subtitleRef={subtitleRef}
        scrollHintRef={scrollHintRef}
        probRefs={probRefs}
      />
      
      {/* 1. Title Section */}
      <div className="title-overlay">
        <div ref={subtitleRef} className="title-subtitle">AUTONOMOUS &nbsp;·&nbsp; EDGE AI &nbsp;·&nbsp; DRONE SURVEILLANCE</div>
        <div ref={scrollHintRef} className="scroll-hint"><span className="scroll-arrow">↓</span> SCROLL TO EXPLORE</div>
      </div>

      <div id="scroll-root" ref={scrollRef}>
        <section className="slide title-slide" ref={titleSlideRef} data-section="true" data-label="Hero" />
        
        {/* 2. Problem Statement */}
        <Problems probRefs={probRefs} />
        
        {/* 3. Solution Pipeline */}
        <Solutions />
        
        {/* 4. Impact Section */}
        <Impact />
        
        {/* 5. Technical */}
        <Technical />
        
        {/* 6. Communication */}
        <Communication />
        
        {/* 7. AI Model */}
        <AIModel />
        
        {/* 8. RLAIF */}
        <RLHF />
        
        {/* 9. Hardware Demonstration */}
        <Hardware />
        
        {/* 10. Challenges */}
        <Challenges />
        
        {/* 11. Future Scopes */}
        <FutureScopes />
        
        {/* 12. Research References */}
        <References />
        
        {/* End / Closing */}
        <Closing />
      </div>

      {/* Global step navigation — ↑ ↓ buttons */}
      <PageNav />
    </Layout>
  );
}

