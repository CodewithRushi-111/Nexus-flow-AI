'use client';

import React from 'react';
import NavigationSidebar from '../../components/NavigationSidebar';
import Header from '../../components/Header';
import InteractiveFloorplan from '../../components/InteractiveFloorplan';
import StaffDispatch from '../../components/StaffDispatch';

export default function FloorplanPage() {
  return (
    <div className="dashboard-layout">
      <NavigationSidebar />
      <div className="main-content">
        <Header title="Spatial Map & Telemetry" />
        
        <main className="scrollable-body floorplan-main custom-scrollbar">
          <div className="floorplan-layout-grid">
            <div className="map-column">
              <InteractiveFloorplan />
            </div>
            
            <div className="sidebar-column">
              <StaffDispatch />
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .floorplan-main {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: calc(100vh - 70px);
          overflow: hidden;
        }

        .floorplan-layout-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          height: 100%;
          align-items: stretch;
        }

        .map-column {
          height: 100%;
          min-height: 480px;
        }

        .sidebar-column {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1100px) {
          .floorplan-layout-grid {
            grid-template-columns: 1fr;
            height: auto;
            overflow-y: auto;
          }
          .floorplan-main {
            overflow-y: auto;
          }
          .map-column {
            height: 520px;
          }
          .sidebar-column {
            height: 450px;
          }
        }
      `}</style>
    </div>
  );
}
