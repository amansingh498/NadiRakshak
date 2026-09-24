import React from 'react';
import { Droplets, ShieldCheck, Activity, AlertTriangle, FileText, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'report' | 'authority' | 'impact' | 'standards';
  setActiveTab: (tab: 'map' | 'report' | 'authority' | 'impact' | 'standards') => void;
  activeRiver: string;
  onOpenAlerts?: () => void;
  onOpenBatchUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, activeRiver, onOpenAlerts, onOpenBatchUpload }) => {
  return (
    <header style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 1000, padding: '12px 24px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('map')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)' }}>
            <Droplets size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                NadiRakshak
              </span>
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: 600 }}>
                CPCB LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              River Health & Incident Accountability
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('map')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'map' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'map' ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={16} /> Live Health Map
          </button>

          <button
            onClick={() => setActiveTab('report')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'report' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
              color: activeTab === 'report' ? '#fb7185' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={16} /> Report Pollution
          </button>

          <button
            onClick={() => setActiveTab('authority')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'authority' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'authority' ? '#60a5fa' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} /> Authority Triage
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'impact' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              color: activeTab === 'impact' ? '#34d399' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={16} /> Impact & Timeline
          </button>

          <button
            onClick={() => setActiveTab('standards')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'standards' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: activeTab === 'standards' ? '#fbbf24' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={16} /> CPCB Standards
          </button>
        </nav>

        {/* Action Buttons: Batch Upload & Bot Alerts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onOpenBatchUpload && (
            <button
              onClick={onOpenBatchUpload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🧪 Upload Lab CSV
            </button>
          )}

          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.15)',
                border: '1px solid #0284c7',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              💬 Bot Alerts
            </button>
          )}

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pilot Basin</span>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{activeRiver}</p>
          </div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
        </div>

      </div>
    </header>
  );
};
