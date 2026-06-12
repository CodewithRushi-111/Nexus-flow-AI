'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, ShieldAlert, BarChart3, AlertCircle } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

export default function Header({ title }: { title: string }) {
  const { state } = useFlow();
  const { stats, alerts } = state;
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <header className="header-container glass-panel">
      <div className="title-section">
        <h1>{title}</h1>
        <div className="pulse-indicator-wrapper">
          <span className="pulse-indicator status-dot active" />
          <span className="pulse-text">AI FLOW RESOLVER CONNECTED</span>
        </div>
      </div>

      <div className="metrics-section">
        {/* Occupancy Mini Metric */}
        <div className="mini-metric">
          <div className="metric-icon-wrapper cyan">
            <BarChart3 className="metric-icon" />
          </div>
          <div className="metric-details">
            <div className="metric-label">TOTAL OCCUPANCY</div>
            <div className="metric-value font-mono">
              {stats.liveOccupancy.toLocaleString()}{' '}
              <span className="slash">/</span>{' '}
              <span className="total">{stats.totalCapacity.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Optimisation Score Mini Metric */}
        <div className="mini-metric">
          <div className="metric-icon-wrapper purple">
            <ShieldAlert className="metric-icon" />
          </div>
          <div className="metric-details">
            <div className="metric-label">AI OPTIMIZATION</div>
            <div className={`metric-value font-mono ${stats.aiOptimizationScore < 70 ? 'warn' : 'ok'}`}>
              {stats.aiOptimizationScore}%
            </div>
          </div>
        </div>

        {/* Live System Time */}
        <div className="system-time-wrapper">
          <span className="time-label">LIVE SYSTEM TIME</span>
          <span className="time-value font-mono">{time || '00:00:00'}</span>
        </div>

        <div className="connection-badge">
          <Wifi className="wifi-icon" />
          <span>SIMULATOR LIVE</span>
        </div>
      </div>

      <style jsx>{`
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          height: 70px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0;
          background: rgba(10, 10, 16, 0.7);
          flex-shrink: 0;
        }

        .title-section h1 {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.02em;
          font-family: var(--font-sans);
          color: white;
        }

        .pulse-indicator-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        .pulse-indicator {
          color: var(--primary);
          width: 5px;
          height: 5px;
        }

        .pulse-text {
          font-size: 9px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.05em;
        }

        .metrics-section {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .mini-metric {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-icon-wrapper {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }

        .metric-icon-wrapper.cyan {
          background: rgba(0, 242, 254, 0.06);
          border-color: rgba(0, 242, 254, 0.15);
          color: var(--primary);
        }

        .metric-icon-wrapper.purple {
          background: rgba(161, 84, 242, 0.06);
          border-color: rgba(161, 84, 242, 0.15);
          color: var(--secondary);
        }

        .metric-icon {
          width: 14px;
          height: 14px;
        }

        .metric-details {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.08em;
        }

        .metric-value {
          font-size: 12px;
          font-weight: 700;
          color: white;
          margin-top: 1px;
        }

        .metric-value .slash, .metric-value .total {
          color: var(--text-dark);
          font-weight: 500;
        }

        .metric-value.ok {
          color: var(--color-optimal);
        }

        .metric-value.warn {
          color: var(--color-critical);
          text-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
        }

        .system-time-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .time-label {
          font-size: 8px;
          font-weight: 700;
          color: var(--text-dark);
          letter-spacing: 0.1em;
        }

        .time-value {
          font-size: 14px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.02em;
        }

        .connection-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .wifi-icon {
          width: 12px;
          height: 12px;
          color: var(--color-optimal);
        }

        .font-mono {
          font-family: var(--font-mono);
        }

        @media (max-width: 900px) {
          .mini-metric {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
