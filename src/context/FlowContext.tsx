'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Zone, Alert, Staff, Stats, IncidentMode } from '../lib/types';
import {
  INITIAL_ZONES,
  INITIAL_STAFF,
  generateInitialAlerts,
  applyIncidentEffect,
  getDensityLevel,
  calculateQueueWaitTime,
} from '../lib/simulator';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

interface FlowContextState {
  zones: Zone[];
  alerts: Alert[];
  staff: Staff[];
  stats: Stats;
  selectedZoneId: string | null;
  activeIncidentMode: IncidentMode;
}

type FlowAction =
  | { type: 'SET_ZONES'; payload: Zone[] }
  | { type: 'SET_ALERTS'; payload: Alert[] }
  | { type: 'SET_STAFF'; payload: Staff[] }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'ACK_ALERT'; payload: string }
  | { type: 'TRIGGER_INCIDENT'; payload: IncidentMode }
  | { type: 'DEPLOY_STAFF'; payload: { staffId: string; zoneId: string; task: string } }
  | { type: 'SIMULATION_TICK' }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'SET_INCIDENT_MODE'; payload: IncidentMode };

const calculateStats = (zones: Zone[], alerts: Alert[]): Stats => {
  const liveOccupancy = zones.reduce((sum, z) => sum + z.current, 0);
  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const criticalCount = zones.filter((z) => z.density === 'critical').length;
  const highCount = zones.filter((z) => z.density === 'high').length;
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  let score = 98;
  score -= criticalCount * 8;
  score -= highCount * 3;
  score -= unacknowledgedCount * 1.5;
  score = Math.max(45, Math.min(100, Math.round(score)));

  const baseThroughput = Math.round(liveOccupancy * 0.08);
  const penalty = criticalCount * 80;
  const throughputRate = Math.max(15, baseThroughput - penalty);

  return {
    liveOccupancy,
    totalCapacity,
    aiOptimizationScore: score,
    activeAlertsCount: unacknowledgedCount,
    throughputRate,
  };
};

const initialState: FlowContextState = {
  zones: INITIAL_ZONES,
  alerts: generateInitialAlerts(),
  staff: INITIAL_STAFF,
  stats: {
    liveOccupancy: 0,
    totalCapacity: 0,
    aiOptimizationScore: 100,
    activeAlertsCount: 0,
    throughputRate: 0,
  },
  selectedZoneId: null,
  activeIncidentMode: 'standard',
};

// Compute actual initial stats
initialState.stats = calculateStats(initialState.zones, initialState.alerts);

function flowReducer(state: FlowContextState, action: FlowAction): FlowContextState {
  switch (action.type) {
    case 'SET_ZONES':
      return {
        ...state,
        zones: action.payload,
        stats: calculateStats(action.payload, state.alerts),
      };

    case 'SET_ALERTS':
      return {
        ...state,
        alerts: action.payload,
        stats: calculateStats(state.zones, action.payload),
      };

    case 'SET_STAFF':
      return {
        ...state,
        staff: action.payload,
      };

    case 'SET_INCIDENT_MODE':
      return {
        ...state,
        activeIncidentMode: action.payload,
      };

    case 'SELECT_ZONE':
      return {
        ...state,
        selectedZoneId: action.payload,
      };

    case 'ACK_ALERT': {
      if (isFirebaseConfigured && db) {
        // Write to Firebase - this triggers state updates via onSnapshot
        updateDoc(doc(db, 'alerts', action.payload), { acknowledged: true }).catch(console.error);
        return state;
      }

      const updatedAlerts = state.alerts.map((a) =>
        a.id === action.payload ? { ...a, acknowledged: true } : a
      );
      return {
        ...state,
        alerts: updatedAlerts,
        stats: calculateStats(state.zones, updatedAlerts),
      };
    }

    case 'DISMISS_ALERT': {
      if (isFirebaseConfigured && db) {
        deleteDoc(doc(db, 'alerts', action.payload)).catch(console.error);
        return state;
      }

      const updatedAlerts = state.alerts.filter((a) => a.id !== action.payload);
      return {
        ...state,
        alerts: updatedAlerts,
        stats: calculateStats(state.zones, updatedAlerts),
      };
    }

    case 'TRIGGER_INCIDENT': {
      const { zones: newZones, alerts: incidentAlerts } = applyIncidentEffect(
        state.zones,
        action.payload
      );
      const combinedAlerts = [...incidentAlerts, ...state.alerts].slice(0, 30);

      if (isFirebaseConfigured && db) {
        // Update Firestore in batch
        const batch = writeBatch(db);
        
        // Update all zones
        newZones.forEach((z) => {
          batch.set(doc(db, 'zones', z.id), z);
        });

        // Add the new incident alerts
        incidentAlerts.forEach((alert) => {
          const alertDocRef = doc(db, 'alerts', alert.id);
          batch.set(alertDocRef, {
            ...alert,
            timestamp: Timestamp.fromDate(alert.timestamp),
          });
        });

        // Update active incident mode document
        batch.set(doc(db, 'metadata', 'state'), { activeIncidentMode: action.payload });

        batch.commit().catch(console.error);
        return state;
      }

      return {
        ...state,
        zones: newZones,
        alerts: combinedAlerts,
        activeIncidentMode: action.payload,
        stats: calculateStats(newZones, combinedAlerts),
      };
    }

    case 'DEPLOY_STAFF': {
      const targetZone = state.zones.find((z) => z.id === action.payload.zoneId);
      const staffMember = state.staff.find((s) => s.id === action.payload.staffId);
      
      const newAlert: Alert = {
        id: `deploy-notification-${Date.now()}`,
        type: 'success',
        title: 'Response Team Dispatched',
        message: `${staffMember?.name} dispatched to ${targetZone?.name || 'Zone'} for task: "${action.payload.task}".`,
        timestamp: new Date(),
        acknowledged: false,
      };

      if (isFirebaseConfigured && db) {
        const batch = writeBatch(db);
        // Update staff member
        batch.update(doc(db, 'staff', action.payload.staffId), {
          status: 'en-route',
          zoneId: action.payload.zoneId,
          assignedTask: action.payload.task,
        });
        // Add dispatch alert notification
        batch.set(doc(db, 'alerts', newAlert.id), {
          ...newAlert,
          timestamp: Timestamp.fromDate(newAlert.timestamp),
        });
        batch.commit().catch(console.error);
        return state;
      }

      const updatedStaff = state.staff.map((s) =>
        s.id === action.payload.staffId
          ? {
              ...s,
              status: 'en-route' as const,
              zoneId: action.payload.zoneId,
              assignedTask: action.payload.task,
            }
          : s
      );

      return {
        ...state,
        staff: updatedStaff,
        alerts: [newAlert, ...state.alerts],
        stats: calculateStats(state.zones, [newAlert, ...state.alerts]),
      };
    }

    case 'SIMULATION_TICK': {
      if (state.activeIncidentMode === 'evacuation_drill') {
        return state;
      }

      let hasNewCritical = false;
      let newAlertZone: Zone | null = null;

      const updatedZones = state.zones.map((z) => {
        const changePercent = (Math.random() - 0.5) * 0.04;
        const change = Math.round(z.capacity * changePercent);
        let newCurrent = Math.max(0, Math.min(z.capacity, z.current + change));

        const density = getDensityLevel(newCurrent, z.capacity);

        const waitTime = calculateQueueWaitTime(newCurrent, z.capacity);

        if (density === 'critical' && z.density !== 'critical') {
          hasNewCritical = true;
          newAlertZone = z;
        }

        return {
          ...z,
          current: newCurrent,
          density,
          waitTime,
        };
      });

      const updatedStaff = state.staff.map((s) => {
        if (s.status === 'en-route') {
          return { ...s, status: 'dispatched' as const };
        } else if (s.status === 'dispatched' && Math.random() > 0.8) {
          return { ...s, status: 'idle' as const, zoneId: undefined, assignedTask: undefined };
        }
        return s;
      });

      const newAlerts = [...state.alerts];
      let triggeredAlert: Alert | null = null;

      if (hasNewCritical && newAlertZone) {
        triggeredAlert = {
          id: `alt-tick-${Date.now()}`,
          type: 'warning',
          title: 'Density Threshold Exceeded',
          message: `${(newAlertZone as Zone).name} has reached critical density. Recommending crowd redirection.`,
          timestamp: new Date(),
          acknowledged: false,
          zoneId: (newAlertZone as Zone).id,
        };
        newAlerts.unshift(triggeredAlert);
      }

      if (isFirebaseConfigured && db) {
        // Push tick fluctuations to Firestore so database is kept alive
        const batch = writeBatch(db);
        
        updatedZones.forEach((z) => {
          batch.set(doc(db, 'zones', z.id), z);
        });

        updatedStaff.forEach((s) => {
          batch.set(doc(db, 'staff', s.id), s);
        });

        if (triggeredAlert) {
          batch.set(doc(db, 'alerts', triggeredAlert.id), {
            ...triggeredAlert,
            timestamp: Timestamp.fromDate(triggeredAlert.timestamp),
          });
        }

        batch.commit().catch(console.error);
        return state;
      }

      return {
        ...state,
        zones: updatedZones,
        staff: updatedStaff,
        alerts: newAlerts,
        stats: calculateStats(updatedZones, newAlerts),
      };
    }

    default:
      return state;
  }
}

const FlowContext = createContext<{
  state: FlowContextState;
  dispatch: React.Dispatch<FlowAction>;
} | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(flowReducer, initialState);

  // Seeding and Firestore Listeners
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const seedDatabase = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'zones'));
        if (querySnapshot.empty) {
          console.log('Seeding initial Firestore venue database...');
          const batch = writeBatch(db);
          
          INITIAL_ZONES.forEach((z) => {
            batch.set(doc(db, 'zones', z.id), z);
          });

          INITIAL_STAFF.forEach((s) => {
            batch.set(doc(db, 'staff', s.id), s);
          });

          generateInitialAlerts().forEach((a) => {
            batch.set(doc(db, 'alerts', a.id), {
              ...a,
              timestamp: Timestamp.fromDate(a.timestamp),
            });
          });

          batch.set(doc(db, 'metadata', 'state'), { activeIncidentMode: 'standard' });
          await batch.commit();
          console.log('Firestore seed complete.');
        }
      } catch (err) {
        console.error('Error seeding Firestore database:', err);
      }
    };

    seedDatabase();

    // Listeners for collections
    const unsubZones = onSnapshot(collection(db, 'zones'), (snapshot) => {
      const zonesData: Zone[] = [];
      snapshot.forEach((doc) => {
        zonesData.push(doc.data() as Zone);
      });
      if (zonesData.length > 0) {
        dispatch({ type: 'SET_ZONES', payload: zonesData });
      }
    });

    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const staffData: Staff[] = [];
      snapshot.forEach((doc) => {
        staffData.push(doc.data() as Staff);
      });
      if (staffData.length > 0) {
        dispatch({ type: 'SET_STAFF', payload: staffData });
      }
    });

    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      const alertsData: Alert[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        alertsData.push({
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
        } as Alert);
      });
      // Sort newest alerts first
      alertsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      dispatch({ type: 'SET_ALERTS', payload: alertsData });
    });

    const unsubMeta = onSnapshot(doc(db, 'metadata', 'state'), (doc) => {
      if (doc.exists()) {
        const mode = doc.data().activeIncidentMode as IncidentMode;
        dispatch({ type: 'SET_INCIDENT_MODE', payload: mode });
      }
    });

    return () => {
      unsubZones();
      unsubStaff();
      unsubAlerts();
      unsubMeta();
    };
  }, []);

  // Setup live simulator loop (ticks every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'SIMULATION_TICK' });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}
