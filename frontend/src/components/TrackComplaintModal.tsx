import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, AlertTriangle, Building, MapPin, X, ArrowRight, Activity } from 'lucide-react';
import { IncidentTrackResponse, IncidentTrackEvent } from '../types';

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackingNumber?: string;
}

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  isOpen,
  onClose,
  initialTrackingNumber = ''
}) => {

  const [trackingNumber, setTrackingNumber] = useState<string>(initialTrackingNumber);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IncidentTrackResponse | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a valid tracking number (e.g. R-2026-1001)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/incidents/track/${encodeURIComponent(trackingNumber.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Complaint not found. Please verify the tracking number.');
      }
      const data: IncidentTrackResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to find tracking record.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REPORTED': return '#f59e0b';
      case 'VERIFIED':
      case 'TRIAGED': return '#3b82f6';
      case 'ASSIGNED':
      case 'UNDER_INVESTIGATION': return '#8b5cf6';
      case 'ACTION_TAKEN':
      case 'RESOLVED':
      case 'POST_RESOLUTION_CHECK': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 11, 24, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '20px',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.3))',
              border: '1px solid rgba(6,182,212,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4'
            }}>
              <Search size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Track Your Pollution Report
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                Real-time official lifecycle & remediation tracker for citizens
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
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Enter Incident ID (e.g. R-2026-1001 or #R1001)..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 22px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Searching...' : 'Track'} <ArrowRight size={16} />
          </button>
        </form>

        {error && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.88rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Sample Search suggestions */}
        {!result && !error && (
          <div style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
              💡 QUICK TEST NUMBERS:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['R-2026-1001', 'R-2026-1002', 'R-2026-1003'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setTrackingNumber(num);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#38bdf8',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Result Display */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Status Summary Card */}
            <div style={{
              padding: '18px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${getStatusColor(result.incident.status)}40`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '4px',
                background: getStatusColor(result.incident.status)
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '0.5px'
                    }}>
                      #{result.incident.tracking_number}
                    </span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: `${getStatusColor(result.incident.status)}25`,
                      color: getStatusColor(result.incident.status),
                      border: `1px solid ${getStatusColor(result.incident.status)}`
                    }}>
                      {result.incident.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem' }}>
                    <MapPin size={14} />
                    <span>{result.incident.location_name}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reported On</div>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                    {new Date(result.incident.reported_at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                fontSize: '0.82rem'
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Pollution Type:</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc', textTransform: 'capitalize' }}>
                    {result.incident.pollution_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Assigned Authority:</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Building size={13} color="#38bdf8" />
                    <span>{result.incident.assigned_org}</span>
                  </div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>SLA Status:</span>
                  <div style={{
                    fontWeight: 600,
                    color: result.incident.sla.breached ? '#ef4444' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={13} />
                    <span>
                      {result.incident.sla.breached
                        ? 'SLA Escalated'
                        : `${Math.round(result.incident.sla.remaining_hours)}h remaining`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remediation Environmental Impact (If action was taken) */}
            {result.remediation_snapshot && result.remediation_snapshot.discharge_prevented_kld && (
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.12))',
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(16,185,129,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}>
                  <Activity size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                    Remediation Impact Verified
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    Stopped <strong>{result.remediation_snapshot.discharge_prevented_kld} KLD</strong> of untreated discharge. BOD reduced by <strong>{result.remediation_snapshot.bod_reduction_pct}%</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* Official Timeline Audit */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px' }}>
                Official Action Timeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.timeline.map((evt: IncidentTrackEvent, idx: number) => (
                  <div key={evt.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                    {/* Connecting line */}
                    {idx < result.timeline.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '14px',
                        top: '26px',
                        bottom: '-12px',
                        width: '2px',
                        background: 'rgba(255, 255, 255, 0.1)'
                      }} />
                    )}
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: `2px solid ${getStatusColor(evt.to_status)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: getStatusColor(evt.to_status),
                      zIndex: 2,
                      flexShrink: 0
                    }}>
                      {idx === result.timeline.length - 1 ? <CheckCircle2 size={16} /> : <Clock size={14} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                          {evt.to_status.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(evt.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500, margin: '2px 0' }}>
                        {evt.actor_name} ({evt.actor_role})
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {evt.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
