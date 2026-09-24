export interface River {
  id: number;
  name: string;
  state: string;
  length_km: number;
  geometry_geojson?: {
    type: string;
    coordinates: [number, number][];
  };
  geometry?: {
    type: string;
    coordinates: [number, number][];
  };
}

export interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  district: string;
  source: string;
}

export interface Measurement {
  id: number;
  station_id: number;
  latitude: number;
  longitude: number;
  measured_at: string;
  ph: number | null;
  do_mgl: number | null;
  bod_mgl: number | null;
  turbidity_ntu: number | null;
  fecal_coliform: number | null;
  health_score: number;
  health_band: string;
  completeness_pct: number;
  sub_scores: Record<string, number>;
  is_demo: boolean;
}

export interface Incident {
  id: number;
  tracking_number: string;
  river_id: number;
  latitude: number;
  longitude: number;
  location_name: string;
  pollution_type: string;
  description: string;
  image_url: string | null;
  evidence_score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  ai_predicted_type?: string;
  ai_confidence?: number;
  assigned_to?: string;
  assigned_org?: string;
  reported_at: string;
  updated_at?: string;
  sla?: {
    is_breached: boolean;
    elapsed_hours: number;
    sla_limit_hours: number;
    overdue_hours: number;
  };
  is_demo: boolean;
}

export interface IncidentEvent {
  id: number;
  from_status: string | null;
  to_status: string;
  actor_name: string;
  actor_role: string;
  note: string;
  created_at: string;
}

export interface Hotspot {
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  incident_count: number;
  confidence: number;
  dominant_type: string;
}

export interface ImpactSummary {
  monitored_km: number;
  rivers_monitored: number;
  measurements_ingested: number;
  reports_submitted: number;
  reports_resolved: number;
  reports_active: number;
  median_action_time_hours: number;
  hotspots_detected: number;
  segments_improved: number;
  estimated_untreated_discharge_stopped_kld: number;
  estimated_downstream_pop_benefitted: number;
  disclaimer: string;
}
