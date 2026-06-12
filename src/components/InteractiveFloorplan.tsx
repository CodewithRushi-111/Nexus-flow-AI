'use client';

import React, { useState } from 'react';
import { useFlow } from '../context/FlowContext';
import { Zone } from '../lib/types';
import { getAISuggestion } from '../lib/simulator';
import { Users, Clock, ShieldAlert, X, Send, Search, Eye } from 'lucide-react';

export default function InteractiveFloorplan() {
  const { state, dispatch } = useFlow();
  const { zones, selectedZoneId, staff } = state;
  const [search, setSearch] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [taskText, setTaskText] = useState('');
  const [heatmapActive, setHeatmapActive] = useState(false);

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || null;

  const handleSelectZone = (zone: Zone) => {
    dispatch({ type: 'SELECT_ZONE', payload: zone.id });
  };

  const handleClearZone = () => {
    dispatch({ type: 'SELECT_ZONE', payload: null });
    setSelectedStaffId('');
    setTaskText('');
  };

  const handleDeployStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId || !selectedStaffId) return;

    dispatch({
      type: 'DEPLOY_STAFF',
      payload: {
        staffId: selectedStaffId,
        zoneId: selectedZoneId,
        task: taskText || 'Monitor traffic flow and assist visitors.',
      },
    });

    setSelectedStaffId('');
    setTaskText('');
  };

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.section.toLowerCase().includes(search.toLowerCase())
  );

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'critical': return 'var(--color-critical)';
      case 'high': return 'var(--color-high)';
      case 'moderate': return 'var(--color-moderate)';
      case 'optimal':
      default:
        return 'var(--color-optimal)';
    }
  };

  // Helper to get heat gradient reference based on density
  const getHeatGradientId = (density: string) => {
    switch (density) {
      case 'critical': return 'url(#heat-critical)';
      case 'high': return 'url(#heat-high)';
      case 'moderate': return 'url(#heat-moderate)';
      case 'optimal':
      default:
        return 'url(#heat-optimal)';
    }
  };

  return (
    <div className="floorplan-container glass-panel">
      {/* Search & Heatmap Controls */}
      <div className="floorplan-search-wrapper">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search venue sectors, concourses, gates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input search-input"
          />
        </div>
        
        <button
          onClick={() => setHeatmapActive(!heatmapActive)}
          className={`btn-tab heatmap-toggle ${heatmapActive ? 'active' : ''}`}
        >
          <Eye className="toggle-icon" />
          <span>{heatmapActive ? 'THERMAL SCAN ACTIVE' : 'TOGGLE HEATMAP'}</span>
        </button>
      </div>

      <div className="map-view-wrapper">
        {/* SVG Venue Map */}
        <svg viewBox="0 0 800 500" className="venue-svg">
          {/* Background grid indicators */}
          <rect width="800" height="500" fill="transparent" />

          {/* Heatmap Gradients definitions */}
          <defs>
            <radialGradient id="heat-optimal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-optimal)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-optimal)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-moderate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-moderate)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--color-moderate)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-high)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-high)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-critical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-critical)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--color-critical)" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Outer Arena Boundary */}
          <path
            d="M 120 250 C 120 100, 240 60, 400 60 C 560 60, 680 100, 680 250 C 680 400, 560 440, 400 440 C 240 440, 120 400, 120 250 Z"
            fill="rgba(16, 16, 28, 0.5)"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
          />

          {/* Heatmap Seating Thermal Blobs (Rendered when toggle is ON) */}
          {heatmapActive && (
            <g className="heatmap-blobs animate-slide-up">
              {/* North Seating Heat Blob - links to Gate A or Concourse 1 density */}
              <ellipse
                cx="400"
                cy="100"
                rx="140"
                ry="35"
                fill={getHeatGradientId(zones.find((z) => z.id === 'z-con-1')?.density || 'optimal')}
              />
              {/* West Seating Heat Blob - links to Concourse 2 density */}
              <ellipse
                cx="180"
                cy="250"
                rx="40"
                ry="110"
                fill={getHeatGradientId(zones.find((z) => z.id === 'z-con-2')?.density || 'optimal')}
              />
              {/* East Seating Heat Blob - links to Concourse 3 density */}
              <ellipse
                cx="620"
                cy="250"
                rx="40"
                ry="110"
                fill={getHeatGradientId(zones.find((z) => z.id === 'z-con-3')?.density || 'optimal')}
              />
              {/* South Seating Heat Blob - links to Concourse 4 density */}
              <ellipse
                cx="400"
                cy="400"
                rx="140"
                ry="35"
                fill={getHeatGradientId(zones.find((z) => z.id === 'z-con-4')?.density || 'optimal')}
              />
            </g>
          )}
          
          {/* Inner Stadium Seating Rings */}
          <path
            d="M 200 250 C 200 140, 280 110, 400 110 C 520 110, 600 140, 600 250 C 600 360, 520 390, 400 390 C 280 390, 200 360, 200 250 Z"
            fill="rgba(24, 24, 38, 0.6)"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Central Pitch / Playing Field */}
          <rect
            x="320"
            y="190"
            width="160"
            height="120"
            rx="12"
            fill="rgba(16, 185, 129, 0.03)"
            stroke="rgba(16, 185, 129, 0.12)"
            strokeWidth="2"
          />
          <circle cx="400" cy="250" r="28" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1.5" />

          {/* Sectors lines */}
          <line x1="120" y1="250" x2="200" y2="250" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
          <line x1="600" y1="250" x2="680" y2="250" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
          <line x1="400" y1="60" x2="400" y2="110" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
          <line x1="400" y1="390" x2="400" y2="440" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />

          {/* Radial divisions */}
          <line x1="200" y1="110" x2="320" y2="190" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          <line x1="600" y1="110" x2="480" y2="190" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          <line x1="200" y1="390" x2="320" y2="310" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
          <line x1="600" y1="390" x2="480" y2="310" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

          {/* Compass labels */}
          <text x="400" y="42" fill="var(--text-dark)" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">NORTH SECTOR</text>
          <text x="400" y="468" fill="var(--text-dark)" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">SOUTH SECTOR</text>
          <text x="66" y="254" fill="var(--text-dark)" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">WEST</text>
          <text x="734" y="254" fill="var(--text-dark)" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">EAST</text>
        </svg>

        {/* Hotspots Overlay */}
        <div className="hotspots-layer">
          {filteredZones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            const color = getDensityColor(zone.density);
            return (
              <button
                key={zone.id}
                onClick={() => handleSelectZone(zone)}
                className={`hotspot-btn ${zone.density} ${isSelected ? 'selected' : ''}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                title={`${zone.name} (${zone.density})`}
              >
                {zone.density === 'critical' && (
                  <span className="pulse-ping" style={{ borderColor: color }} />
                )}
                <span className="hotspot-dot" style={{ backgroundColor: color }} />
                
                {/* Micro tooltip on hover */}
                <div className="hotspot-tooltip">
                  <div className="tt-name">{zone.name}</div>
                  <div className="tt-meta">{Math.round((zone.current / zone.capacity) * 100)}% occupied</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="legend-panel">
          <div className="legend-title">LIVE DENSITY</div>
          <div className="legend-items">
            <div className="legend-item"><span className="legend-color optimal" /><span>Optimal (&lt;40%)</span></div>
            <div className="legend-item"><span className="legend-color moderate" /><span>Moderate (40-70%)</span></div>
            <div className="legend-item"><span className="legend-color high" /><span>Heavy (70-85%)</span></div>
            <div className="legend-item"><span className="legend-color critical" /><span>Congested (&gt;85%)</span></div>
          </div>
        </div>

        {/* Zone detail overlay panel */}
        {selectedZone && (
          <div className="zone-detail-panel glass-panel animate-slide-up">
            <div className="panel-header">
              <div>
                <span className="subtitle">{selectedZone.section}</span>
                <h2>{selectedZone.name}</h2>
              </div>
              <button onClick={handleClearZone} className="close-btn">
                <X className="close-icon" />
              </button>
            </div>

            <div className="panel-body custom-scrollbar">
              <div className="metrics-grid">
                <div className="metric-box">
                  <div className="metric-box-label">
                    <Users className="icon" />
                    <span>OCCUPANCY</span>
                  </div>
                  <div className="metric-box-val font-mono">{selectedZone.current}</div>
                  <div className="metric-box-sub text-secondary">
                    {Math.round((selectedZone.current / selectedZone.capacity) * 100)}% of {selectedZone.capacity}
                  </div>
                </div>

                <div className="metric-box">
                  <div className="metric-box-label">
                    <Clock className="icon" />
                    <span>WAIT TIME</span>
                  </div>
                  <div className="metric-box-val font-mono">{selectedZone.waitTime}m</div>
                  <div className="metric-box-sub text-secondary">Average delay</div>
                </div>
              </div>

              <div className="ai-rec-box">
                <div className="ai-rec-header">
                  <ShieldAlert className="ai-icon" />
                  <span>AI RECOMMENDATION</span>
                </div>
                <p>{getAISuggestion(selectedZone)}</p>
              </div>

              {/* Staff dispatch dispatcher inside card */}
              <form onSubmit={handleDeployStaff} className="dispatch-form">
                <div className="form-title">DISPATCH RESOURCE PROTOCOL</div>
                <div className="form-group">
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    required
                    className="glass-input select-input"
                  >
                    <option value="" disabled>Select available officer...</option>
                    {staff
                      .filter((s) => s.status === 'idle')
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.role.toUpperCase()})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Enter dispatch directive/task details..."
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    className="glass-input directive-input"
                  />
                </div>

                <button type="submit" disabled={!selectedStaffId} className="btn-primary dispatch-submit-btn">
                  <Send className="send-icon" />
                  <span>DEPLOY STAFF</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .floorplan-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(12, 12, 20, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .floorplan-search-wrapper {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          width: 16px;
          height: 16px;
          color: var(--text-secondary);
        }

        .search-input {
          width: 100%;
          padding-left: 38px;
          font-size: 13px;
        }

        .heatmap-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          height: 38px;
        }

        .toggle-icon {
          width: 14px;
          height: 14px;
        }

        .map-view-wrapper {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .venue-svg {
          width: 100%;
          height: 100%;
          max-height: 480px;
          opacity: 0.35;
        }

        .hotspots-layer {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .hotspot-btn {
          position: absolute;
          width: 32px;
          height: 32px;
          transform: translate(-50%, -50%);
          background: transparent;
          border: none;
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          z-index: 5;
        }

        .hotspot-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .hotspot-btn:hover .hotspot-dot, .hotspot-btn.selected .hotspot-dot {
          transform: scale(1.4);
          border-color: white;
          box-shadow: 0 0 14px currentColor;
        }

        .pulse-ping {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid;
          animation: ping 1.8s infinite ease-out;
        }

        /* Tooltip style */
        .hotspot-tooltip {
          position: absolute;
          bottom: 135%;
          background: #10101a;
          border: 1px solid var(--border-glass);
          padding: 6px 10px;
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(4px);
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }

        .hotspot-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px;
          border-style: solid;
          border-color: #10101a transparent transparent transparent;
        }

        .hotspot-btn:hover .hotspot-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .tt-name {
          color: white;
          font-weight: 600;
          font-size: 11px;
        }

        .tt-meta {
          color: var(--text-secondary);
          font-size: 10px;
          margin-top: 2px;
        }

        /* Legend Panel */
        .legend-panel {
          position: absolute;
          left: 16px;
          bottom: 16px;
          background: rgba(10, 10, 16, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-glass);
          border-radius: 10px;
          padding: 12px 14px;
          pointer-events: auto;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }

        .legend-title {
          font-size: 8px;
          font-weight: 800;
          color: var(--text-dark);
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }

        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: var(--text-secondary);
        }

        .legend-color {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-color.optimal { background: var(--color-optimal); }
        .legend-color.moderate { background: var(--color-moderate); }
        .legend-color.high { background: var(--color-high); }
        .legend-color.critical { background: var(--color-critical); }

        /* Detail side popover */
        .zone-detail-panel {
          position: absolute;
          right: 16px;
          top: 16px;
          bottom: 16px;
          width: 320px;
          background: rgba(10, 10, 18, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: -10px 0 35px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          z-index: 10;
          pointer-events: auto;
        }

        .panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .panel-header .subtitle {
          font-size: 9px;
          color: var(--primary);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .panel-header h2 {
          font-size: 15px;
          font-weight: 800;
          color: white;
          margin-top: 1px;
        }

        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .close-icon {
          width: 16px;
          height: 16px;
        }

        .panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .metric-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 12px;
        }

        .metric-box-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          color: var(--text-dark);
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .metric-box-label .icon {
          width: 10px;
          height: 10px;
        }

        .metric-box-val {
          font-size: 20px;
          font-weight: 800;
          color: white;
          margin-top: 4px;
        }

        .metric-box-sub {
          font-size: 9px;
          margin-top: 2px;
        }

        .ai-rec-box {
          background: rgba(0, 242, 254, 0.03);
          border: 1px solid rgba(0, 242, 254, 0.12);
          border-radius: 12px;
          padding: 12px;
        }

        .ai-rec-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .ai-icon {
          width: 12px;
          height: 12px;
        }

        .ai-rec-box p {
          font-size: 11px;
          line-height: 1.45;
          color: var(--text-secondary);
        }

        .dispatch-form {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-title {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.08em;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .select-input {
          width: 100%;
          font-size: 12px;
          cursor: pointer;
        }

        .directive-input {
          width: 100%;
          font-size: 12px;
        }

        .dispatch-submit-btn {
          width: 100%;
          justify-content: center;
          padding: 9px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 4px;
        }

        .dispatch-submit-btn:disabled {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-dark);
          box-shadow: none;
          cursor: not-allowed;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .send-icon {
          width: 12px;
          height: 12px;
        }

        .font-mono {
          font-family: var(--font-mono);
        }

        .text-secondary {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
