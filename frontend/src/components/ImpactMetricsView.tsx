import React, { useEffect, useState } from 'react';
import { ImpactSummary } from '../types';
import { Award, ShieldCheck } from 'lucide-react';

export const ImpactMetricsView: React.FC = () => {
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [timeline, setTimeline] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/impact/summary')
      .then(res => res.json())
      .then(data => setImpact(data))
      .catch(err => console.error('Failed to load impact', err));

    fetch('/api/timeline?river_id=1')
      .then(res => res.json())
      .then(data => setTimeline(data))
      .catch(err => console.error('Failed to load timeline', err));
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Hero Banner Card */}
      <div className="card-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={28} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Measurable Environmental Impact & Recovery
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Telemetry tracking verified discharge prevention, downstream population protection, and monthly river score improvement.
          </p>
        </div>
      </div>

      {/* 4 Impact Stat Cards */}
      {impact && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          
          <div className="card-panel">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monitored River Extent
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '6px' }}>
              {impact.monitored_km} <span style={{ fontSize: '1rem', color: '#64748b' }}>km</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Across {impact.rivers_monitored} pilot river stretches</span>
          </div>

          <div className="card-panel">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Untreated Discharge Stopped
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>
              {impact.estimated_untreated_discharge_stopped_kld.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b' }}>kL/day</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Verified outfall interceptor plugs</span>
          </div>

          <div className="card-panel">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Downstream Population Protected
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', marginTop: '6px' }}>
              {impact.estimated_downstream_pop_benefitted.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Municipal ward census proxies</span>
          </div>

          <div className="card-panel">
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Median Action Dispatch Time
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#a855f7', marginTop: '6px' }}>
              {impact.median_action_time_hours} <span style={{ fontSize: '1rem', color: '#64748b' }}>hrs</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Report verification to inspection dispatch</span>
          </div>

        </div>
      )}

      {/* Historical Score Progression & Field Intervention Cards */}
      {timeline && (
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Health Score Progression (Yamuna Stretch)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Monthly score trajectory before and after municipal outfall diversion interventions
              </p>
            </div>
            <span style={{ padding: '6px 14px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              Trajectory: Improving (+40 pts)
            </span>
          </div>

          {/* Clean Visual Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingTop: '20px', borderBottom: '1px solid #1f293d', paddingBottom: '12px' }}>
            {timeline.monthly_series?.map((item: any) => {
              const heightPct = item.score;
              const color = item.score >= 60 ? '#3b82f6' : item.score >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color }}>{item.score}</span>
                  <div style={{
                    width: '42px',
                    height: `${heightPct * 1.5}px`,
                    background: color,
                    borderRadius: '8px 8px 0 0',
                    boxShadow: `0 4px 14px ${color}55`
                  }} />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>{item.month}</span>
                </div>
              );
            })}
          </div>

          {/* Key Interventions Card Grid */}
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              Verified Remediation Interventions
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {timeline.key_interventions?.map((ki: any, idx: number) => (
                <div key={idx} className="card-subtle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>{ki.date}</span>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block', marginTop: '2px' }}>{ki.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px' }}>
                    {ki.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Sourcing & Integrity Footer Card */}
      <div className="card-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
        <ShieldCheck size={20} color="#38bdf8" />
        <span>
          <strong>Methodology & Domain Integrity:</strong> {impact?.disclaimer} Sourced against Central Pollution Control Board (CPCB) Outdoor Bathing Standards.
        </span>
      </div>

    </div>
  );
};
