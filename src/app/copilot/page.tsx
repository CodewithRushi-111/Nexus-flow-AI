'use client';

import React from 'react';
import NavigationSidebar from '../../components/NavigationSidebar';
import Header from '../../components/Header';
import CopilotWindow from '../../components/CopilotWindow';
import { useFlow } from '../../context/FlowContext';
import { Terminal, ShieldCheck, Activity, Cpu, Play } from 'lucide-react';

export default function CopilotPage() {
  const { state } = useFlow();
  const { stats, alerts, zones, activeIncidentMode } = state;

  const criticalAlerts = alerts.filter((a) => a.type === 'critical' && !a.acknowledged);

  return (
    <div className="dashboard-layout">
      <NavigationSidebar />
      <div className="main-content">
        <Header title="Flow Copilot Neural Link" />
        
        <main className="scrollable-body copilot-main-body custom-scrollbar">
          <div className="copilot-grid-layout">
            {/* Copilot Chat Window */}
            <div className="chat-window-col">
              <CopilotWindow />
            </div>

            {/* Live Metrics Side Panel */}
            <div className="telemetry-side-col">
              {/* Telemetry Snapshot Card */}
              <div className="telemetry-card glass-panel">
                <div className="card-header">
                  <Terminal className="header-icon text-cyan" />
                  <h4>Live Telemetry Snapshot</h4>
                </div>
                <div className="telemetry-details font-mono">
                  <div className="tel-row">
                    <span className="lbl">OCCUPANCY:</span>
                    <span className="val">{stats.liveOccupancy.toLocaleString()}</span>
                  </div>
                  <div className="tel-row">
                    <span className="lbl">OPTIMIZATION:</span>
                    <span className="val text-cyan">{stats.aiOptimizationScore}%</span>
                  </div>
                  <div className="tel-row">
                    <span className="lbl">ACTIVE MODE:</span>
                    <span className="val text-purple">{activeIncidentMode.toUpperCase()}</span>
                  </div>
                  <div className="tel-row">
                    <span className="lbl">ALERT COUNT:</span>
                    <span className="val text-red">{stats.activeAlertsCount} unack</span>
                  </div>
                </div>
              </div>

              {/* Connected Networks Status */}
              <div className="telemetry-card glass-panel">
                <div className="card-header">
                  <Activity className="header-icon text-purple" />
                  <h4>Connected Systems</h4>
                </div>
                <div className="connection-checklist font-sans">
                  {[
                    { name: 'IoT Multi-Sensor Grid', status: 'ONLINE', details: '40,000+ points synced' },
                    { name: 'Google Gemini Flash Core', status: 'SYNCHRONIZED', details: 'Latency <12ms' },
                    { name: 'Flow-Control Dispatch Hub', status: 'ONLINE', details: '8 active dispatch zones' },
                  ].map((sys, idx) => (
                    <div key={idx} className="system-checklist-item">
                      <div className="status-dot-wrapper">
                        <span className="status-dot active status-ok-dot" />
                      </div>
                      <div className="system-info">
                        <div className="system-name">{sys.name}</div>
                        <div className="system-details">{sys.details}</div>
                      </div>
                      <span className="system-status-val font-mono">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgent Action Alerts */}
              <div className="telemetry-card glass-panel">
                <div className="card-header">
                  <Cpu className="header-icon text-red" />
                  <h4>Urgent Directives</h4>
                </div>
                <div className="directives-feed">
                  {criticalAlerts.length === 0 ? (
                    <div className="empty-directives font-mono">
                      <span>NO URGENT ACTIONS DETECTED</span>
                      <p>Neural flow optimization is operating within standard comfort targets.</p>
                    </div>
                  ) : (
                    criticalAlerts.map((alert) => (
                      <div key={alert.id} className="directive-alert-card font-sans">
                        <div className="directive-top">
                          <span className="directive-crit-badge">CRITICAL</span>
                          <span className="directive-zone font-mono">{zones.find((z) => z.id === alert.zoneId)?.name || 'General'}</span>
                        </div>
                        <p className="directive-text">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .copilot-main-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 70px);
          overflow: hidden;
        }

        .copilot-grid-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          height: 100%;
          align-items: stretch;
        }

        .chat-window-col {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .telemetry-side-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .telemetry-card {
          padding: 20px;
          background: rgba(16, 16, 28, 0.4);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 12px;
          margin-bottom: 14px;
        }

        .header-icon {
          width: 15px;
          height: 15px;
        }

        .header-icon.text-cyan { color: var(--primary); }
        .header-icon.text-purple { color: var(--secondary); }
        .header-icon.text-red { color: var(--color-critical); }

        .card-header h4 {
          font-size: 12px;
          font-weight: 800;
          color: white;
          letter-spacing: 0.05em;
        }

        .telemetry-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 11px;
        }

        .tel-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.03);
          padding-bottom: 6px;
        }

        .tel-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .tel-row .lbl {
          color: var(--text-dark);
          font-weight: 700;
        }

        .tel-row .val {
          color: white;
          font-weight: 700;
        }

        .text-cyan { color: var(--primary) !important; }
        .text-purple { color: var(--secondary) !important; }
        .text-red { color: var(--color-critical) !important; }

        /* Checklist */
        .connection-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .system-checklist-item {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          padding: 8px 12px;
          border-radius: 8px;
        }

        .status-dot-wrapper {
          margin-right: 10px;
          display: flex;
          align-items: center;
        }

        .status-ok-dot {
          color: var(--color-optimal);
          width: 5px;
          height: 5px;
        }

        .system-info {
          flex: 1;
        }

        .system-name {
          font-size: 11px;
          font-weight: 700;
          color: white;
        }

        .system-details {
          font-size: 9px;
          color: var(--text-dark);
          margin-top: 1px;
        }

        .system-status-val {
          font-size: 8px;
          font-weight: 800;
          color: var(--color-optimal);
        }

        /* Directives */
        .directives-feed {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .empty-directives {
          text-align: center;
          font-size: 9px;
          color: var(--text-dark);
          padding: 12px 0;
          border: 1px dashed rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.005);
        }

        .empty-directives p {
          font-size: 8px;
          margin-top: 4px;
        }

        .directive-alert-card {
          background: rgba(239, 68, 68, 0.03);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 10px;
          padding: 10px 12px;
        }

        .directive-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .directive-crit-badge {
          background: var(--color-critical);
          color: white;
          font-size: 8px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .directive-zone {
          font-size: 9px;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .directive-text {
          font-size: 10px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .font-mono { font-family: var(--font-mono); }

        @media (max-width: 1100px) {
          .copilot-grid-layout {
            grid-template-columns: 1fr;
            height: auto;
          }
          .copilot-main-body {
            overflow-y: auto;
          }
          .chat-window-col {
            height: 500px;
          }
          .telemetry-side-col {
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
    </div>
  );
}
