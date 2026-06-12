'use client';

import React, { useMemo } from 'react';
import NavigationSidebar from '../../components/NavigationSidebar';
import Header from '../../components/Header';
import { useFlow } from '../../context/FlowContext';
import { IncidentMode } from '../../lib/types';
import { Users, Zap, Bell, ShieldAlert, Check, Trash2, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function OperationsPage() {
  const { state, dispatch } = useFlow();
  const { zones, alerts, stats, staff, activeIncidentMode } = state;

  const handleIncidentTrigger = (mode: IncidentMode) => {
    dispatch({ type: 'TRIGGER_INCIDENT', payload: mode });
  };

  const handleAckAlert = (id: string) => {
    dispatch({ type: 'ACK_ALERT', payload: id });
  };

  const handleDismissAlert = (id: string) => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <ShieldAlert className="alert-type-icon crit" />;
      case 'warning': return <Bell className="alert-type-icon warn" />;
      case 'success': return <ShieldCheck className="alert-type-icon success" />;
      case 'info':
      default:
        return <Users className="alert-type-icon info" />;
    }
  };

  const currentFillPercent = Math.round((stats.liveOccupancy / stats.totalCapacity) * 100);

  // Dynamic forecasting chart data depending on selected incident mode
  const forecastPoints = useMemo(() => {
    switch (activeIncidentMode) {
      case 'concert_rush':
        return [
          { time: '19:00', val: 17000 },
          { time: '20:00', val: 28500 },
          { time: '21:00', val: 32000 },
          { time: '22:00', val: 24000 },
          { time: '23:00', val: 15000 },
        ];
      case 'match_day':
        return [
          { time: '19:00', val: 17000 },
          { time: '20:00', val: 21000 },
          { time: '21:00', val: 33500 },
          { time: '22:00', val: 12000 },
          { time: '23:00', val: 4000 },
        ];
      case 'evacuation_drill':
        return [
          { time: '19:00', val: 17000 },
          { time: '20:00', val: 4500 },
          { time: '21:00', val: 300 },
          { time: '22:00', val: 0 },
          { time: '23:00', val: 0 },
        ];
      case 'concourse_incident':
        return [
          { time: '19:00', val: 17000 },
          { time: '20:00', val: 18500 },
          { time: '21:00', val: 19800 },
          { time: '22:00', val: 18000 },
          { time: '23:00', val: 16500 },
        ];
      case 'standard':
      default:
        return [
          { time: '19:00', val: 17000 },
          { time: '20:00', val: 17500 },
          { time: '21:00', val: 16800 },
          { time: '22:00', val: 16000 },
          { time: '23:00', val: 15500 },
        ];
    }
  }, [activeIncidentMode]);

  // SVG Line & Fill Path Builders
  const chartPaths = useMemo(() => {
    const width = 450;
    const height = 110;
    const maxVal = 35000;
    
    const points = forecastPoints.map((p, idx) => {
      const x = (idx / (forecastPoints.length - 1)) * width;
      const y = height - (p.val / maxVal) * height + 10;
      return { x, y };
    });

    const linePath = points.reduce((acc, p, idx) => {
      return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    const fillPath = `${linePath} L ${width} ${height + 20} L 0 ${height + 20} Z`;

    return { linePath, fillPath, points };
  }, [forecastPoints]);

  // Audit Logs mapping
  const auditLogs = useMemo(() => {
    const timeStr = "19:35";
    switch (activeIncidentMode) {
      case 'concert_rush':
        return [
          `[${timeStr}:02] INCIDENT_ENG: Triggered CONCERT_ENTRY_RUSH protocol.`,
          `[${timeStr}:05] SENSOR_GRID: Surge warning at North Gates A & B.`,
          `[${timeStr}:12] COPILOT: AI proposed rerouting to auxiliary East gates.`,
          `[${timeStr}:18] CREW_DISP: Dispatch request sent to security team 3.`,
        ];
      case 'match_day':
        return [
          `[${timeStr}:01] INCIDENT_ENG: Triggered MATCH_DAY_EGRESS protocol.`,
          `[${timeStr}:04] SENSOR_GRID: Egress rate at South plaza peaked at 810 P/M.`,
          `[${timeStr}:09] DYNAMIC_SIGN: Exit signs switched to green bypass mode.`,
          `[${timeStr}:15] COPILOT: South Sector transit queue latency exceeded 22m.`,
        ];
      case 'evacuation_drill':
        return [
          `[${timeStr}:01] EMERGENCY: Initiated EGRESS_DRILL command.`,
          `[${timeStr}:03] FIRE_ALARM: Flashing warning beacons activated.`,
          `[${timeStr}:07] PATHFINDING: Evacuation routing tables broadcasted.`,
          `[${timeStr}:12] CREW_DISP: All available personnel mobilized to safety nodes.`,
        ];
      case 'concourse_incident':
        return [
          `[${timeStr}:01] INCIDENT_ENG: Triggered CONCOURSE_OBSTRUCTION protocol.`,
          `[${timeStr}:04] SENSOR_GRID: West Corridor flow drop detected (blockage).`,
          `[${timeStr}:08] COPILOT: Computed alternate path detour via Food Pavilion.`,
          `[${timeStr}:14] CREW_DISP: Dispatched Medic Sarah to West corridor.`,
        ];
      case 'standard':
      default:
        return [
          `[${timeStr}:01] SYSTEM: Initialized Standard Operations configuration.`,
          `[${timeStr}:05] SENSOR_GRID: Sector densities reports optimal (avg wait <3m).`,
          `[${timeStr}:11] COPILOT: Safe comfort thresholds maintained.`,
          `[${timeStr}:18] SYSTEM: Routine telemetry diagnostics normal.`,
        ];
    }
  }, [activeIncidentMode]);

  return (
    <div className="dashboard-layout">
      <NavigationSidebar />
      <div className="main-content">
        <Header title="Operations Control Center" />
        
        <main className="scrollable-body custom-scrollbar">
          {/* Top Big Stat Cards */}
          <div className="stats-row">
            {/* Occupancy Card */}
            <div className="stat-card glass-panel">
              <div className="card-top">
                <span className="lbl">LIVE OCCUPANCY</span>
                <Users className="icon" />
              </div>
              <div className="card-val font-mono">{stats.liveOccupancy.toLocaleString()}</div>
              <div className="card-progress-wrapper">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${currentFillPercent}%` }} />
                </div>
                <div className="progress-label">
                  <span>{currentFillPercent}% filled</span>
                  <span>Max: {stats.totalCapacity.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Throughput Card */}
            <div className="stat-card glass-panel">
              <div className="card-top">
                <span className="lbl">FLOW THROUGHPUT</span>
                <Zap className="icon text-cyan" />
              </div>
              <div className="card-val font-mono text-cyan">
                {stats.throughputRate.toLocaleString()} <span className="unit">P/MIN</span>
              </div>
              <div className="card-sub font-mono">
                <span>▲ 4.2% acceleration</span>
              </div>
            </div>

            {/* Alerts Card */}
            <div className="stat-card glass-panel">
              <div className="card-top">
                <span className="lbl">OPERATIONAL ALERTS</span>
                <ShieldAlert className="icon text-red" />
              </div>
              <div className="card-val font-mono text-red">
                {String(stats.activeAlertsCount).padStart(2, '0')}
              </div>
              <div className="card-alert-indicators">
                <span className="pill crit">CRIT: {alerts.filter((a) => a.type === 'critical' && !a.acknowledged).length}</span>
                <span className="pill warn">WARN: {alerts.filter((a) => a.type === 'warning' && !a.acknowledged).length}</span>
              </div>
            </div>
          </div>

          <div className="ops-grid">
            {/* Left Column: Controls, Chart, Alerts, and Logs */}
            <div className="ops-col left">
              {/* Incident Control Panel */}
              <div className="control-panel glass-panel">
                <h3>Incident Mode Simulation</h3>
                <p className="card-desc">Deploy incident scenarios to verify real-time AI rerouting and crowd control balance</p>
                
                <div className="incident-grid">
                  {[
                    { id: 'standard', name: 'Standard Operations', desc: 'Standard sports attendance baseline', color: 'standard' },
                    { id: 'concert_rush', name: 'Concert Entry Rush', desc: 'North Sector congestion simulation', color: 'concert' },
                    { id: 'match_day', name: 'Match Day Egress', desc: 'South Sector transit outflow pressure', color: 'match' },
                    { id: 'concourse_incident', name: 'Concourse Obstruction', desc: 'West corridor exit blockage', color: 'concourse' },
                    { id: 'evacuation_drill', name: 'Egress Drill', desc: 'Drill protocol for all sectors', color: 'evac' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleIncidentTrigger(mode.id as IncidentMode)}
                      className={`incident-btn ${mode.color} ${activeIncidentMode === mode.id ? 'active' : ''}`}
                    >
                      <div className="btn-inner">
                        <span className="mode-name">{mode.name}</span>
                        <span className="mode-desc">{mode.desc}</span>
                      </div>
                      {activeIncidentMode === mode.id && <span className="active-dot status-dot active" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Predictive Crowd Forecast Chart */}
              <div className="control-panel glass-panel">
                <div className="chart-header">
                  <Activity className="header-icon text-cyan" />
                  <h3>Predictive Occupancy Forecast</h3>
                </div>
                <p className="card-desc">AI-calculated occupancy trajectory over the next 4 hours</p>
                
                <div className="forecast-chart-wrapper">
                  <svg viewBox="0 0 450 140" className="forecast-svg">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="450" y2="20" stroke="rgba(255,255,255,0.02)" />
                    <line x1="0" y1="60" x2="450" y2="60" stroke="rgba(255,255,255,0.02)" />
                    <line x1="0" y1="100" x2="450" y2="100" stroke="rgba(255,255,255,0.02)" />
                    <line x1="0" y1="120" x2="450" y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

                    {/* Gradient Fill under path */}
                    <path d={chartPaths.fillPath} fill="url(#gradient-chart-fill)" />

                    {/* Line path */}
                    <path d={chartPaths.linePath} stroke="var(--primary)" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* Interactive dots */}
                    {chartPaths.points.map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="4.5" fill="#00f2fe" />
                        <circle cx={pt.x} cy={pt.y} r="10" fill="none" stroke="rgba(0, 242, 254, 0.15)" strokeWidth="2" />
                        
                        {/* Text values */}
                        <text x={pt.x} y={pt.y - 12} fill="white" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                          {forecastPoints[idx].val.toLocaleString()}
                        </text>
                      </g>
                    ))}

                    {/* SVG Gradient */}
                    <defs>
                      <linearGradient id="gradient-chart-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="forecast-labels font-mono">
                    {forecastPoints.map((p, idx) => (
                      <span key={idx} className="f-lbl">{p.time}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alert Log */}
              <div className="alert-log-panel glass-panel">
                <h3>Active Alert Console</h3>
                <div className="alert-list custom-scrollbar">
                  {alerts.length === 0 ? (
                    <div className="empty-alerts">No operational alerts registered.</div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`alert-item ${alert.type} ${alert.acknowledged ? 'ack' : ''}`}>
                        <div className="alert-meta">
                          {getAlertIcon(alert.type)}
                          <div className="alert-title-wrapper">
                            <div className="alert-title">{alert.title}</div>
                            <div className="alert-message">{alert.message}</div>
                          </div>
                        </div>
                        <div className="alert-actions">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => handleAckAlert(alert.id)}
                              className="action-btn ack"
                              title="Acknowledge Alert"
                            >
                              <Check className="action-icon" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="action-btn dismiss"
                            title="Dismiss Alert"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Live Terminal Audit Feed */}
              <div className="terminal-log-panel glass-panel">
                <div className="terminal-header">
                  <Terminal className="terminal-icon" />
                  <h3>Live Audit Logs</h3>
                  <span className="term-status-badge font-mono">SECURE FEED</span>
                </div>
                <div className="terminal-body font-mono">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="terminal-line">
                      <span className="cyan-prefix">&gt;&gt;</span> {log}
                    </div>
                  ))}
                  <div className="terminal-cursor-line">
                    <span className="cyan-prefix">&gt;&gt;</span> <span className="term-cursor" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Zone Feed */}
            <div className="ops-col right">
              <div className="zones-list-panel glass-panel">
                <div className="list-header">
                  <h3>Sectors & Zones Feed</h3>
                  <span className="indicator font-mono">LIVE FEED</span>
                </div>
                <div className="zones-grid custom-scrollbar">
                  {zones.map((zone) => {
                    const filled = Math.round((zone.current / zone.capacity) * 100);
                    return (
                      <div
                        key={zone.id}
                        onClick={() => dispatch({ type: 'SELECT_ZONE', payload: zone.id })}
                        className={`zone-card-item ${zone.density}`}
                      >
                        <div className="zone-header">
                          <span className="zone-name">{zone.name}</span>
                          <span className={`density-badge ${zone.density}`}>{zone.density.toUpperCase()}</span>
                        </div>
                        <div className="zone-metrics">
                          <span className="metric font-mono">{zone.current.toLocaleString()} people</span>
                          <span className="metric font-mono">{zone.waitTime}m wait</span>
                        </div>
                        <div className="zone-bar-wrapper">
                          <div className="zone-bar">
                            <div className={`fill ${zone.density}`} style={{ width: `${filled}%` }} />
                          </div>
                          <span className="bar-val font-mono">{filled}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          background: rgba(16, 16, 28, 0.45);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .card-top .lbl {
          font-size: 9px;
          font-weight: 800;
          color: var(--text-dark);
          letter-spacing: 0.1em;
          margin-bottom: 0;
        }

        .card-top .icon {
          width: 14px;
          height: 14px;
          color: var(--text-secondary);
        }

        .card-top .icon.text-cyan { color: var(--primary); }
        .card-top .icon.text-red { color: var(--color-critical); }

        .card-val {
          font-size: 30px;
          font-weight: 900;
          margin-bottom: 12px;
          line-height: 1;
        }

        .card-val .unit {
          font-size: 11px;
          color: var(--text-dark);
          letter-spacing: 0.05em;
          font-weight: 700;
        }

        .card-progress-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          border-radius: 99px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .card-sub {
          font-size: 10px;
          color: var(--color-optimal);
          font-weight: 600;
        }

        .card-alert-indicators {
          display: flex;
          gap: 8px;
        }

        .card-alert-indicators .pill {
          font-size: 8px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid;
          letter-spacing: 0.02em;
        }

        .pill.crit {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--color-critical);
        }

        .pill.warn {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.2);
          color: var(--color-moderate);
        }

        .text-cyan { color: var(--primary); }
        .text-red { color: var(--color-critical); }
        .font-mono { font-family: var(--font-mono); }

        /* Ops Layout Grid */
        .ops-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          align-items: start;
        }

        .ops-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Control Panel */
        .control-panel {
          padding: 24px;
          background: rgba(16, 16, 28, 0.3);
        }

        .control-panel h3, .alert-log-panel h3, .zones-list-panel h3, .terminal-log-panel h3 {
          font-size: 13px;
          font-weight: 800;
          color: white;
          margin-bottom: 0;
          letter-spacing: 0.05em;
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 12px;
          margin-bottom: 12px;
        }

        .header-icon {
          width: 14px;
          height: 14px;
        }

        .card-desc {
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          margin-top: 4px;
        }

        .incident-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .incident-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          background: rgba(255, 255, 255, 0.01);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .incident-btn:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .incident-btn.active {
          background: rgba(0, 242, 254, 0.03);
          border-color: rgba(0, 242, 254, 0.25);
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.04);
        }

        .btn-inner {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .mode-name {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .mode-desc {
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .active-dot {
          color: var(--primary);
          width: 6px;
          height: 6px;
        }

        /* Forecast Chart */
        .forecast-chart-wrapper {
          background: #06060a;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 16px 20px;
        }

        .forecast-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .forecast-labels {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: var(--text-dark);
          margin-top: 8px;
          padding: 0 4px;
        }

        /* Alert Log Panel */
        .alert-log-panel {
          padding: 24px;
          height: 330px;
          display: flex;
          flex-direction: column;
          background: rgba(16, 16, 28, 0.3);
        }

        .alert-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 4px;
          margin-top: 14px;
        }

        .empty-alerts {
          text-align: center;
          font-size: 11px;
          color: var(--text-dark);
          padding-top: 40px;
          font-style: italic;
        }

        .alert-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid;
          background: rgba(255, 255, 255, 0.01);
          transition: all 0.2s;
        }

        .alert-item.critical {
          border-color: rgba(239, 68, 68, 0.15);
          background: rgba(239, 68, 68, 0.02);
        }

        .alert-item.warning {
          border-color: rgba(245, 158, 11, 0.15);
          background: rgba(245, 158, 11, 0.02);
        }

        .alert-item.success {
          border-color: rgba(16, 185, 129, 0.15);
          background: rgba(16, 185, 129, 0.02);
        }

        .alert-item.info {
          border-color: rgba(0, 242, 254, 0.15);
          background: rgba(0, 242, 254, 0.02);
        }

        .alert-item.ack {
          opacity: 0.5;
        }

        .alert-meta {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
        }

        .alert-type-icon {
          width: 14px;
          height: 14px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .alert-type-icon.crit { color: var(--color-critical); }
        .alert-type-icon.warn { color: var(--color-moderate); }
        .alert-type-icon.success { color: var(--color-optimal); }
        .alert-type-icon.info { color: var(--primary); }

        .alert-title-wrapper {
          display: flex;
          flex-direction: column;
        }

        .alert-title {
          font-size: 11px;
          font-weight: 700;
          color: white;
        }

        .alert-message {
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.4;
        }

        .alert-actions {
          display: flex;
          gap: 6px;
          margin-left: 12px;
        }

        .action-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s;
        }

        .action-btn.ack {
          border-color: rgba(16, 185, 129, 0.2);
          color: var(--color-optimal);
        }

        .action-btn.ack:hover {
          background: rgba(16, 185, 129, 0.1);
        }

        .action-btn.dismiss {
          border-color: rgba(239, 68, 68, 0.2);
          color: var(--color-critical);
        }

        .action-btn.dismiss:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .action-icon {
          width: 12px;
          height: 12px;
        }

        /* Terminal Logs */
        .terminal-log-panel {
          padding: 20px;
          background: rgba(8, 8, 12, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 10px;
        }

        .terminal-icon {
          width: 14px;
          height: 14px;
          color: var(--primary);
        }

        .term-status-badge {
          font-size: 8px;
          font-weight: 700;
          color: var(--color-optimal);
          border: 1px solid rgba(16, 185, 129, 0.25);
          background: rgba(16, 185, 129, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: auto;
        }

        .terminal-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 10px;
          color: var(--text-secondary);
          line-height: 1.4;
          padding: 8px 12px;
          background: #030305;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.02);
        }

        .cyan-prefix {
          color: var(--primary);
          font-weight: bold;
        }

        .terminal-cursor-line {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .term-cursor {
          width: 6px;
          height: 12px;
          background: var(--primary);
          animation: terminal-blink 1.2s infinite;
        }

        @keyframes terminal-blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        /* Zones Feed List */
        .zones-list-panel {
          padding: 24px;
          height: 980px;
          display: flex;
          flex-direction: column;
          background: rgba(16, 16, 28, 0.35);
        }

        .list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 14px;
        }

        .list-header .indicator {
          font-size: 8px;
          font-weight: 700;
          background: rgba(0, 242, 254, 0.06);
          border: 1px solid rgba(0, 242, 254, 0.15);
          color: var(--primary);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .zones-grid {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
          padding-right: 4px;
        }

        .zone-card-item {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          background: rgba(255, 255, 255, 0.015);
          cursor: pointer;
          transition: all 0.2s;
        }

        .zone-card-item:hover {
          background: rgba(255, 255, 255, 0.025);
          border-color: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .zone-card-item.critical { border-left: 3px solid var(--color-critical); }
        .zone-card-item.high { border-left: 3px solid var(--color-high); }
        .zone-card-item.moderate { border-left: 3px solid var(--color-moderate); }
        .zone-card-item.optimal { border-left: 3px solid var(--color-optimal); }

        .zone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .zone-name {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .density-badge {
          font-size: 8px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.02em;
        }

        .density-badge.optimal { background: var(--color-optimal-glow); color: var(--color-optimal); }
        .density-badge.moderate { background: var(--color-moderate-glow); color: var(--color-moderate); }
        .density-badge.high { background: var(--color-high-glow); color: var(--color-high); }
        .density-badge.critical { background: var(--color-critical-glow); color: var(--color-critical); }

        .zone-metrics {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .zone-bar-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .zone-bar {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .zone-bar .fill {
          height: 100%;
          border-radius: 99px;
        }

        .zone-bar .fill.optimal { background-color: var(--color-optimal); }
        .zone-bar .fill.moderate { background-color: var(--color-moderate); }
        .zone-bar .fill.high { background-color: var(--color-high); }
        .zone-bar .fill.critical { background-color: var(--color-critical); }

        .bar-val {
          font-size: 9px;
          color: var(--text-dark);
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
          .ops-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
