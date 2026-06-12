import { Zone, Alert, Staff, Stats, IncidentMode, DensityLevel } from './types';

export const INITIAL_ZONES: Zone[] = [
  { id: 'z-gate-a', name: 'Main Gate A (North)', section: 'North Wing', type: 'gate', capacity: 3000, current: 850, density: 'optimal', waitTime: 3, x: 50, y: 12 },
  { id: 'z-gate-b', name: 'West Gate B', section: 'West Wing', type: 'gate', capacity: 2500, current: 1800, density: 'high', waitTime: 12, x: 15, y: 45 },
  { id: 'z-gate-c', name: 'East Gate C', section: 'East Wing', type: 'gate', capacity: 2500, current: 720, density: 'optimal', waitTime: 2, x: 85, y: 45 },
  { id: 'z-gate-d', name: 'South Plaza Gate D', section: 'South Wing', type: 'gate', capacity: 4000, current: 950, density: 'optimal', waitTime: 4, x: 50, y: 88 },
  { id: 'z-con-1', name: 'North Concourse 1', section: 'North Wing', type: 'concourse', capacity: 5000, current: 2100, density: 'moderate', waitTime: 5, x: 50, y: 28 },
  { id: 'z-con-2', name: 'West Corridor Loop', section: 'West Wing', type: 'concourse', capacity: 3500, current: 3100, density: 'critical', waitTime: 18, x: 30, y: 50 },
  { id: 'z-con-3', name: 'East Galleria', section: 'East Wing', type: 'concourse', capacity: 3500, current: 1450, density: 'optimal', waitTime: 2, x: 70, y: 50 },
  { id: 'z-con-4', name: 'South Concourse 4', section: 'South Wing', type: 'concourse', capacity: 5000, current: 1200, density: 'optimal', waitTime: 1, x: 50, y: 72 },
  { id: 'z-rest-1', name: 'North Restrooms & Cafe', section: 'North Wing', type: 'dining', capacity: 800, current: 620, density: 'high', waitTime: 9, x: 38, y: 24 },
  { id: 'z-rest-2', name: 'West Food Pavilion', section: 'West Wing', type: 'dining', capacity: 1500, current: 1420, density: 'critical', waitTime: 16, x: 25, y: 65 },
  { id: 'z-rest-3', name: 'East Food Court', section: 'East Wing', type: 'dining', capacity: 1500, current: 480, density: 'optimal', waitTime: 2, x: 75, y: 65 },
  { id: 'z-rest-4', name: 'South Terrace Dining', section: 'South Wing', type: 'dining', capacity: 1000, current: 350, density: 'optimal', waitTime: 1, x: 62, y: 76 },
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'st-01', name: 'Commander Chen', role: 'security', status: 'idle' },
  { id: 'st-02', name: 'Officer Brooks', role: 'security', status: 'idle' },
  { id: 'st-03', name: 'Officer Jenkins', role: 'security', status: 'idle' },
  { id: 'st-04', name: 'Medic Sarah', role: 'medical', status: 'idle' },
  { id: 'st-05', name: 'Medic Diaz', role: 'medical', status: 'idle' },
  { id: 'st-06', name: 'Marshall Vance', role: 'logistics', status: 'idle' },
  { id: 'st-07', name: 'Steward Riley', role: 'services', status: 'idle' },
  { id: 'st-08', name: 'Steward Kim', role: 'services', status: 'idle' },
];

export function getDensityLevel(current: number, capacity: number): DensityLevel {
  const ratio = current / capacity;
  if (ratio >= 0.85) return 'critical';
  if (ratio >= 0.70) return 'high';
  if (ratio >= 0.40) return 'moderate';
  return 'optimal';
}

/**
 * Computes queue wait times using a simplified M/M/1 queuing model.
 * serviceRate is approximated as 35% of the sector's total capacity.
 */
export function calculateQueueWaitTime(current: number, capacity: number): number {
  const serviceRate = capacity * 0.35;
  if (current >= serviceRate) {
    const overflow = current - serviceRate;
    return Math.max(1, Math.round(5 + (overflow / serviceRate) * 15));
  }
  const utilization = current / serviceRate;
  const estimate = 1 / (1 - Math.min(0.95, utilization));
  return Math.max(1, Math.min(15, Math.round(estimate)));
}

export function getAISuggestion(zone: Zone): string {
  switch (zone.density) {
    case 'critical':
      return `CRITICAL: Redirect traffic away from ${zone.name}. Detour routes via nearby corridors are active. Deploy staff to assist with manual guiding.`;
    case 'high':
      return `HEAVY FLOW: Monitor ${zone.name}. Consider opening overflow counters or secondary pathways to relieve ~15% load.`;
    case 'moderate':
      return `MODERATE: Stable operations. Flow metrics within standard thresholds. No immediate action required.`;
    case 'optimal':
    default:
      return `OPTIMAL: Excellent flow. Current load is well within comfort limits.`;
  }
}

export function generateInitialAlerts(): Alert[] {
  return [
    {
      id: 'alt-01',
      type: 'critical',
      title: 'West Corridor Congestion',
      message: 'West Corridor Loop density has exceeded 85%. Crowds are bottlenecking at the ticketing area.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      acknowledged: false,
      zoneId: 'z-con-2',
    },
    {
      id: 'alt-02',
      type: 'warning',
      title: 'Restroom Queues Elevated',
      message: 'Wait times at West Food Pavilion restrooms have exceeded 15 minutes.',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      acknowledged: false,
      zoneId: 'z-rest-2',
    },
    {
      id: 'alt-03',
      type: 'info',
      title: 'Simulation Connected',
      message: 'Real-time telemetry stream synchronized with local server.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      acknowledged: true,
    },
  ];
}

export function applyIncidentEffect(zones: Zone[], mode: IncidentMode): { zones: Zone[]; alerts: Alert[] } {
  const updatedZones = zones.map((z) => ({ ...z }));
  const newAlerts: Alert[] = [];

  switch (mode) {
    case 'concert_rush':
      updatedZones.forEach((z) => {
        if (z.id === 'z-gate-a') {
          z.current = Math.floor(z.capacity * 0.92);
        } else if (z.id === 'z-con-1') {
          z.current = Math.floor(z.capacity * 0.95);
        } else if (z.id === 'z-rest-1') {
          z.current = Math.floor(z.capacity * 0.88);
        } else {
          z.current = Math.floor(z.capacity * (0.2 + Math.random() * 0.15));
        }
        z.density = getDensityLevel(z.current, z.capacity);
        z.waitTime = calculateQueueWaitTime(z.current, z.capacity);
      });
      newAlerts.push({
        id: `alt-concert-${Date.now()}`,
        type: 'critical',
        title: 'Concert Entry Rush',
        message: 'North Wing Gates and Concourses experiencing massive arrival rate spikes. Detouring incoming guests to Gate C.',
        timestamp: new Date(),
        acknowledged: false,
        zoneId: 'z-con-1',
      });
      break;

    case 'match_day':
      updatedZones.forEach((z) => {
        if (z.id === 'z-gate-d') {
          z.current = Math.floor(z.capacity * 0.89);
        } else if (z.id === 'z-con-4') {
          z.current = Math.floor(z.capacity * 0.91);
        } else if (z.id === 'z-rest-4') {
          z.current = Math.floor(z.capacity * 0.80);
        } else {
          z.current = Math.floor(z.capacity * (0.25 + Math.random() * 0.15));
        }
        z.density = getDensityLevel(z.current, z.capacity);
        z.waitTime = calculateQueueWaitTime(z.current, z.capacity);
      });
      newAlerts.push({
        id: `alt-match-${Date.now()}`,
        type: 'warning',
        title: 'Stadium Match Exit Load',
        message: 'South Wing egress gates experiencing sudden volume spike post-event. Transit arrivals coordinated.',
        timestamp: new Date(),
        acknowledged: false,
        zoneId: 'z-gate-d',
      });
      break;

    case 'concourse_incident':
      updatedZones.forEach((z) => {
        if (z.id === 'z-con-2') {
          z.current = Math.floor(z.capacity * 0.98);
        } else if (z.id === 'z-con-3') {
          z.current = Math.floor(z.capacity * 0.75);
        } else if (z.id === 'z-rest-2') {
          z.current = Math.floor(z.capacity * 0.92);
        }
        z.density = getDensityLevel(z.current, z.capacity);
        z.waitTime = calculateQueueWaitTime(z.current, z.capacity);
      });
      newAlerts.push({
        id: `alt-inc-${Date.now()}`,
        type: 'critical',
        title: 'West Loop Obstruction',
        message: 'Physical obstruction in West Corridor Loop has ground traffic flow to a halt. Urgent staff deployment requested.',
        timestamp: new Date(),
        acknowledged: false,
        zoneId: 'z-con-2',
      });
      break;

    case 'evacuation_drill':
      updatedZones.forEach((z) => {
        z.current = Math.floor(z.capacity * (0.05 + Math.random() * 0.05));
        z.density = getDensityLevel(z.current, z.capacity);
        z.waitTime = calculateQueueWaitTime(z.current, z.capacity);
      });
      newAlerts.push({
        id: `alt-evac-${Date.now()}`,
        type: 'critical',
        title: 'EVACUATION DRILL ACTIVE',
        message: 'Facility-wide egress test. All digital panels routed to emergency exits.',
        timestamp: new Date(),
        acknowledged: false,
      });
      break;

    case 'standard':
    default:
      updatedZones.forEach((z, idx) => {
        const initial = INITIAL_ZONES[idx];
        z.current = initial.current;
        z.density = initial.density;
        z.waitTime = calculateQueueWaitTime(z.current, z.capacity);
      });
      newAlerts.push({
        id: `alt-std-${Date.now()}`,
        type: 'success',
        title: 'System Normalized',
        message: 'Venue flow returned to standard operating conditions.',
        timestamp: new Date(),
        acknowledged: false,
      });
      break;
  }

  return { zones: updatedZones, alerts: newAlerts };
}
