'use client';

import React, { useState } from 'react';
import NavigationSidebar from '../../components/NavigationSidebar';
import Header from '../../components/Header';
import { useFlow } from '../../context/FlowContext';
import { Route, Clock, ArrowRight, ShieldAlert, Check, HelpCircle } from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  location: string;
  distance: number; // in meters
  eta: number; // in seconds
  congestedZoneId?: string;
}

const DESTINATIONS: RouteOption[] = [
  { id: 'rt-exit', name: 'Main Egress Gate D', location: 'South Sector • Plaza Level', distance: 480, eta: 320, congestedZoneId: 'z-con-2' },
  { id: 'rt-dining', name: 'West Food Pavilion', location: 'West Sector • Terrace Wing', distance: 240, eta: 280, congestedZoneId: 'z-rest-2' },
  { id: 'rt-gates', name: 'West Gate B Ticketing', location: 'West Sector • Level 1', distance: 380, eta: 240, congestedZoneId: 'z-gate-b' },
  { id: 'rt-vip', name: 'East Galleria VIP', location: 'East Sector • Level 2', distance: 510, eta: 360 },
];

export default function RoutesPage() {
  const { state } = useFlow();
  const { zones } = state;
  const [selectedRouteId, setSelectedRouteId] = useState(DESTINATIONS[0].id);
  const [detourAccepted, setDetourAccepted] = useState(false);
  const [activeManeuverIdx, setActiveManeuverIdx] = useState(0);

  const selectedRoute = DESTINATIONS.find((r) => r.id === selectedRouteId) || DESTINATIONS[0];

  // Check if this route traverses any currently critical zones
  const isRouteCongested = selectedRoute.congestedZoneId 
    ? zones.find((z) => z.id === selectedRoute.congestedZoneId)?.density === 'critical'
    : false;

  const currentCongestedZone = selectedRoute.congestedZoneId 
    ? zones.find((z) => z.id === selectedRoute.congestedZoneId)
    : null;

  const handleSelectRoute = (id: string) => {
    setSelectedRouteId(id);
    setDetourAccepted(false);
    setActiveManeuverIdx(0);
  };

  // Dynamically compute ETA and Distance based on detour acceptance
  const getRouteMetrics = () => {
    let distance = selectedRoute.distance;
    let eta = selectedRoute.eta;

    if (isRouteCongested) {
      if (detourAccepted) {
        // Detour is slightly longer distance but much faster time
        distance += 60;
        eta -= 110; 
      } else {
        // Traverses congestion: standard distance, huge wait time penalty
        eta += 220; 
      }
    }
    return { distance, eta };
  };

  const { distance, eta } = getRouteMetrics();

  const getManeuvers = () => {
    if (isRouteCongested && detourAccepted) {
      return [
        { title: 'Depart current section', detail: 'Turn right following the green digital signs.', dist: '20m' },
        { title: 'Detour via East Concourse 3', detail: 'Circumnavigate West bottleneck. Wait times average <1 min.', dist: '150m' },
        { title: 'Access Plaza Escalators', detail: 'Descend to Level 1. Keep left.', dist: '80m' },
        { title: 'Arrive at destination', detail: 'Arrive at destination on your left.', dist: '30m' },
      ];
    }
    
    return [
      { title: 'Depart current section', detail: 'Proceed straight towards West loop corridors.', dist: '40m' },
      { title: 'Traverse West Loop Link', detail: isRouteCongested ? 'CAUTION: Dense congestion, expect crowd bottlenecks.' : 'Corridor is clear, maintain normal pace.', dist: '120m' },
      { title: 'Pass West Food Pavilions', detail: 'Continue past the restrooms.', dist: '110m' },
      { title: 'Arrive at destination', detail: 'Arrive at destination gates.', dist: '10m' },
    ];
  };

  const maneuvers = getManeuvers();

  return (
    <div className="dashboard-layout">
      <NavigationSidebar />
      <div className="main-content">
        <Header title="Dynamic Routing Engine" />
        
        <main className="scrollable-body custom-scrollbar">
          {/* Detour Alert Banner */}
          {isRouteCongested && (
            <div className={`detour-alert-banner glass-panel ${detourAccepted ? 'accepted' : 'triggered'}`}>
              <div className="banner-left">
                <ShieldAlert className="banner-icon" />
                <div className="banner-text">
                  <h4>{detourAccepted ? 'AI DETOUR ROUTING DEPLOYED' : 'CRITICAL BOTTLENECK AHEAD'}</h4>
                  <p>
                    {detourAccepted 
                      ? `Detour active. Safely routing flow around the congestion bottleneck in ${currentCongestedZone?.name}.` 
                      : `Standard path crosses ${currentCongestedZone?.name} which is currently gridlocked (+3.5m queue wait).`
                    }
                  </p>
                </div>
              </div>
              <div className="banner-right">
                {detourAccepted ? (
                  <span className="deployed-status font-mono">
                    <Check className="check-icon" /> OPTIMIZED
                  </span>
                ) : (
                  <button onClick={() => setDetourAccepted(true)} className="btn-primary reroute-btn">
                    DEPLOY DETOUR BYPASS
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="routing-layout-grid">
            {/* Left: Route Map Visualization & Waypoints */}
            <div className="routing-left-col">
              {/* Route Map Card */}
              <div className="route-visualizer-card glass-panel">
                <div className="visualizer-header">
                  <div className="route-meta-bubble font-mono">
                    <span>ETA: {Math.floor(eta / 60)}m {eta % 60}s</span>
                    <span className="dot" />
                    <span>DISTANCE: {distance}m</span>
                  </div>
                  {isRouteCongested && !detourAccepted && (
                    <span className="delay-tag font-mono">CONGESTION DELAY (+3m 40s)</span>
                  )}
                </div>

                <div className="canvas-wrapper">
                  <svg viewBox="0 0 600 320" className="route-canvas">
                    {/* Grid */}
                    {Array.from({ length: 15 }, (_, i) => (
                      <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="320" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
                    ))}
                    {Array.from({ length: 8 }, (_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
                    ))}

                    {/* Sectors Blocks */}
                    <rect x="50" y="50" width="150" height="90" rx="8" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.04)" />
                    <rect x="360" y="50" width="180" height="110" rx="8" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.04)" />
                    <rect x="200" y="190" width="200" height="90" rx="8" fill="rgba(255, 255, 255, 0.015)" stroke="rgba(255, 255, 255, 0.04)" />

                    {/* Congested Area Highlight */}
                    {isRouteCongested && (
                      <circle
                        cx="290"
                        cy="160"
                        r={detourAccepted ? '28' : '45'}
                        fill={detourAccepted ? 'rgba(239, 68, 68, 0.03)' : 'rgba(239, 68, 68, 0.12)'}
                        stroke="rgba(239, 68, 68, 0.3)"
                        strokeWidth="1.5"
                        strokeDasharray={detourAccepted ? '3 3' : 'none'}
                        className={detourAccepted ? '' : 'ping-animation'}
                      />
                    )}

                    {/* Route Path line */}
                    {isRouteCongested && detourAccepted ? (
                      // Rerouted path: bypass
                      <path
                        d="M 120 230 C 120 100, 360 80, 450 100"
                        fill="none"
                        stroke="url(#gradient-bypass)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="route-line-path"
                      />
                    ) : (
                      // Standard path: direct through bottleneck
                      <path
                        d="M 120 230 L 290 160 L 450 100"
                        fill="none"
                        stroke={isRouteCongested ? '#ef4444' : '#00f2fe'}
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="route-line-path"
                      />
                    )}

                    {/* SVG Gradients */}
                    <defs>
                      <linearGradient id="gradient-bypass" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f2fe" />
                        <stop offset="100%" stopColor="#a154f2" />
                      </linearGradient>
                    </defs>

                    {/* Nodes dots */}
                    <circle cx="120" cy="230" r="6" fill="#00f2fe" />
                    <circle cx="120" cy="230" r="14" fill="none" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="2" />

                    <circle cx="450" cy="100" r="6" fill={isRouteCongested && detourAccepted ? '#a154f2' : '#00f2fe'} />
                    <circle cx="450" cy="100" r="14" fill="none" stroke={isRouteCongested && detourAccepted ? 'rgba(161, 84, 242, 0.2)' : 'rgba(0, 242, 254, 0.2)'} strokeWidth="2" />

                    {/* Bottleneck Label */}
                    {isRouteCongested && !detourAccepted && (
                      <g transform="translate(200, 150)">
                        <rect width="180" height="22" rx="4" fill="#180c0c" stroke="#ef4444" strokeWidth="1" />
                        <text x="90" y="14" fill="#ef4444" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">CROWD COLLISION DETECTED</text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Waypoints maneuvers panel */}
              <div className="waypoints-panel glass-panel">
                <h3>Detour Maneuver Directions</h3>
                <div className="maneuvers-list">
                  {maneuvers.map((man, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveManeuverIdx(idx)}
                      className={`maneuver-item ${idx === activeManeuverIdx ? 'active' : ''}`}
                    >
                      <div className="maneuver-index font-mono">STEP {idx + 1}</div>
                      <div className="maneuver-details">
                        <div className="maneuver-title">{man.title}</div>
                        <div className="maneuver-sub">{man.detail}</div>
                      </div>
                      <div className="maneuver-dist font-mono">{man.dist}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Destination Picker */}
            <div className="routing-right-col">
              <div className="destinations-panel glass-panel">
                <h3>Select Destination Target</h3>
                <p className="card-desc">AI computes routes based on active bottlenecks</p>
                
                <div className="dests-list">
                  {DESTINATIONS.map((dest) => {
                    const isCongested = dest.congestedZoneId 
                      ? zones.find((z) => z.id === dest.congestedZoneId)?.density === 'critical'
                      : false;

                    const isSelected = dest.id === selectedRouteId;

                    return (
                      <button
                        key={dest.id}
                        onClick={() => handleSelectRoute(dest.id)}
                        className={`dest-btn ${isSelected ? 'selected' : ''} ${isCongested ? 'congested' : ''}`}
                      >
                        <div className="dest-left">
                          <div className="dest-name">{dest.name}</div>
                          <div className="dest-loc">{dest.location}</div>
                        </div>
                        <div className="dest-right font-mono">
                          <div className="dest-eta">
                            {isCongested && !detourAccepted && isSelected ? (
                              <span className="text-red">+{Math.floor((dest.eta + 220) / 60)}m</span>
                            ) : (
                              <span>{Math.floor(dest.eta / 60)}m</span>
                            )}
                          </div>
                          <div className="dest-dist">{dest.distance}m</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        /* Banner */
        .detour-alert-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-radius: 14px;
          margin-bottom: 24px;
          transition: all 0.3s;
        }

        .detour-alert-banner.triggered {
          border-color: rgba(239, 68, 68, 0.2);
          background: rgba(239, 68, 68, 0.03);
          animation: banner-glow 2.5s infinite alternate;
        }

        .detour-alert-banner.accepted {
          border-color: rgba(16, 185, 129, 0.2);
          background: rgba(16, 185, 129, 0.03);
        }

        @keyframes banner-glow {
          0% { border-color: rgba(239, 68, 68, 0.2); }
          100% { border-color: rgba(239, 68, 68, 0.45); }
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .banner-icon {
          width: 22px;
          height: 22px;
          color: var(--color-critical);
        }

        .accepted .banner-icon {
          color: var(--color-optimal);
        }

        .banner-text h4 {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: white;
        }

        .banner-text p {
          font-size: 11px;
          color: var(--text-secondary);
          margin-top: 3px;
          line-height: 1.4;
        }

        .reroute-btn {
          font-size: 11px;
          font-weight: 800;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .deployed-status {
          font-size: 11px;
          font-weight: 800;
          color: var(--color-optimal);
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.1);
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .check-icon {
          width: 12px;
          height: 12px;
        }

        /* Layout Grid */
        .routing-layout-grid {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 20px;
          align-items: start;
        }

        .routing-left-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .routing-right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Route Visualizer Card */
        .route-visualizer-card {
          padding: 20px;
          background: rgba(16, 16, 28, 0.4);
        }

        .visualizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .route-meta-bubble {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 5px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .route-meta-bubble .dot {
          width: 4px;
          height: 4px;
          background: var(--text-dark);
          border-radius: 50%;
        }

        .delay-tag {
          font-size: 10px;
          font-weight: 800;
          color: var(--color-critical);
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 5px 12px;
          border-radius: 6px;
        }

        .canvas-wrapper {
          background: #06060a;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          overflow: hidden;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .route-canvas {
          width: 100%;
          height: 100%;
        }

        /* Waypoints */
        .waypoints-panel {
          padding: 24px;
          background: rgba(16, 16, 28, 0.3);
        }

        .maneuvers-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }

        .maneuver-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.2s;
        }

        .maneuver-item:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .maneuver-item.active {
          background: rgba(0, 242, 254, 0.03);
          border-color: rgba(0, 242, 254, 0.2);
        }

        .maneuver-index {
          font-size: 8px;
          font-weight: 800;
          color: var(--primary);
          border: 1px solid rgba(0, 242, 254, 0.3);
          background: rgba(0, 242, 254, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          width: 48px;
          text-align: center;
          flex-shrink: 0;
          margin-right: 14px;
        }

        .maneuver-details {
          flex: 1;
        }

        .maneuver-title {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .maneuver-sub {
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        .maneuver-dist {
          font-size: 11px;
          color: var(--text-dark);
          font-weight: 600;
          margin-left: 14px;
        }

        /* Destinations Panel */
        .destinations-panel {
          padding: 24px;
          height: 610px;
          display: flex;
          flex-direction: column;
          background: rgba(16, 16, 28, 0.35);
        }

        .dests-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
        }

        .dest-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .dest-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .dest-btn.selected {
          background: rgba(0, 242, 254, 0.04);
          border-color: rgba(0, 242, 254, 0.25);
          box-shadow: 0 4px 14px rgba(0, 242, 254, 0.05);
        }

        .dest-btn.congested:not(.selected) {
          border-left: 3px solid var(--color-critical);
        }

        .dest-btn.selected.congested {
          border-left: 3px solid var(--color-critical);
        }

        .dest-name {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .dest-loc {
          font-size: 9px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        .dest-right {
          text-align: right;
        }

        .dest-eta {
          font-size: 13px;
          font-weight: 800;
          color: white;
        }

        .dest-eta .text-red {
          color: var(--color-critical);
        }

        .dest-dist {
          font-size: 9px;
          color: var(--text-dark);
          font-weight: 500;
          margin-top: 1px;
        }

        .font-mono { font-family: var(--font-mono); }
        .text-red { color: var(--color-critical); }
      `}</style>
    </div>
  );
}
