import React, { useEffect, useState } from 'react';
import { FileText, ExternalLink, ShieldCheck } from 'lucide-react';

export const StandardsView: React.FC = () => {
  const [standards, setStandards] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/standards')
      .then(res => res.json())
      .then(data => setStandards(data))
      .catch(err => console.error('Failed to load standards', err));
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner Card */}
      <div className="card-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <FileText size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              CPCB Designated Best-Use Water Quality Criteria
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Official Class B (Outdoor Bathing) Standards mandated by Central Pollution Control Board, Govt. of India.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>Last Verified: <strong style={{ color: '#ffffff' }}>{standards?.last_verified || '2026-03-01'}</strong></span><br />
          <span>Config Version: <strong style={{ color: '#38bdf8' }}>{standards?.version || 'cpcb_v1'}</strong></span>
        </div>
      </div>

      {/* 5 Parameters Card Grid */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
          Primary Evaluated Parameters & Weight Distribution
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-pill">Weight: 30%</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>Primary Life</span>
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginTop: '10px' }}>Dissolved Oxygen (DO)</strong>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', margin: '4px 0' }}>
              ≥ 5.0 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>mg/L</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fundamental oxygen saturation for aquatic ecosystem survival.</p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-pill">Weight: 30%</span>
              <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 700 }}>Sewage Index</span>
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginTop: '10px' }}>BOD (Organic Demand)</strong>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', margin: '4px 0' }}>
              ≤ 3.0 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>mg/L</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Measures organic decomposition from untreated drains.</p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-pill">Weight: 15%</span>
              <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 700 }}>Chemistry</span>
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginTop: '10px' }}>pH Value</strong>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa', margin: '4px 0' }}>
              6.5 – 8.5
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Acidity neutrality range protecting skin contact.</p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-pill">Weight: 15%</span>
              <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>Pathogen</span>
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginTop: '10px' }}>Fecal Coliform</strong>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', margin: '4px 0' }}>
              ≤ 500 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>MPN</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Microbial indicator ensuring safety for pilgrims and bathers.</p>
          </div>

          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-pill">Weight: 10%</span>
              <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700 }}>Clarity</span>
            </div>
            <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginTop: '10px' }}>Turbidity</strong>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', margin: '4px 0' }}>
              ≤ 10.0 <span style={{ fontSize: '0.8rem', color: '#64748b' }}>NTU</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Suspended solids and water clarity index.</p>
          </div>

        </div>
      </div>

      {/* Health Index Bands Card */}
      <div className="card-panel">
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '14px' }}>
          River Health Index Scoring Bands (0–100)
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
          <div className="card-subtle" style={{ borderLeft: '4px solid #10b981' }}>
            <strong style={{ fontSize: '0.95rem', color: '#34d399' }}>Excellent (80 - 100)</strong>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Pristine water quality fully meeting all bathing criteria.</p>
          </div>

          <div className="card-subtle" style={{ borderLeft: '4px solid #3b82f6' }}>
            <strong style={{ fontSize: '0.95rem', color: '#60a5fa' }}>Good (60 - 79)</strong>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Acceptable quality with minor seasonal variations.</p>
          </div>

          <div className="card-subtle" style={{ borderLeft: '4px solid #f59e0b' }}>
            <strong style={{ fontSize: '0.95rem', color: '#fbbf24' }}>Moderate (40 - 59)</strong>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Stressed stretch requiring municipal drain diversion.</p>
          </div>

          <div className="card-subtle" style={{ borderLeft: '4px solid #f97316' }}>
            <strong style={{ fontSize: '0.95rem', color: '#fb923c' }}>Poor (20 - 39)</strong>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Heavily polluted; severe DO depletion and organic loads.</p>
          </div>

          <div className="card-subtle" style={{ borderLeft: '4px solid #ef4444' }}>
            <strong style={{ fontSize: '0.95rem', color: '#f87171' }}>Critical (0 - 19)</strong>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Septic condition with toxic industrial/sewage discharges.</p>
          </div>
        </div>
      </div>

      {/* Official Citation Footer Card */}
      <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
          <ShieldCheck size={20} color="#38bdf8" />
          <span>Central Pollution Control Board (CPCB) Ministry of Environment, Forest and Climate Change, Govt. of India</span>
        </div>
        <a href="https://cpcb.nic.in/water-quality-criteria/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
          Official Criteria <ExternalLink size={14} />
        </a>
      </div>

    </div>
  );
};
