import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import { River, Station, Measurement, Incident, Hotspot } from '../types';
import { ShieldAlert, ChevronRight } from 'lucide-react';

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

const MapCenterUpdater: React.FC<{ riverCoords: LatLngTuple[]; riverId: number }> = ({ riverCoords, riverId }) => {
  const map = useMap();
  useEffect(() => {
    if (riverCoords && riverCoords.length > 0) {
      if (riverCoords.length === 1) {
        map.flyTo(riverCoords[0], 12, { animate: true, duration: 1.2 });
      } else {
        const bounds = L.latLngBounds(riverCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true, duration: 1.2 });
      }
    }
  }, [riverId, map]);
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

  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedRiverId) return;
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
    <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '20px', height: 'calc(100vh - 84px)', padding: '16px 24px' }}>
      
      {/* LEFT COLUMN: Clean Cards Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '4px' }}>
        
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
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Basin Average Health</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #334155', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Stations</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{healthData.stations.length}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Incidents</span>
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
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
              Monitoring Stations along Stretch
            </span>

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
                    onClick={() => setSelectedStationId(st.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelected ? '#1e293b' : '#111827',
                      border: `1px solid ${isSelected ? '#38bdf8' : '#1f293d'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? '#ffffff' : '#cbd5e1', display: 'block' }}>
                        {st.name}
                      </strong>
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
                        {score}
                      </span>
                      <ChevronRight size={16} color={isSelected ? '#38bdf8' : '#475569'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CARD 3: Detailed Parameter Breakdown Card */}
        {selectedMeasurement && selectedStationObj && (
          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{selectedStationObj.name}</h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Measured: {new Date(selectedMeasurement.measured_at).toLocaleDateString()}
                </span>
              </div>
              <span className="metric-pill">
                {selectedMeasurement.completeness_pct}% Completeness
              </span>
            </div>

            {/* Grid of Parameter Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              {/* Dissolved Oxygen */}
              <div className="card-subtle">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Dissolved Oxygen (DO)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (selectedMeasurement.do_mgl || 0) >= 5.0 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                  {selectedMeasurement.do_mgl ?? 'N/A'} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mg/L</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CPCB Bathing: ≥ 5.0</span>
              </div>

              {/* BOD */}
              <div className="card-subtle">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>BOD (Organic Load)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (selectedMeasurement.bod_mgl || 0) <= 3.0 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                  {selectedMeasurement.bod_mgl ?? 'N/A'} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>mg/L</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>CPCB Bathing: ≤ 3.0</span>
              </div>

              {/* pH */}
              <div className="card-subtle">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>pH Acidity Level</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: (selectedMeasurement.ph || 0) >= 6.5 && (selectedMeasurement.ph || 0) <= 8.5 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                  {selectedMeasurement.ph ?? 'N/A'}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Standard: 6.5 - 8.5</span>
              </div>

              {/* Fecal Coliform */}
              <div className="card-subtle">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Fecal Coliform</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: (selectedMeasurement.fecal_coliform || 0) <= 2500 ? '#34d399' : '#f87171', margin: '2px 0' }}>
                  {selectedMeasurement.fecal_coliform?.toLocaleString() ?? 'N/A'} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MPN</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Max Limit: ≤ 2500</span>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Interactive Map Canvas Card */}
      <div className="card-panel" style={{ padding: '8px', position: 'relative', overflow: 'hidden' }}>
        
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
          <MapCenterUpdater riverCoords={riverCoords} riverId={selectedRiverId} />

          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />

          {/* River Line Dual Stroke */}
          {riverCoords.length > 1 && (
            <>
              <Polyline
                positions={riverCoords}
                pathOptions={{
                  color: '#0284c7',
                  weight: 12,
                  opacity: 0.6,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              <Polyline
                positions={riverCoords}
                pathOptions={{
                  color: '#38bdf8',
                  weight: 6,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            </>
          )}

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

        </MapContainer>
      </div>

    </div>
  );
};
