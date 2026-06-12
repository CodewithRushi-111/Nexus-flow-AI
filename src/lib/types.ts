export type DensityLevel = 'optimal' | 'moderate' | 'high' | 'critical';

export interface Zone {
  id: string;
  name: string;
  section: string;
  type: 'gate' | 'concourse' | 'restroom' | 'dining' | 'parking';
  capacity: number;
  current: number;
  density: DensityLevel;
  waitTime: number; // in minutes
  x: number; // percentage width on SVG map
  y: number; // percentage height on SVG map
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  zoneId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'security' | 'medical' | 'logistics' | 'services';
  status: 'idle' | 'dispatched' | 'en-route';
  zoneId?: string;
  assignedTask?: string;
}

export interface Stats {
  liveOccupancy: number;
  totalCapacity: number;
  aiOptimizationScore: number;
  activeAlertsCount: number;
  throughputRate: number; // people per min
}

export type IncidentMode = 'standard' | 'concert_rush' | 'match_day' | 'concourse_incident' | 'evacuation_drill';
