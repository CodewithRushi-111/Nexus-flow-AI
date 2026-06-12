'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ShieldAlert, Cpu, Route, Compass, Info } from 'lucide-react';
import { useFlow } from '../context/FlowContext';

export default function NavigationSidebar() {
  const pathname = usePathname();
  const { state } = useFlow();
  const { activeIncidentMode, stats } = state;

  const menuItems = [
    { name: 'Control Center', path: '/operations', icon: Cpu },
    { name: 'Spatial Map', path: '/floorplan', icon: Compass },
    { name: 'Routing Engine', path: '/routes', icon: Route },
    { name: 'Flow Copilot', path: '/copilot', icon: Activity },
  ];

  const getIncidentLabel = () => {
    switch (activeIncidentMode) {
      case 'concert_rush': return 'CONCERT RUSH';
      case 'match_day': return 'MATCH EGRESS';
      case 'concourse_incident': return 'OBSTRUCTION';
      case 'evacuation_drill': return 'EVAC DRILL';
      case 'standard':
      default:
        return 'STANDARD';
    }
  };

  const getIncidentStatusClass = () => {
    if (activeIncidentMode === 'evacuation_drill') return 'status-evac';
    if (activeIncidentMode !== 'standard') return 'status-active';
    return 'status-ok';
  };

  return (
    <aside className="sidebar-container glass-panel-accent">
      <div className="brand-section">
        <Link href="/" className="brand-link">
          <div className="brand-icon-wrapper">
            <ShieldAlert className="brand-icon" />
          </div>
          <div className="brand-text">
            <span>NEXUSFLOW</span>
            <span className="accent">AI</span>
          </div>
        </Link>
      </div>

      <nav className="nav-links">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-link-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-link-icon" />
              <span>{item.name}</span>
              {item.name === 'Flow Copilot' && stats.activeAlertsCount > 0 && (
                <span className="nav-badge">{stats.activeAlertsCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className={`mode-card ${getIncidentStatusClass()}`}>
          <div className="mode-header">
            <span className="dot" />
            <span className="mode-title">SYSTEM PROTOCOL</span>
          </div>
          <div className="mode-value">{getIncidentLabel()}</div>
          <div className="mode-meta">Score: {stats.aiOptimizationScore}%</div>
        </div>
        <div className="system-version">NexusFlow Core v3.0.4</div>
      </div>

      <style jsx>{`
        .sidebar-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 260px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0;
          background: rgba(8, 8, 14, 0.85);
          padding: 24px 16px;
          flex-shrink: 0;
        }

        .brand-section {
          padding-bottom: 28px;
          border-b: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 24px;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.1);
        }

        .brand-icon {
          width: 18px;
          height: 18px;
          color: var(--primary);
        }

        .brand-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.1em;
          color: white;
          display: flex;
          flex-direction: column;
        }

        .brand-text .accent {
          color: var(--primary);
          font-size: 11px;
          letter-spacing: 0.25em;
          margin-top: 1px;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-link-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid transparent;
        }

        .nav-link-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(2px);
        }

        .nav-link-item.active {
          color: var(--primary);
          background: rgba(0, 242, 254, 0.06);
          border-color: rgba(0, 242, 254, 0.15);
          box-shadow: inset 0 0 8px rgba(0, 242, 254, 0.05);
        }

        .nav-link-icon {
          width: 18px;
          height: 18px;
        }

        .nav-badge {
          margin-left: auto;
          background: var(--color-critical);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 99px;
          font-family: var(--font-mono);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mode-card {
          border-radius: 12px;
          padding: 12px 14px;
          border: 1px solid;
          background: rgba(255, 255, 255, 0.02);
        }

        .mode-card.status-ok {
          border-color: rgba(16, 185, 129, 0.15);
          background: rgba(16, 185, 129, 0.02);
        }
        .mode-card.status-ok .dot {
          background-color: var(--color-optimal);
          box-shadow: 0 0 8px var(--color-optimal);
        }
        .mode-card.status-ok .mode-value {
          color: var(--color-optimal);
        }

        .mode-card.status-active {
          border-color: rgba(249, 115, 22, 0.2);
          background: rgba(249, 115, 22, 0.03);
          animation: pulse-active 3s infinite alternate;
        }
        .mode-card.status-active .dot {
          background-color: var(--color-high);
          box-shadow: 0 0 8px var(--color-high);
        }
        .mode-card.status-active .mode-value {
          color: var(--color-high);
        }

        .mode-card.status-evac {
          border-color: rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.04);
          animation: pulse-evac 1.5s infinite alternate;
        }
        .mode-card.status-evac .dot {
          background-color: var(--color-critical);
          box-shadow: 0 0 8px var(--color-critical);
        }
        .mode-card.status-evac .mode-value {
          color: var(--color-critical);
        }

        @keyframes pulse-active {
          0% { border-color: rgba(249, 115, 22, 0.15); }
          100% { border-color: rgba(249, 115, 22, 0.35); }
        }
        @keyframes pulse-evac {
          0% { border-color: rgba(239, 68, 68, 0.2); }
          100% { border-color: rgba(239, 68, 68, 0.5); }
        }

        .mode-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .mode-title {
          font-size: 9px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
        }

        .mode-value {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 2px;
        }

        .mode-meta {
          font-size: 10px;
          color: var(--text-dark);
          font-weight: 500;
        }

        .system-version {
          font-size: 9px;
          color: var(--text-dark);
          text-align: center;
          font-family: var(--font-mono);
        }
      `}</style>
    </aside>
  );
}
