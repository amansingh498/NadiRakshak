import React from 'react';
import { 
  Droplets, ShieldCheck, Activity, AlertTriangle, FileText, Sparkles, 
  Search, UploadCloud, BellRing 
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'report' | 'authority' | 'impact' | 'standards';
  setActiveTab: (tab: 'map' | 'report' | 'authority' | 'impact' | 'standards') => void;
  activeRiver: string;
  onOpenAlerts?: () => void;
  onOpenBatchUpload?: () => void;
  onOpenTrack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRiver,
  onOpenAlerts,
  onOpenBatchUpload,
  onOpenTrack
}) => {


  const navItems = [
    { id: 'map', label: 'River Map', icon: Activity, color: '#38bdf8' },
    { id: 'report', label: 'Report', icon: AlertTriangle, color: '#fb7185' },
    { id: 'authority', label: 'Authority', icon: ShieldCheck, color: '#60a5fa' },
    { id: 'impact', label: 'Impact', icon: Sparkles, color: '#34d399' },
    { id: 'standards', label: 'Standards', icon: FileText, color: '#fbbf24' },
  ] as const;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(8, 14, 26, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '10px 20px',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Left: Brand Identity */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setActiveTab('map')}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Droplets size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff 30%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                NadiRakshak
              </span>
              <span style={{
                fontSize: '0.62rem',
                padding: '1px 6px',
                borderRadius: '999px',
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                fontWeight: 700
              }}>
                LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
              River Health & Accountability
            </p>
          </div>
        </div>

        {/* Center: Sleek Segmented Pill Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '3px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
                  borderTop: isActive ? `1px solid ${item.color}50` : '1px solid transparent'
                }}
              >
                <Icon size={14} color={isActive ? item.color : '#64748b'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Clean Action Utilities & Active Basin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          
          {/* Quick Track Incident Button */}
          {onOpenTrack && (
            <button
              onClick={onOpenTrack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9px',
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.35)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Search size={13} />
              <span>Track #</span>
            </button>
          )}

          {/* Upload Lab CSV */}
          {onOpenBatchUpload && (
            <button
              onClick={onOpenBatchUpload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '9px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <UploadCloud size={13} />
              <span>Lab CSV</span>
            </button>
          )}

          {/* Alert Bot */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              title="Daily Telegram & WhatsApp bulletins"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '9px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <BellRing size={13} color="#f59e0b" />
              <span>Alerts</span>
            </button>
          )}

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 2px' }} />

          {/* Pilot Basin Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              flexShrink: 0
            }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pilot
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', marginTop: '2px' }}>
                {activeRiver.split('(')[0].trim()}
              </div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

