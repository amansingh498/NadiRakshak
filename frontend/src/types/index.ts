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
  estimated_untreated_discharge_stopped_kld: number;
  estimated_downstream_pop_benefitted: number;
  disclaimer: string;
}

export interface SatelliteSegment {
  segment_index: number;
  coordinates: [number, number][];
  center: [number, number];
  sentinel2_tile: string;
  acquisition_date: string;
  cloud_cover_pct: number;
  ndti_index: number;
  ndwi_index: number;
  estimated_turbidity_ntu: number;
  clarity_level: string;
  band_color: string;
  unmonitored_gap_km: number;
}

export interface SatelliteGapData {
  river_id: number;
  river_name: string;
  source: string;
  methodology: string;
  resolution: string;
  is_gap_filling: boolean;
  segments: SatelliteSegment[];
}

export interface GhatAdvisoryItem {
  ghat_id: number;
  ghat_name: string;
  district: string;
  latitude: number;
  longitude: number;
  health_score: number;
  safety_status: string;
  badge: 'Safe' | 'Caution' | 'Hazardous';
  color: string;
  ritual_guidance: string;
  achamana_drinking_safe: boolean;
  skin_infection_risk: string;
  do_mgl: number;
  bod_mgl: number;
  fecal_coliform: number;
  updated_at: string;
}

export interface GhatAdvisoryResponse {
  river_id: number;
  standard_applied: string;
  disclaimer: string;
  ghats: GhatAdvisoryItem[];
}



