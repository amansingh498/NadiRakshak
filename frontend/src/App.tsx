import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { RiverHealthMap } from './components/RiverHealthMap';
import { CitizenReportForm } from './components/CitizenReportForm';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { ImpactMetricsView } from './components/ImpactMetricsView';
import { StandardsView } from './components/StandardsView';
import { TelegramAlertModal } from './components/TelegramAlertModal';
import { BatchUploadModal } from './components/BatchUploadModal';
import { River, Incident, Hotspot } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'report' | 'authority' | 'impact' | 'standards'>('map');
  const [rivers, setRivers] = useState<River[]>([]);
  const [selectedRiverId, setSelectedRiverId] = useState<number>(1);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState<boolean>(false);

  const loadRiversAndIncidents = async () => {
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
      if (riversData.length > 0 && !selectedRiverId) {
        setSelectedRiverId(riversData[0].id);
      }
    } catch (err) {
      console.error('Failed to load application data', err);
    }
  };

  useEffect(() => {
    loadRiversAndIncidents();
  }, []);

  const currentRiver = rivers.find(r => r.id === selectedRiverId);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRiver={currentRiver?.name || 'Yamuna (Delhi Stretch)'}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
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
