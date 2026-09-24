import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle, X, Download, ShieldCheck } from 'lucide-react';
import { River } from '../types';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  rivers: River[];
  onUploadSuccess: () => void;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  rivers,
  onUploadSuccess
}) => {
  const [selectedRiverId, setSelectedRiverId] = useState<number>(rivers[0]?.id || 1);
  const [sourceName, setSourceName] = useState<string>('Delhi Water Watch (NGO)');
  const [csvText, setCsvText] = useState<string>(
`latitude,longitude,ph,do_mgl,bod_mgl,turbidity_ntu,fecal_coliform
28.6920,77.2410,7.1,4.8,5.2,14.0,2200
28.6610,77.2480,6.9,2.4,14.5,32.0,18500
28.6320,77.2610,6.8,1.2,26.0,52.0,84000`
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; count?: number; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const template = "latitude,longitude,ph,do_mgl,bod_mgl,turbidity_ntu,fecal_coliform\n28.6920,77.2410,7.2,5.5,3.1,12.0,800\n";
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "NadiRakshak_Water_Sample_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleIngest = async () => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error("CSV file must contain a header and at least one data row.");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const measurements = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim());
        if (row.length < headers.length || !row[0]) continue;

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = row[idx];
        });

        measurements.push({
          river_id: Number(selectedRiverId),
          latitude: parseFloat(rowObj.latitude),
          longitude: parseFloat(rowObj.longitude),
          ph: rowObj.ph ? parseFloat(rowObj.ph) : null,
          do_mgl: rowObj.do_mgl ? parseFloat(rowObj.do_mgl) : null,
          bod_mgl: rowObj.bod_mgl ? parseFloat(rowObj.bod_mgl) : null,
          turbidity_ntu: rowObj.turbidity_ntu ? parseFloat(rowObj.turbidity_ntu) : null,
          fecal_coliform: rowObj.fecal_coliform ? parseFloat(rowObj.fecal_coliform) : null,
          source: sourceName || "NGO Lab Field Kit",
          is_demo: false
        });
      }

      const res = await fetch('/api/measurements/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to ingest batch measurements");

      setUploadResult({ success: true, count: data.count, message: data.message });
      setIsUploading(false);
      onUploadSuccess();
    } catch (err: any) {
      setUploadResult({ success: false, message: err.message || "Parsing error" });
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card-panel" style={{
        maxWidth: '640px',
        width: '100%',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Batch Water Testing Ingestion (NGO & Lab)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Upload grab sample testing datasets from portable kits or accredited laboratories.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Target River Stretch
            </label>
            <select
              value={selectedRiverId}
              onChange={e => setSelectedRiverId(Number(e.target.value))}
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            >
              {rivers.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Contributing NGO / Lab Organization
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={e => setSourceName(e.target.value)}
              className="input-field"
              placeholder="e.g. Yamuna Jiye Abhiyaan"
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* CSV Dropzone / Text Editor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
              CSV Data (Latitude, Longitude, pH, DO, BOD, Turbidity, Fecal Coliform)
            </label>
            <button
              onClick={handleDownloadTemplate}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Download size={12} /> Download CSV Template
            </button>
          </div>

          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            rows={5}
            className="input-field"
            style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              lineHeight: 1.4,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Upload File Button Alternative */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#cbd5e1',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <UploadCloud size={16} /> Choose .CSV File
            <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Auto-validated against CPCB Class B algorithms.
          </span>
        </div>

        {/* Result Message */}
        {uploadResult && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: uploadResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${uploadResult.success ? '#10b981' : '#ef4444'}`,
            color: uploadResult.success ? '#34d399' : '#f87171',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {uploadResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
            {uploadResult.message}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleIngest}
            disabled={isUploading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            {isUploading ? 'Scoring & Ingesting...' : <><ShieldCheck size={16} /> Score & Ingest Batch</>}
          </button>
        </div>

      </div>
    </div>
  );
};
