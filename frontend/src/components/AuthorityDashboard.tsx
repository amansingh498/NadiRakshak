import React, { useState } from 'react';
import { Incident, IncidentEvent } from '../types';
import { CheckCircle2, AlertOctagon, ArrowRight } from 'lucide-react';

interface AuthorityDashboardProps {
  incidents: Incident[];
  onIncidentUpdated: () => void;
}

const LIFECYCLE_STEPS = [
  'REPORTED',
  'TRIAGED',
  'VERIFIED',
  'ASSIGNED',
  'UNDER_INVESTIGATION',
  'ACTION_TAKEN',
  'RESOLVED'
];

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  incidents,
  onIncidentUpdated
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(incidents[0]?.id || null);
  const [incidentDetail, setIncidentDetail] = useState<{
    incident: Incident;
    events: IncidentEvent[];
    sla: any;
    impact_snapshot: any;
  } | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const officerName = 'Inspector R. K. Verma';

  const fetchDetail = (id: number) => {
    setSelectedIncidentId(id);
    fetch(`/api/incidents/${id}`)
      .then(res => res.json())
      .then(data => setIncidentDetail(data))
      .catch(err => console.error('Failed to fetch detail', err));
  };

  React.useEffect(() => {
    if (selectedIncidentId) {
      fetchDetail(selectedIncidentId);
    } else if (incidents.length > 0) {
      fetchDetail(incidents[0].id);
    }
  }, [selectedIncidentId, incidents]);

  const handleTransition = async (targetStatus: string) => {
    if (!selectedIncidentId) return;
    setTransitioning(true);
    try {
      await fetch(`/api/incidents/${selectedIncidentId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_status: targetStatus,
          actor_name: officerName,
          actor_role: 'authority',
          note: noteInput || `Transitioned to ${targetStatus} after on-site review.`,
          baseline_bod: 22.4,
          baseline_do: 0.8,
          discharge_prevented_kld: 180.0
        })
      });
      setNoteInput('');
      setTransitioning(false);
      fetchDetail(selectedIncidentId);
      onIncidentUpdated();
    } catch (err) {
      console.error('Transition error', err);
      setTransitioning(false);
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 4 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        <div className="card-panel">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Incident Queue
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {incidents.filter(i => i.status !== 'RESOLVED').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pending resolution</span>
        </div>

        <div className="card-panel">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Critical Severity
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
            {incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ef4444aa' }}>Requires immediate triage</span>
        </div>

        <div className="card-panel">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Under Investigation
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {incidents.filter(i => ['UNDER_INVESTIGATION', 'ACTION_TAKEN'].includes(i.status)).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Inspectors dispatched</span>
        </div>

        <div className="card-panel">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resolved Clean
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {incidents.filter(i => i.status === 'RESOLVED').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981aa' }}>Remediation completed</span>
        </div>

      </div>

      {/* Main Grid: Queue List Card + Deep Dive Detail Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '20px' }}>
        
        {/* Left Column: Incidents Queue Card */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '760px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Incident Queue</h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{filteredIncidents.length} Records</span>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.8rem', padding: '8px 10px', background: '#1e293b' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">REPORTED</option>
              <option value="TRIAGED">TRIAGED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
              <option value="ACTION_TAKEN">ACTION_TAKEN</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.8rem', padding: '8px 10px', background: '#1e293b' }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Queue List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredIncidents.map(inc => {
              const isSelected = selectedIncidentId === inc.id;
              const sevColor = inc.severity === 'CRITICAL' ? '#ef4444' : inc.severity === 'HIGH' ? '#f97316' : '#f59e0b';
              return (
                <div
                  key={inc.id}
                  onClick={() => fetchDetail(inc.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: isSelected ? '#1e293b' : '#111827',
                    border: `1px solid ${isSelected ? '#38bdf8' : '#1f293d'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                      {inc.tracking_number}
                    </strong>
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '9999px', background: `${sevColor}22`, color: sevColor, fontWeight: 800, border: `1px solid ${sevColor}44` }}>
                      {inc.severity}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginTop: '6px' }}>
                    {inc.location_name}
                  </p>

                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{inc.status}</span>
                    <span>Evidence: {inc.evidence_score}/100</span>
                  </div>

                  {inc.sla?.is_breached && (
                    <div style={{ marginTop: '8px', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', fontSize: '0.7rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertOctagon size={12} /> SLA Overdue by +{inc.sla.overdue_hours}h
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Selected Incident Deep-Dive Card */}
        {incidentDetail ? (
          <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid #1f293d', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                    {incidentDetail.incident.tracking_number}
                  </h2>
                  <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    {incidentDetail.incident.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
                  Location: <strong>{incidentDetail.incident.location_name}</strong> ({incidentDetail.incident.latitude}, {incidentDetail.incident.longitude})
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Assigned Unit</span>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                  {incidentDetail.incident.assigned_to || 'Unassigned / Automated Triage'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                  {incidentDetail.incident.assigned_org || 'DPCC Triage Cell'}
                </span>
              </div>
            </div>

            {/* Lifecycle Stepper Card */}
            <div className="card-subtle">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                State Machine Lifecycle
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const currentIdx = LIFECYCLE_STEPS.indexOf(incidentDetail.incident.status);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <React.Fragment key={step}>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: isCurrent ? 'rgba(56, 189, 248, 0.25)' : isDone ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                        border: `1px solid ${isCurrent ? '#38bdf8' : isDone ? '#10b981' : '#1f293d'}`,
                        color: isCurrent ? '#38bdf8' : isDone ? '#34d399' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        {step}
                      </div>
                      {idx < LIFECYCLE_STEPS.length - 1 && (
                        <ArrowRight size={14} color={idx < currentIdx ? '#10b981' : '#475569'} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Evidence & AI Triage 2-Card Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              
              <div className="card-subtle">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Reported Citizen Evidence</span>
                <p style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '6px', lineHeight: 1.4 }}>
                  {incidentDetail.incident.description}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                  <span style={{ color: '#38bdf8' }}>Evidence Score: <strong>{incidentDetail.incident.evidence_score}/100</strong></span>
                  <span>•</span>
                  <span style={{ color: '#34d399' }}>Confidence: <strong>{incidentDetail.incident.confidence}</strong></span>
                </div>
              </div>

              <div className="card-subtle">
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase' }}>AI Vision & Triage Classification</span>
                <p style={{ fontSize: '0.9rem', color: '#ffffff', marginTop: '6px' }}>
                  Predicted: <strong style={{ color: '#38bdf8' }}>{incidentDetail.incident.ai_predicted_type || 'industrial_discharge'}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Confidence: <strong>{Math.round((incidentDetail.incident.ai_confidence || 0.88) * 100)}%</strong>
                </p>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '8px' }}>
                  * AI outputs are decision triage aids, not legal proof.
                </span>
              </div>

            </div>

            {/* Impact Snapshot (if verified) */}
            {incidentDetail.impact_snapshot && (
              <div className="card-subtle" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 800, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} /> Verified Remediation & Discharge Prevention
                </div>
                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Baseline BOD:</span> <strong>{incidentDetail.impact_snapshot.baseline_metrics?.bod_mgl} mg/L</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Follow-up BOD:</span> <strong style={{ color: '#34d399' }}>{incidentDetail.impact_snapshot.followup_metrics?.bod_mgl} mg/L</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Discharge Stopped:</span> <strong style={{ color: '#38bdf8' }}>{incidentDetail.impact_snapshot.discharge_prevented_kld} kL/day</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Authority Action Dispatch Box */}
            <div className="card-subtle" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block', marginBottom: '12px' }}>
                Authority Next Actions & State Transitions
              </strong>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {incidentDetail.incident.status === 'REPORTED' && (
                  <button onClick={() => handleTransition('TRIAGED')} disabled={transitioning} className="btn-primary">
                    Mark as Triaged
                  </button>
                )}
                {incidentDetail.incident.status === 'TRIAGED' && (
                  <button onClick={() => handleTransition('VERIFIED')} disabled={transitioning} className="btn-primary">
                    Verify Incident Evidence
                  </button>
                )}
                {['TRIAGED', 'VERIFIED'].includes(incidentDetail.incident.status) && (
                  <button onClick={() => handleTransition('ASSIGNED')} disabled={transitioning} className="btn-primary">
                    Assign to Municipal Drain Unit
                  </button>
                )}
                {incidentDetail.incident.status === 'ASSIGNED' && (
                  <button onClick={() => handleTransition('UNDER_INVESTIGATION')} disabled={transitioning} className="btn-primary">
                    Dispatch Inspector / Investigate Outfall
                  </button>
                )}
                {incidentDetail.incident.status === 'UNDER_INVESTIGATION' && (
                  <button onClick={() => handleTransition('ACTION_TAKEN')} disabled={transitioning} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    Record Action Taken (Boom Installed / Drain Plugged)
                  </button>
                )}
                {incidentDetail.incident.status === 'ACTION_TAKEN' && (
                  <button onClick={() => handleTransition('RESOLVED')} disabled={transitioning} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    Mark Resolved & Verified Clean
                  </button>
                )}
              </div>

              <input
                type="text"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add on-site inspection note or transition log..."
                className="input-field"
                style={{ marginTop: '12px' }}
              />
            </div>

            {/* Cryptographic Event Audit Trail */}
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Cryptographic Audit Log
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {incidentDetail.events.map(ev => (
                  <div key={ev.id} className="card-subtle" style={{ padding: '10px 14px', borderLeft: '3px solid #38bdf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontSize: '0.8rem' }}>
                      <strong>{ev.to_status}</strong>
                      <span style={{ color: '#64748b' }}>{new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                    <p style={{ color: '#94a3b8', marginTop: '2px', fontSize: '0.8rem' }}>
                      {ev.note} — <em>{ev.actor_name} ({ev.actor_role})</em>
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="card-panel" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Select an incident from the queue to review evidence and triage lifecycle.
          </div>
        )}

      </div>
    </div>
  );
};
