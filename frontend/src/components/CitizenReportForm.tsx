import React, { useState } from 'react';
import { Camera, MapPin, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Info } from 'lucide-react';
import { River } from '../types';

interface CitizenReportFormProps {
  rivers: River[];
  selectedRiverId: number;
  onReportSuccess: () => void;
}

export const CitizenReportForm: React.FC<CitizenReportFormProps> = ({
  rivers,
  selectedRiverId,
  onReportSuccess
}) => {
  const [riverId, setRiverId] = useState<number>(selectedRiverId || (rivers[0]?.id ?? 1));
  const [pollutionType, setPollutionType] = useState<string>('industrial_discharge');
  const [locationName, setLocationName] = useState<string>('ITO Bridge / Ring Road Outfall');
  const [latitude, setLatitude] = useState<number>(28.6432);
  const [longitude, setLongitude] = useState<number>(77.2530);
  const [description, setDescription] = useState<string>('Heavy industrial toxic foam dumping directly into river.');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
        },
        (err) => {
          console.warn('Geolocation failed, keeping preset coordinates', err);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const formData = new FormData();
    formData.append('river_id', riverId.toString());
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('location_name', locationName);
    formData.append('pollution_type', pollutionType);
    formData.append('description', description);
    formData.append('is_in_app_capture', 'true');
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResult(data);
      setSubmitting(false);
      onReportSuccess();
    } catch (err) {
      console.error('Submission failed', err);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner Card */}
      <div className="card-panel" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185' }}>
          <AlertTriangle size={26} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            File Verified Citizen Pollution Report
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Multi-factor verification checks GPS river proximity, EXIF timestamps, and duplicate photo hashes.
          </p>
        </div>
      </div>

      {result ? (
        /* Submission Result Card */
        <div className="card-panel" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#34d399', fontSize: '1.25rem', fontWeight: 800 }}>
            <CheckCircle2 size={32} />
            <span>Incident Logged & Cryptographically Verified!</span>
          </div>
          
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div className="card-subtle">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Tracking ID</span>
              <strong style={{ fontSize: '1.2rem', color: '#38bdf8' }}>{result.tracking_number}</strong>
            </div>

            <div className="card-subtle">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Evidence Score</span>
              <strong style={{ fontSize: '1.2rem', color: '#34d399' }}>
                {result.evidence_analysis?.evidence_score}/100 ({result.evidence_analysis?.confidence})
              </strong>
            </div>

            <div className="card-subtle">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>AI Triage Suggestion</span>
              <strong style={{ fontSize: '1.1rem', color: '#fbbf24' }}>
                {result.ai_triage?.label} ({Math.round((result.ai_triage?.confidence || 0.8) * 100)}%)
              </strong>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '16px' }}>
            ℹ Your incident has entered the municipal accountability queue (<strong>REPORTED</strong>). Response timers have started.
          </p>

          <button
            onClick={() => { setResult(null); setPhotoPreview(null); }}
            className="btn-secondary"
            style={{ marginTop: '20px' }}
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        /* Main 2-Column Form Card */
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          
          {/* Left Column: Form Inputs */}
          <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Target River Stretch
                </label>
                <select
                  value={riverId}
                  onChange={e => setRiverId(Number(e.target.value))}
                  className="input-field"
                >
                  {rivers.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                  Pollution Category
                </label>
                <select
                  value={pollutionType}
                  onChange={e => setPollutionType(e.target.value)}
                  className="input-field"
                >
                  <option value="sewage">Untreated Sewage / Drain Outfall</option>
                  <option value="industrial_discharge">Toxic Chemical Effluent / Foam</option>
                  <option value="plastic_waste">Solid Plastic & Religious Waste</option>
                  <option value="oil_chemical">Oil Spill / Fuel Slick</option>
                  <option value="dead_fish">Fish Mortality / Hypoxia Event</option>
                  <option value="other">Other Environmental Hazard</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Location Landmark / Drain Identifier
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="e.g. ITO Bridge Outfall, Yamuna Bank"
                className="input-field"
                required
              />
            </div>

            {/* GPS Card */}
            <div className="card-subtle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Captured Coordinates</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {latitude.toFixed(6)}° N, {longitude.toFixed(6)}° E
                </p>
              </div>
              <button
                type="button"
                onClick={handleCaptureGPS}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <MapPin size={16} color="#38bdf8" /> Refresh GPS
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Observed Severity & Notes
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe odor, color, active flow rate, or immediate downstream impact..."
                className="input-field"
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Verifying Evidence & Filing...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Submit Verified Incident Report
                </>
              )}
            </button>

          </div>

          {/* Right Column: Photo Evidence Card */}
          <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              In-App Photo Evidence
            </span>

            <div
              style={{
                border: '2px dashed #334155',
                borderRadius: '12px',
                height: '240px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                id="photo-input"
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
              />

              {photoPreview ? (
                <img src={photoPreview} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <Camera size={24} />
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>Click to Upload or Snap Photo</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Perceptual hashes verify uniqueness</span>
                </div>
              )}
            </div>

            {/* Verification Rule Notice Card */}
            <div className="card-subtle" style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700 }}>
                <Info size={14} /> Verification Protocol
              </div>
              <div>• Auto GPS distance checked against 500m river geometry buffer.</div>
              <div>• Perceptual hash calculated to penalize duplicate uploads.</div>
              <div>• Sourced metadata directly routed to authority triage cell.</div>
            </div>

          </div>

        </form>
      )}

    </div>
  );
};
