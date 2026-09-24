import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RiverHealthMap } from './components/RiverHealthMap';
import { CitizenReportForm } from './components/CitizenReportForm';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { ImpactMetricsView } from './components/ImpactMetricsView';
import { StandardsView } from './components/StandardsView';
import { TelegramAlertModal } from './components/TelegramAlertModal';
import { BatchUploadModal } from './components/BatchUploadModal';
import { TrackComplaintModal } from './components/TrackComplaintModal';
import { River, Incident, Hotspot } from './types';
import { ExternalLink, RefreshCw, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'report' | 'authority' | 'impact' | 'standards'>('map');
  const [rivers, setRivers] = useState<River[]>([]);
  const [selectedRiverId, setSelectedRiverId] = useState<number>(1);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState<boolean>(false);
  const [isTrackOpen, setIsTrackOpen] = useState<boolean>(false);
  const [showServerBanner, setShowServerBanner] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [backendReady, setBackendReady] = useState<boolean>(false);

  const loadRiversAndIncidents = async () => {
    setIsRefreshing(true);
    try {
      const [riversRes, incidentsRes, hotspotsRes] = await Promise.all([
        fetch('/api/rivers'),
        fetch('/api/incidents'),
        fetch('/api/hotspots')
      ]);

      const riversData = await riversRes.json();
      const incidentsData = await incidentsRes.json();
      const hotspotsData = await hotspotsRes.json();

      setRivers(riversData);
      setIncidents(incidentsData);
      setHotspots(hotspotsData.clusters || []);
      if (riversData && riversData.length > 0) {
        setBackendReady(true);
        if (!selectedRiverId) {
          setSelectedRiverId(riversData[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load application data', err);
      setBackendReady(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRiversAndIncidents();
  }, []);

  const currentRiver = rivers.find(r => r.id === selectedRiverId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Free Cloud Server Notice Banner */}
      {showServerBanner && (
        <div style={{
          background: backendReady 
            ? 'linear-gradient(90deg, rgba(6, 78, 59, 0.95), rgba(15, 23, 42, 0.95))'
            : 'linear-gradient(90deg, rgba(124, 45, 18, 0.95), rgba(30, 27, 75, 0.95))',
          borderBottom: backendReady ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(249, 115, 22, 0.35)',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: '#f8fafc',
          backdropFilter: 'blur(10px)',
          zIndex: 1100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {backendReady ? (
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={16} color="#fb923c" style={{ flexShrink: 0 }} />
            )}
            
            <span>
              {backendReady ? (
                <span>
                  🟢 <strong>Server Online & Active:</strong> Real-time river telemetry, satellite NDTI, and incident reporting are live.
                </span>
              ) : (
                <span>
                  ⚡ <strong>Notice:</strong> The free cloud backend sleeps after inactivity. If data is not loading, click to wake up the server.
                </span>
              )}
            </span>

            <a
              href="https://nadirakshak.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                marginLeft: '6px'
              }}
            >
              <span>1. Open & Wakeup Server</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={loadRiversAndIncidents}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: isRefreshing ? 'wait' : 'pointer'
              }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
              <span>{isRefreshing ? 'Reconnecting...' : '2. Refresh App Data'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowServerBanner(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRiver={currentRiver?.name || 'Yamuna (Delhi Stretch)'}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
        onOpenTrack={() => setIsTrackOpen(true)}
      />


      <TelegramAlertModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        activeRiver={currentRiver?.name || 'Yamuna (Delhi Stretch)'}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        rivers={rivers}
        onUploadSuccess={() => {
          loadRiversAndIncidents();
          setIsBatchUploadOpen(false);
        }}
      />

      <TrackComplaintModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
      />


      <main style={{ flex: 1 }}>
        {activeTab === 'map' && (
          <RiverHealthMap
            rivers={rivers}
            selectedRiverId={selectedRiverId}
            onSelectRiver={(id) => setSelectedRiverId(id)}
            incidents={incidents}
            hotspots={hotspots}
          />
        )}

        {activeTab === 'report' && (
          <CitizenReportForm
            rivers={rivers}
            selectedRiverId={selectedRiverId}
            onReportSuccess={() => {
              loadRiversAndIncidents();
            }}
          />
        )}

        {activeTab === 'authority' && (
          <AuthorityDashboard
            incidents={incidents}
            onIncidentUpdated={() => {
              loadRiversAndIncidents();
            }}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactMetricsView />
        )}

        {activeTab === 'standards' && (
          <StandardsView />
        )}
      </main>
    </div>
  );
};

export default App;
