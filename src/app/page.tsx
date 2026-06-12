'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Cpu, Route, ShieldCheck, Activity, Users, ArrowRight, Bot } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="landing-container grid-bg">
      {/* Background radial overlays */}
      <div className="radial-glow cyan-glow" />
      <div className="radial-glow violet-glow" />

      {/* Navigation header */}
      <nav className="navbar glass-panel">
        <div className="nav-brand font-mono">
          <Activity className="brand-logo" />
          <span>NEXUSFLOW <span className="highlight">AI</span></span>
          <span className="live-pill">SIMULATOR ACTIVE</span>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="btn-primary">
            Enter Command Room
            <ArrowRight className="arrow-icon" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left animate-slide-up">
          <div className="live-status">
            <span className="dot status-dot active" />
            <span className="status-label font-mono">TELEMETRY STREAM ONLINE</span>
          </div>
          <h1>
            Orchestrate <span className="gradient-text text-glow-cyan">Human Flow</span> at Scale.
          </h1>
          <p className="hero-desc">
            NexusFlow AI transforms massive stadium telemetry into fluid human experiences. 
            Anticipate bottlenecks, dispatch responses, and deploy detour routing protocols 
            with a zero-latency crowd intelligence core.
          </p>
          <div className="hero-cta-buttons">
            <Link href="/login" className="btn-primary btn-lg">
              <span>Launch Control Center</span>
              <Cpu className="cta-icon" />
            </Link>
            <Link href="/floorplan" className="btn-glass btn-lg">
              <span>View Spatial Floorplan</span>
              <Compass className="cta-icon" />
            </Link>
          </div>
        </div>

        <div className="hero-right animate-slide-up">
          <div className="glass-panel main-thesis-card">
            <span className="tag-mono font-mono text-glow-purple">SYSTEM THESIS</span>
            <h3>Dynamic Crowd Orchestration</h3>
            <p>
              Traditional static signs fail when crowd density spikes. NexusFlow operates an 
              autonomous listening core that adjusts wayfinding dynamically based on real-time zone capacities.
            </p>
            <div className="bullet-points">
              <div className="bullet-item">
                <div className="bullet-icon-wrapper cyan"><Route className="bullet-icon" /></div>
                <div>
                  <div className="bullet-title">Detour Auto-Calculation</div>
                  <div className="bullet-sub">Reroutes traffic when density exceeds 85% threshold.</div>
                </div>
              </div>
              <div className="bullet-item">
                <div className="bullet-icon-wrapper purple"><Bot className="bullet-icon" /></div>
                <div>
                  <div className="bullet-title">LLM Neural Copilot</div>
                  <div className="bullet-sub">Conversational AI trained directly on live venue data.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card glass-panel">
          <div className="stat-num font-mono text-glow-cyan">150%</div>
          <div className="stat-lbl">GATE PROCESSING RATE</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-num font-mono">&lt;4s</div>
          <div className="stat-lbl">DECISION UPDATE LATENCY</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-num font-mono text-glow-purple">48k</div>
          <div className="stat-lbl">MAX OCCUPANTS TRACKED</div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="modules-section">
        <div className="modules-header">
          <h2>Neural Command Modules</h2>
          <p>Four interconnected systems working together to optimize venue safety and operation speed</p>
        </div>

        <div className="modules-grid">
          {[
            {
              icon: Cpu,
              title: "Control Center Dashboard",
              desc: "Simulate event situations (matches, concerts, evacuations) and watch the AI balance flow, trigger alerts, and deploy staff.",
              path: "/operations"
            },
            {
              icon: Compass,
              title: "Interactive Spatial Map",
              desc: "Deep visual floorplan monitoring. Click hotspots to analyze occupancies, wait times, and dispatch field crews.",
              path: "/floorplan"
            },
            {
              icon: Route,
              title: "Dynamic Routing Engine",
              desc: "Real-time detouring. Accept crowd avoidance recommendations to route around physical bottle-necks.",
              path: "/routes"
            },
            {
              icon: Bot,
              title: "LLM Flow Copilot",
              desc: "Speak directly with your venue telemetry data. Run summaries, analyze queues, and command staff using natural language.",
              path: "/copilot"
            }
          ].map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div key={idx} className="module-card glass-panel">
                <div className="module-icon-container">
                  <Icon className="module-icon" />
                </div>
                <h4>{mod.title}</h4>
                <p>{mod.desc}</p>
                <Link href={mod.path} className="module-link font-mono">
                  <span>RUN SYSTEM</span>
                  <ArrowRight className="link-arrow" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand font-mono">
            <Activity className="brand-logo" />
            <span>NEXUSFLOW <span className="highlight">AI</span></span>
          </div>
          <p className="footer-summary">
            Architecting the future of physical space orchestration. All simulated telemetry networks operational.
          </p>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 NexusFlow AI. Evaluator evaluation sandbox active.</span>
        </div>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background-color: var(--bg-base);
          color: white;
          padding: 0 40px;
          position: relative;
          overflow: hidden;
        }

        .radial-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 1;
        }

        .cyan-glow {
          top: 10%;
          left: 15%;
          width: 500px;
          height: 500px;
          background: rgba(0, 242, 254, 0.04);
        }

        .violet-glow {
          bottom: 15%;
          right: 15%;
          width: 450px;
          height: 450px;
          background: rgba(161, 84, 242, 0.04);
        }

        /* Navbar */
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          margin-top: 20px;
          padding: 0 24px;
          position: relative;
          z-index: 10;
          border-radius: 14px;
          background: rgba(10, 10, 16, 0.7);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.12em;
        }

        .brand-logo {
          width: 20px;
          height: 20px;
          color: var(--primary);
        }

        .nav-brand .highlight {
          color: var(--primary);
        }

        .live-pill {
          font-size: 8px;
          font-weight: 800;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.2);
          color: var(--primary);
          padding: 2px 7px;
          border-radius: 99px;
          letter-spacing: 0.05em;
          margin-left: 10px;
        }

        .arrow-icon {
          width: 14px;
          height: 14px;
        }

        /* Hero */
        .hero-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          padding: 80px 0 60px 0;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .live-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .live-status .dot {
          color: var(--color-optimal);
          width: 6px;
          height: 6px;
        }

        .status-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-optimal);
          letter-spacing: 0.1em;
        }

        .hero-left h1 {
          font-size: 52px;
          font-family: var(--font-sans);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 40px;
          max-width: 580px;
        }

        .hero-cta-buttons {
          display: flex;
          gap: 16px;
        }

        .btn-lg {
          padding: 14px 28px;
          font-size: 14px;
          border-radius: 12px;
        }

        .cta-icon {
          width: 16px;
          height: 16px;
        }

        .main-thesis-card {
          padding: 32px;
          background: rgba(16, 16, 28, 0.45);
        }

        .tag-mono {
          font-size: 8px;
          font-weight: 800;
          color: var(--secondary);
          letter-spacing: 0.15em;
          display: block;
          margin-bottom: 12px;
        }

        .main-thesis-card h3 {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 14px;
          color: white;
        }

        .main-thesis-card p {
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 28px;
        }

        .bullet-points {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .bullet-icon-wrapper {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
          flex-shrink: 0;
        }

        .bullet-icon-wrapper.cyan {
          background: rgba(0, 242, 254, 0.05);
          border-color: rgba(0, 242, 254, 0.15);
          color: var(--primary);
        }

        .bullet-icon-wrapper.purple {
          background: rgba(161, 84, 242, 0.05);
          border-color: rgba(161, 84, 242, 0.15);
          color: var(--secondary);
        }

        .bullet-icon {
          width: 16px;
          height: 16px;
        }

        .bullet-title {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .bullet-sub {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        /* Stats */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 40px 0 80px 0;
          position: relative;
          z-index: 10;
        }

        .stat-card {
          padding: 24px;
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
        }

        .stat-num {
          font-size: 38px;
          font-weight: 900;
          color: white;
          margin-bottom: 6px;
        }

        .stat-lbl {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.1em;
        }

        /* Modules */
        .modules-section {
          padding-bottom: 100px;
          position: relative;
          z-index: 10;
        }

        .modules-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .modules-header h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .modules-header p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .module-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          height: 250px;
          background: rgba(16, 16, 28, 0.3);
        }

        .module-icon-container {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 20px;
        }

        .module-icon {
          width: 20px;
          height: 20px;
        }

        .module-card h4 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 10px;
          color: white;
        }

        .module-card p {
          font-size: 11px;
          line-height: 1.5;
          color: var(--text-secondary);
          flex: 1;
        }

        .module-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          letter-spacing: 0.05em;
          margin-top: 14px;
          transition: all 0.2s;
        }

        .module-link:hover {
          color: white;
        }

        .link-arrow {
          width: 12px;
          height: 12px;
          transition: transform 0.2s;
        }

        .module-link:hover .link-arrow {
          transform: translateX(4px);
        }

        /* Footer */
        .landing-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 60px 0 40px 0;
          position: relative;
          z-index: 10;
        }

        .footer-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.12em;
        }

        .footer-brand .highlight {
          color: var(--primary);
        }

        .footer-summary {
          font-size: 12px;
          color: var(--text-secondary);
          max-width: 350px;
          text-align: right;
          line-height: 1.5;
        }

        .footer-bottom {
          font-size: 10px;
          color: var(--text-dark);
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding-top: 24px;
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .modules-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-section {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </main>
  );
}
