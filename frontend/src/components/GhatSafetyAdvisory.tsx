import React, { useState, useEffect } from 'react';
import { GhatAdvisoryItem, GhatAdvisoryResponse } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, Search, Droplet } from 'lucide-react';

interface GhatSafetyAdvisoryProps {
  riverId: number;
  riverName: string;
  onSelectGhat: (ghat: GhatAdvisoryItem) => void;
}

export const GhatSafetyAdvisory: React.FC<GhatSafetyAdvisoryProps> = ({
  riverId,
  riverName,
  onSelectGhat
}) => {
  const [advisoryData, setAdvisoryData] = useState<GhatAdvisoryResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGhatId, setSelectedGhatId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/ghat-advisory?river_id=${riverId}`)
      .then(res => res.json())
      .then(data => {
        setAdvisoryData(data);
        if (data.ghats && data.ghats.length > 0) {
          setSelectedGhatId(data.ghats[0].ghat_id);
        }
      })
      .catch(err => console.error('Failed to load ghat advisory', err));
  }, [riverId]);

  if (!advisoryData) return null;

  const filteredGhats = advisoryData.ghats.filter(g =>
    g.ghat_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGhat = advisoryData.ghats.find(g => g.ghat_id === selectedGhatId) || advisoryData.ghats[0];

  return (
    <div className="card-panel" style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(12, 33, 40, 0.85) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <Droplet size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Is It Safe to Bathe Today? (तीर्थ स्नान गाइड)
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                CPCB Class B
              </span>
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Real-time ritual bathing & health safety guide for {riverName} ghats.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search Ghat by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', fontSize: '0.8rem', padding: '6px 12px 6px 32px' }}
          />
        </div>
      </div>

      {/* Ghat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {filteredGhats.map(ghat => {
          const isSelected = ghat.ghat_id === selectedGhatId;
          const isSafe = ghat.badge === 'Safe';
          const isCaution = ghat.badge === 'Caution';

          return (
            <div
              key={ghat.ghat_id}
              onClick={() => {
                setSelectedGhatId(ghat.ghat_id);
                onSelectGhat(ghat);
              }}
              style={{
                padding: '14px',
                borderRadius: '12px',
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.65)',
                border: `1px solid ${isSelected ? '#38bdf8' : ghat.color + '44'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
              className="card-panel-hover"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>
                    {ghat.ghat_name}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {ghat.district}
                  </span>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: `${ghat.color}22`,
                  color: ghat.color,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  border: `1px solid ${ghat.color}55`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isSafe ? <ShieldCheck size={12} /> : isCaution ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                  {ghat.badge}
                </span>
              </div>

              {/* Status Message */}
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                {ghat.ritual_guidance}
              </div>

              {/* Quick Indicator Metrics */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', marginTop: '2px' }}>
                <span>Health: <strong style={{ color: ghat.color }}>{ghat.health_score}/100</strong></span>
                <span>BOD: <strong>{ghat.bod_mgl}</strong></span>
                <span>DO: <strong>{ghat.do_mgl}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Ghat Deep-Dive Ritual Guidance Box */}
      {activeGhat && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${activeGhat.color}66`,
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activeGhat.color }}>
                {activeGhat.safety_status} • {activeGhat.ghat_name}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>
              {activeGhat.ritual_guidance}
            </p>
            <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '0.75rem' }}>
              <span style={{ color: '#94a3b8' }}>
                Skin Infection Risk: <strong style={{ color: activeGhat.color }}>{activeGhat.skin_infection_risk}</strong>
              </span>
              <span style={{ color: '#94a3b8' }}>
                Achamana (Sip): <strong style={{ color: '#ef4444' }}>Never drink raw river water</strong>
              </span>
            </div>
          </div>

          <div style={{ background: '#090d16', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1e293b', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Ritual Recommendations:</span>
            <div>• <strong>Snan (Dip):</strong> {activeGhat.badge === 'Safe' ? 'Permitted' : activeGhat.badge === 'Caution' ? 'Only sprinkle over head' : 'Avoid contact'}</div>
            <div>• <strong>Aarti / Puja:</strong> Clean & safe on banks</div>
            <div>• <strong>Post-Contact:</strong> Wash hands & face with fresh clean tap water</div>
          </div>
        </div>
      )}

    </div>
  );
};
