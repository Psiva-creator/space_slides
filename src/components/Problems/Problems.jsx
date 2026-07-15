import React from 'react';
import { PROBLEMS } from '../../data/content';

export default function Problems({ probRefs }) {
  return (
    <>
      {PROBLEMS.map((p, i) => (
        <section key={i} className="problem-slide" ref={el => probRefs.current[i] = el}>
          <div className="prob-left">
            <div className="prob-particle-zone" />
            <div className="news-card">
              <div className="news-source">{p.source}</div>
              <div className="news-headline">{p.headline}</div>
              <div className="news-stat-row">
                <span className="news-stat">{p.stat}</span>
                <span className="news-stat-label">{p.statLabel}</span>
              </div>
              <p className="news-body">{p.body}</p>
              <div className="news-date">{p.date}</div>
            </div>
          </div>
          <div className="prob-right">
            <img src={p.img} alt={p.headline} className="prob-img" />
          </div>
        </section>
      ))}
    </>
  );
}
