'use client';

import React from 'react';
import { useFlow } from '../context/FlowContext';
import { UserCheck, ShieldAlert, Award, Clock, ArrowUpRight } from 'lucide-react';

export default function StaffDispatch() {
  const { state } = useFlow();
  const { staff, zones } = state;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'var(--color-optimal)';
      case 'en-route': return 'var(--color-moderate)';
      case 'dispatched': return 'var(--primary)';
      default: return 'var(--text-dark)';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'security': return '🛡️';
      case 'medical': return '🚨';
      case 'logistics': return '📦';
      case 'services':
      default:
        return '👥';
    }
  };

  const getZoneName = (zoneId?: string) => {
    if (!zoneId) return '';
    const zone = zones.find((z) => z.id === zoneId);
    return zone ? zone.name : 'Unknown Area';
  };

  return (
    <div className="staff-dispatch-container glass-panel">
      <div className="card-header">
        <UserCheck className="header-icon" />
        <div>
          <h2>Response Teams & Dispatch</h2>
          <p className="subtitle">Real-time status of security, medical, and services staff</p>
        </div>
        <div className="available-count font-mono">
          {staff.filter((s) => s.status === 'idle').length} <span className="label">FREE</span>
        </div>
      </div>

      <div className="staff-grid custom-scrollbar">
        {staff.map((member) => {
          const statusColor = getStatusColor(member.status);
          const activeZoneName = getZoneName(member.zoneId);

          return (
            <div key={member.id} className="staff-card">
              <div className="card-top">
                <span className="role-icon">{getRoleIcon(member.role)}</span>
                <div className="member-details">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role.toUpperCase()}</div>
                </div>
                <div className="status-indicator" style={{ color: statusColor }}>
                  <span className="dot status-dot active" style={{ color: statusColor }} />
                  <span className="status-text">{member.status.toUpperCase()}</span>
                </div>
              </div>

              {member.status !== 'idle' ? (
                <div className="dispatch-details animate-slide-up">
                  <div className="dispatch-row">
                    <ArrowUpRight className="row-icon" />
                    <span className="row-label">Location:</span>
                    <span className="row-val highlight">{activeZoneName}</span>
                  </div>
                  <div className="dispatch-row">
                    <Clock className="row-icon" />
                    <span className="row-label">Task:</span>
                    <span className="row-val truncate-task" title={member.assignedTask}>
                      {member.assignedTask}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="dispatch-idle">
                  <span>Available for immediate deployment</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .staff-dispatch-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(12, 12, 20, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          padding-bottom: 16px;
        }

        .header-icon {
          width: 20px;
          height: 20px;
          color: var(--primary);
        }

        .card-header h2 {
          font-size: 15px;
          font-weight: 800;
          color: white;
        }

        .card-header .subtitle {
          font-size: 10px;
          color: var(--text-secondary);
          margin-top: 1px;
        }

        .available-count {
          margin-left: auto;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--color-optimal);
          font-size: 12px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .available-count .label {
          font-size: 8px;
          color: var(--text-secondary);
          margin-left: 2px;
        }

        .staff-grid {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          padding-right: 4px;
        }

        .staff-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 108px;
          transition: all 0.2s;
        }

        .staff-card:hover {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.025);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .role-icon {
          font-size: 16px;
        }

        .member-details {
          flex: 1;
        }

        .member-name {
          font-size: 12px;
          font-weight: 700;
          color: white;
        }

        .member-role {
          font-size: 9px;
          color: var(--text-dark);
          font-weight: 600;
          margin-top: 1px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-indicator .dot {
          width: 5px;
          height: 5px;
        }

        .status-text {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .dispatch-details {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 8px;
          font-size: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
        }

        .dispatch-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .row-icon {
          width: 10px;
          height: 10px;
          color: var(--text-dark);
        }

        .row-label {
          color: var(--text-secondary);
          font-weight: 500;
          width: 48px;
        }

        .row-val {
          color: white;
          font-weight: 600;
        }

        .row-val.highlight {
          color: var(--primary);
        }

        .truncate-task {
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dispatch-idle {
          margin-top: auto;
          text-align: center;
          font-size: 9px;
          color: var(--text-dark);
          font-style: italic;
          border-top: 1px dashed rgba(255, 255, 255, 0.03);
          padding-top: 6px;
        }

        .font-mono {
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}
