import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import { River, Station, Measurement, Incident, Hotspot, SatelliteGapData, GhatAdvisoryItem, DrainSTP } from '../types';
import { ShieldAlert, ChevronRight, Orbit, Satellite, Info, HelpCircle, Waves } from 'lucide-react';
import { GhatSafetyAdvisory } from './GhatSafetyAdvisory';

interface MapViewProps {
  rivers: River[];
  selectedRiverId: number;
  onSelectRiver: (id: number) => void;
  incidents: Incident[];
  hotspots: Hotspot[];
}

const createStationIcon = (score: number, bandColor: string) => {
  return L.divIcon({
    className: 'custom-station-icon',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${bandColor};
        border: 3px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      ">
        ${Math.round(score)}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

const createDrainStpIcon = (type: 'DRAIN' | 'STP', color: string) => {
  const symbol = type === 'DRAIN' ? '🌊' : '🏭';
  return L.divIcon({
    className: 'custom-drain-icon',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #0f172a;
        border: 2px solid ${color};
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};


const createIncidentIcon = (severity: string) => {
  const color = severity === 'CRITICAL' ? '#ef4444' : severity === 'HIGH' ? '#f97316' : '#f59e0b';
  return L.divIcon({
    className: 'custom-incident-icon',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: #111827;
        border: 2px solid ${color};
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color};
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        ⚠
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const MapCenterUpdater: React.FC<{
  riverCoords: LatLngTuple[];
  riverId: number;
  focusedTarget: { lat: number; lng: number; zoom?: number; bounds?: LatLngTuple[] } | null;
}> = ({ riverCoords, riverId, focusedTarget }) => {
  const map = useMap();

  useEffect(() => {
    if (focusedTarget) {
      if (focusedTarget.bounds && focusedTarget.bounds.length > 1) {
        const b = L.latLngBounds(focusedTarget.bounds);
        map.fitBounds(b, { padding: [60, 60], maxZoom: 15, animate: true, duration: 1.0 });
      } else {
        map.flyTo([focusedTarget.lat, focusedTarget.lng], focusedTarget.zoom || 14.5, { animate: true, duration: 1.0 });
      }
      return;
    }

    if (riverCoords && riverCoords.length > 0) {
      if (riverCoords.length === 1) {
        map.flyTo(riverCoords[0], 12, { animate: true, duration: 1.2 });
      } else {
        const bounds = L.latLngBounds(riverCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true, duration: 1.2 });
      }
    }
  }, [riverId, focusedTarget, map]);
  return null;
};

export const RiverHealthMap: React.FC<MapViewProps> = ({
  rivers,
  selectedRiverId,
  onSelectRiver,
  incidents,
  hotspots
}) => {
  const [healthData, setHealthData] = useState<{
    overall_health: any;
    stations: Station[];
    measurements: Measurement[];
  } | null>(null);

  const [satelliteData, setSatelliteData] = useState<SatelliteGapData | null>(null);
  const [showSatelliteLayer, setShowSatelliteLayer] = useState<boolean>(true);
  const [drainsData, setDrainsData] = useState<DrainSTP[]>([]);
  const [showDrainsLayer, setShowDrainsLayer] = useState<boolean>(true);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [focusedTarget, setFocusedTarget] = useState<{ lat: number; lng: number; zoom?: number; bounds?: LatLngTuple[] } | null>(null);

  useEffect(() => {
    if (!selectedRiverId) return;
    setFocusedTarget(null);
    
    // 1. Fetch In-situ sensor health data
    fetch(`/api/rivers/${selectedRiverId}/health`)
      .then(res => res.json())
      .then(data => {
        setHealthData(data);
        if (data.stations && data.stations.length > 0) {
          setSelectedStationId(data.stations[0].id);
        }
      })
      .catch(err => {
        console.error('Failed to load health summary', err);
      });

    // 2. Fetch Copernicus Sentinel-2 Optical Gap-Filling Analysis
    fetch(`/api/satellite/gap-filling?river_id=${selectedRiverId}`)
      .then(res => res.json())
      .then(data => setSatelliteData(data))
      .catch(err => console.error('Failed to load satellite gap data', err));

    // 3. Fetch Drains and Sewage Treatment Plants (STPs)
    fetch(`/api/drains?river_id=${selectedRiverId}`)
      .then(res => res.json())
      .then(data => setDrainsData(data))
      .catch(err => console.error('Failed to load drains & STPs', err));

  }, [selectedRiverId]);


  const currentRiver = rivers.find(r => r.id === selectedRiverId);
  
  const rawCoords = currentRiver?.geometry_geojson?.coordinates || currentRiver?.geometry?.coordinates;
  const riverCoords: LatLngTuple[] = rawCoords && rawCoords.length > 0
    ? rawCoords.map(c => [Number(c[1]), Number(c[0])] as LatLngTuple)
    : (selectedRiverId === 2 
        ? [[25.2814, 83.0031], [25.3042, 83.0108], [25.3115, 83.0175], [25.3321, 83.0312]]
        : [[28.7112, 77.2285], [28.6750, 77.2341], [28.6418, 77.2514], [28.6139, 77.2721], [28.5684, 77.3012], [28.5441, 77.3105]]);

  const mapCenter: LatLngTuple = riverCoords.length > 2 ? riverCoords[2] : (riverCoords[0] || [28.6139, 77.2721]);

  const selectedMeasurement = healthData?.measurements.find(m => m.station_id === selectedStationId) || healthData?.measurements[0];
  const selectedStationObj = healthData?.stations.find(s => s.id === selectedStationId) || healthData?.stations[0];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Section: Sidebar Cards + Map Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '20px', minHeight: '620px' }}>
        
        {/* LEFT COLUMN: Clean Cards Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* CARD 1: Basin Selector & Overall Score Card */}
          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select River Basin
              </span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                {currentRiver?.length_km} km Monitored
              </span>
            </div>

            <select
              value={selectedRiverId}
              onChange={e => onSelectRiver(Number(e.target.value))}
              className="input-field"
              style={{ fontWeight: 700, fontSize: '1rem', background: '#1e293b' }}
            >
              {rivers.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.state})
                </option>
              ))}
            </select>

            {/* Overall Health Score Card */}
            {healthData && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#1e293b', borderRadius: '12px', border: `1px solid ${healthData.overall_health.band_color}55` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Basin Average Health</span>
                      <span title="Calculated from standard CPCB parameters (DO, BOD, pH, Coliform)"><Info size={14} color="#64748b" /></span>
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: healthData.overall_health.band_color, lineHeight: 1.1, marginTop: '2px' }}>
                      {healthData.overall_health.score}
                      <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}> / 100</span>
                    </div>
                  </div>

                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    background: `${healthData.overall_health.band_color}22`,
                    color: healthData.overall_health.band_color,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: `1px solid ${healthData.overall_health.band_color}66`
                  }}>
                    {healthData.overall_health.band}
                  </div>
                </div>

                {/* Plain-English Meaning Callout */}
                <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  💡 <strong>What this means:</strong> {healthData.overall_health.score < 40 
                    ? 'Heavy pollution detected along this stretch. Unsafe for direct bathing or drinking without intense treatment.' 
                    : 'Water quality is within acceptable bathing parameters for most monitored sections.'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #334155', textAlign: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sensors</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{healthData.stations.length}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Reports</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fb7185' }}>{incidents.length}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Hotspots</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b' }}>{hotspots.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: Monitoring Stations List Card */}
          {healthData && (
            <div className="card-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Monitoring Stations along Stretch
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Click to view details</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {healthData.stations.map(st => {
                  const m = healthData.measurements.find(meas => meas.station_id === st.id);
                  const isSelected = selectedStationId === st.id;
                  const score = m ? m.health_score : 50;
                  const color = m?.health_band === 'Excellent' ? '#10b981' :
                                m?.health_band === 'Good' ? '#3b82f6' :
                                m?.health_band === 'Moderate' ? '#f59e0b' :
                                m?.health_band === 'Poor' ? '#f97316' : '#ef4444';

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStationId(st.id);
                        setFocusedTarget({ lat: st.latitude, lng: st.longitude, zoom: 15 });
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                        border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '0.9rem', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                            {st.name}
                          </strong>
                          {isSelected && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.25)', color: '#38bdf8', fontWeight: 700 }}>
                              ZOOMED
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {st.district} • {st.source}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: `${color}22`,
                          color: color,
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          border: `1px solid ${color}44`
                        }}>
                          {score} / 100
                        </span>
                        <ChevronRight size={16} color={isSelected ? '#38bdf8' : '#475569'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CARD 3: Detailed Parameter Breakdown Card with Non-Tech Explanations */}
          {selectedMeasurement && selectedStationObj && (
            <div className="card-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{selectedStationObj.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Latest reading: {new Date(selectedMeasurement.measured_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="metric-pill">
                  {selectedMeasurement.completeness_pct}% Data Available
                </span>
              </div>

              {/* Grid of Parameter Cards with Non-Tech Friendly Explanations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                
                {/* Dissolved Oxygen */}
                <div className="card-subtle">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Oxygen in Water (DO)</span>
                    <span title="Needed for fish & river organisms to breathe. Higher is better."><HelpCircle size={13} color="#64748b" /></span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (selectedMeasurement.do_mgl || 0) >= 5.0 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                    {selectedMeasurement.do_mgl ?? 'N/A'} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mg/L</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: (selectedMeasurement.do_mgl || 0) >= 5.0 ? '#34d399' : '#f87171' }}>
                    {(selectedMeasurement.do_mgl || 0) >= 5.0 ? '✓ Healthy for fish' : '✗ Suffocating for fish'}
                  </span>
                </div>

                {/* BOD */}
                <div className="card-subtle">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Sewage & Waste (BOD)</span>
                    <span title="Measures untreated organic waste. Lower is cleaner."><HelpCircle size={13} color="#64748b" /></span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (selectedMeasurement.bod_mgl || 0) <= 3.0 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                    {selectedMeasurement.bod_mgl ?? 'N/A'} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mg/L</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: (selectedMeasurement.bod_mgl || 0) <= 3.0 ? '#34d399' : '#f87171' }}>
                    {(selectedMeasurement.bod_mgl || 0) <= 3.0 ? '✓ Low waste load' : '✗ High organic waste'}
                  </span>
                </div>

                {/* pH */}
                <div className="card-subtle">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Acid / Alkaline (pH)</span>
                    <span title="Normal river water is neutral between 6.5 and 8.5."><HelpCircle size={13} color="#64748b" /></span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (selectedMeasurement.ph || 0) >= 6.5 && (selectedMeasurement.ph || 0) <= 8.5 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                    {selectedMeasurement.ph ?? 'N/A'}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: (selectedMeasurement.ph || 0) >= 6.5 && (selectedMeasurement.ph || 0) <= 8.5 ? '#34d399' : '#f87171' }}>
                    {(selectedMeasurement.ph || 0) >= 6.5 && (selectedMeasurement.ph || 0) <= 8.5 ? '✓ Safe natural balance' : '✗ Abnormal acidity/chemical'}
                  </span>
                </div>

                {/* Fecal Coliform */}
                <div className="card-subtle">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Bacteria & Hygiene</span>
                    <span title="Coliform bacteria indicates human/animal fecal contamination."><HelpCircle size={13} color="#64748b" /></span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: (selectedMeasurement.fecal_coliform || 0) <= 2500 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                    {selectedMeasurement.fecal_coliform?.toLocaleString() ?? 'N/A'} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MPN</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: (selectedMeasurement.fecal_coliform || 0) <= 500 ? '#34d399' : '#f87171' }}>
                    {(selectedMeasurement.fecal_coliform || 0) <= 500 ? '✓ Safe for holy bath' : '✗ High infection risk'}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* CARD 4: Copernicus Sentinel-2 Satellite Gap-Filling Card */}
          {satelliteData && (
            <div className="card-panel" style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(19, 39, 31, 0.8) 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                  <Satellite size={18} />
                  <strong style={{ fontSize: '0.85rem' }}>Copernicus Sentinel-2 Gap-Filling</strong>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                  Click to Zoom Reach
                </span>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '10px' }}>
                Select any unmonitored reach segment below to instantly fly to and inspect the satellite turbidity profile on the map.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {satelliteData.segments.map(seg => (
                  <div
                    key={`sat-seg-${seg.segment_index}`}
                    onClick={() => {
                      const coords = seg.coordinates.map(c => [c[0], c[1]] as LatLngTuple);
                      setFocusedTarget({ lat: seg.center[0], lng: seg.center[1], bounds: coords });
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${seg.band_color}66`,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    className="card-panel-hover"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontWeight: 600 }}>
                      <span>🔍 Reach #{seg.segment_index}</span>
                      <span style={{ color: seg.band_color, fontWeight: 700 }}>{seg.estimated_turbidity_ntu} NTU</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>
                      <span>{seg.clarity_level}</span>
                      <span>NDTI: {seg.ndti_index}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Map Canvas Card */}
        <div className="card-panel" style={{ padding: '8px', position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
          
          {/* Floating Layers Controls */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 500,
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: '#111827',
              border: '1px solid #374151',
              padding: '6px 10px',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: showSatelliteLayer ? '#34d399' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>
                <Orbit size={15} />
                <span>Sentinel-2</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSatelliteLayer(!showSatelliteLayer)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: showSatelliteLayer ? '#10b981' : '#334155',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {showSatelliteLayer ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{
              background: '#111827',
              border: '1px solid #374151',
              padding: '6px 10px',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: showDrainsLayer ? '#f97316' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>
                <Waves size={15} />
                <span>Drains & STPs</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDrainsLayer(!showDrainsLayer)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: showDrainsLayer ? '#f97316' : '#334155',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {showDrainsLayer ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Floating Map Legend Card */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 500,
            background: '#111827',
            border: '1px solid #374151',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <strong style={{ color: '#ffffff', marginBottom: '2px' }}>Health Score Index</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              <span>Excellent (80-100)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }} />
              <span>Good (60-79)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <span>Moderate (40-59)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316' }} />
              <span>Poor (20-39)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <span>Critical (0-19)</span>
            </div>
          </div>

          {/* Map */}
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          >
            <MapCenterUpdater riverCoords={riverCoords} riverId={selectedRiverId} focusedTarget={focusedTarget} />

            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />

            {/* Base River Centerline Stroke */}
            {riverCoords.length > 1 && (
              <>
                <Polyline
                  positions={riverCoords}
                  pathOptions={{
                    color: '#0284c7',
                    weight: 12,
                    opacity: 0.5,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
                <Polyline
                  positions={riverCoords}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              </>
            )}

            {/* Sentinel-2 Gap Filling Colored Optical Segments */}
            {showSatelliteLayer && satelliteData && satelliteData.segments.map(seg => (
              <Polyline
                key={`sat-line-${seg.segment_index}`}
                positions={seg.coordinates}
                pathOptions={{
                  color: seg.band_color,
                  weight: 10,
                  opacity: 0.85,
                  dashArray: '8, 8'
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: seg.band_color, fontWeight: 700 }}>
                      <Satellite size={16} /> Sentinel-2 Gap Estimate
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block', marginTop: '4px' }}>
                      Reach #{seg.segment_index} ({seg.unmonitored_gap_km} km unmonitored reach)
                    </strong>
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <div>Turbidity: <strong style={{ color: seg.band_color }}>{seg.estimated_turbidity_ntu} NTU</strong></div>
                      <div>NDTI Index: <strong>{seg.ndti_index}</strong> (Level: {seg.clarity_level})</div>
                      <div>Tile: <strong>{seg.sentinel2_tile}</strong> (Cloud: {seg.cloud_cover_pct}%)</div>
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#64748b' }}>
                      ESA Copernicus Open Access Hub • 10m Optical
                    </div>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* Hotspots */}
            {hotspots.map((h, idx) => (
              <Circle
                key={`hotspot-${idx}`}
                center={[h.latitude, h.longitude]}
                radius={h.radius_meters}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.25,
                  dashArray: '6, 6'
                }}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700 }}>
                      <ShieldAlert size={16} /> AI Hotspot Cluster
                    </div>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px', color: '#ffffff' }}>{h.name}</p>
                    <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                      Type: <strong>{h.dominant_type}</strong> • Confidence: <strong>{Math.round(h.confidence * 100)}%</strong>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Station Markers */}
            {healthData?.measurements.map(m => {
              const st = healthData.stations.find(s => s.id === m.station_id);
              const color = m.health_band === 'Excellent' ? '#10b981' :
                            m.health_band === 'Good' ? '#3b82f6' :
                            m.health_band === 'Moderate' ? '#f59e0b' :
                            m.health_band === 'Poor' ? '#f97316' : '#ef4444';

              return (
                <Marker
                  key={`meas-${m.id}`}
                  position={[m.latitude, m.longitude]}
                  icon={createStationIcon(m.health_score, color)}
                  eventHandlers={{
                    click: () => setSelectedStationId(m.station_id)
                  }}
                >
                  <Popup>
                    <div>
                      <h4 style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                        {st?.name || 'CPCB Station'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontWeight: 800, color: color }}>
                          Score: {m.health_score}/100
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({m.health_band})</span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        DO: <strong>{m.do_mgl} mg/L</strong> | BOD: <strong>{m.bod_mgl} mg/L</strong><br />
                        pH: <strong>{m.ph}</strong> | Fecal Coliform: <strong>{m.fecal_coliform} MPN</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Incidents */}
            {incidents.map(inc => (
              <Marker
                key={`inc-${inc.id}`}
                position={[inc.latitude, inc.longitude]}
                icon={createIncidentIcon(inc.severity)}
              >
                <Popup>
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#fb7185', fontSize: '0.9rem' }}>{inc.tracking_number}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#1e293b', color: '#ffffff' }}>{inc.status}</span>
                    </div>
                    <p style={{ fontWeight: 700, color: '#ffffff', marginTop: '6px', fontSize: '0.9rem' }}>{inc.location_name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{inc.description}</p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                      <span style={{ color: '#38bdf8' }}>Evidence: {inc.evidence_score}/100</span>
                      <span>•</span>
                      <span style={{ color: '#fbbf24' }}>Severity: {inc.severity}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Drains & STPs Markers */}
            {showDrainsLayer && drainsData.map(d => (
              <Marker
                key={`drain-stp-${d.id}`}
                position={[d.latitude, d.longitude]}
                icon={createDrainStpIcon(d.type, d.icon_color)}
              >
                <Popup>
                  <div style={{ minWidth: '240px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontWeight: 800,
                        color: d.icon_color,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        {d.type === 'DRAIN' ? '🌊 Major Outfall Drain' : '🏭 Sewage Treatment Plant'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${d.icon_color}25`,
                        color: d.icon_color,
                        fontWeight: 700
                      }}>
                        {d.risk_level}
                      </span>
                    </div>

                    <h4 style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem', margin: '6px 0 2px 0' }}>
                      {d.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                      {d.details}
                    </p>

                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      {d.type === 'DRAIN' ? (
                        <>
                          <div>Discharge Volume: <strong style={{ color: '#ef4444' }}>{d.discharge_mld} MLD</strong></div>
                          <div>Influent BOD: <strong>{d.bod_mgl} mg/L</strong></div>
                          <div>Status: <strong style={{ color: '#f59e0b' }}>{d.treatment_status}</strong></div>
                          {d.connected_stp && <div>Routing: <span style={{ color: '#38bdf8' }}>{d.connected_stp}</span></div>}
                        </>
                      ) : (
                        <>
                          <div>Capacity: <strong style={{ color: '#10b981' }}>{d.capacity_mld} MLD</strong> (Current: {d.current_flow_mld} MLD)</div>
                          <div>Technology: <strong>{d.technology}</strong></div>
                          <div>Treated Effluent BOD: <strong style={{ color: '#10b981' }}>{d.effluent_bod_mgl} mg/L</strong></div>
                          <div>Compliance: <strong style={{ color: '#10b981' }}>{d.compliance_status}</strong></div>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>

        </div>

      </div>

      {/* Bottom Section: Real-World "Is It Safe to Bathe Today?" Ghat Safety Advisory Card */}
      <GhatSafetyAdvisory
        riverId={selectedRiverId}
        riverName={currentRiver?.name || 'Monitored River'}
        onSelectGhat={(ghat: GhatAdvisoryItem) => {
          setSelectedStationId(ghat.ghat_id);
          setFocusedTarget({ lat: ghat.latitude, lng: ghat.longitude, zoom: 15 });
        }}
      />

    </div>
  );
};
