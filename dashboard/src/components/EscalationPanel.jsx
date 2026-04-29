import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { acknowledgeAlert } from '../services/alertService';
import { generateEscalationSummary } from '../utils/escalationSummary';
import RiskBadge from './RiskBadge';

/**
 * Unified alert detail panel for ALL alert risk levels.
 * - High risk   → Escalation Mode (full AI clinical summary, 3 action buttons)
 * - Medium/Low  → Observation Mode (lighter summary, 1 action button)
 * Fixed right slide-in panel with backdrop overlay.
 */
export default function EscalationPanel({ alert, onClose }) {
  const [actions, setActions] = useState({ reviewed: false, doctorCalled: false, referred: false });
  const [saving, setSaving] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // Reset actions when alert changes
  useEffect(() => {
    setActions({
      reviewed: alert?.status === 'acknowledged',
      doctorCalled: !!alert?.doctor_notified,
      referred: alert?.status === 'referred',
    });
  }, [alert?.id]);

  if (!alert) return null;

  const isHigh = alert.risk_level === 'high';
  const isMedium = alert.risk_level === 'medium';
  const escalation = generateEscalationSummary(alert);

  // Parse risk flags
  const flags = Array.isArray(alert.risk_flags)
    ? alert.risk_flags
    : (() => { try { return JSON.parse(alert.risk_flags || '[]'); } catch { return []; } })();

  // --- Action handlers ---
  const handleReviewed = async () => {
    setSaving('reviewed');
    try {
      await acknowledgeAlert(alert.id);
      setActions(prev => ({ ...prev, reviewed: true }));
    } catch (e) { console.error('Review failed:', e); }
    setSaving('');
  };

  const handleDoctorCalled = async () => {
    setSaving('doctor');
    try {
      await updateDoc(doc(db, 'alerts', alert.id), {
        doctor_notified: true,
        doctor_notified_at: new Date().toISOString(),
      });
      setActions(prev => ({ ...prev, doctorCalled: true }));
    } catch (e) { console.error('Doctor notify failed:', e); }
    setSaving('');
  };

  const handleReferral = async () => {
    setSaving('referral');
    try {
      await updateDoc(doc(db, 'alerts', alert.id), {
        status: 'referred',
        referred_at: new Date().toISOString(),
      });
      setActions(prev => ({ ...prev, referred: true }));
    } catch (e) { console.error('Referral failed:', e); }
    setSaving('');
  };

  // Mode styling
  const accentColor = isHigh ? 'var(--danger-color)' : 'var(--primary-color)';
  const headerBg = isHigh ? '#FEF2F2' : '#F0FFF4';
  const modeTitle = isHigh ? '⚕️ Medical Escalation' : '📋 Patient Review';
  const modeSubtitle = isHigh ? 'Clinical assessment generated from risk flags' : 'Observation summary for monitoring';

  // Urgency badge styling
  const urgencyColors = {
    CRITICAL: { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
    URGENT:   { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
    ELEVATED: { bg: '#FEF9C3', color: '#CA8A04', border: '#FEF08A' },
    MONITOR:  { bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0' },
  };
  const uBadge = urgencyColors[escalation.urgency] || urgencyColors.MONITOR;

  return (
    <>
      {/* Backdrop */}
      <div className="escalation-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="escalation-panel">
        {/* Header */}
        <div className="escalation-header" style={{ backgroundColor: headerBg, borderLeft: `4px solid ${accentColor}` }}>
          <div>
            <div className="escalation-header-title" style={{ color: accentColor }}>{modeTitle}</div>
            <div className="escalation-header-sub">{modeSubtitle}</div>
          </div>
          <button onClick={onClose} className="escalation-close" aria-label="Close panel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="escalation-content">

          {/* Patient Identity */}
          <div className="escalation-section">
            <div className="escalation-patient-name">{alert.patient_name || 'Unknown Patient'}</div>
            <div className="escalation-patient-meta">
              <span>📍 {alert.village || 'N/A'}</span>
              {alert.asha_phone && <span>📞 {alert.asha_phone}</span>}
            </div>
            <div style={{ marginTop: '10px' }}>
              <RiskBadge level={alert.risk_level} />
            </div>
          </div>

          {/* Risk Flags */}
          {flags.length > 0 && (
            <div className="escalation-section">
              <div className="escalation-section-label">Risk Flags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {flags.map((f, i) => (
                  <span key={i} className="escalation-flag-tag">
                    {typeof f === 'string' ? f.replace(/_/g, ' ') : f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Clinical Assessment */}
          <div className="escalation-section">
            <div className="escalation-section-label">
              {isHigh ? 'AI Clinical Assessment' : 'Observation Summary'}
            </div>
            <div className="escalation-ai-card">
              <div className="escalation-ai-text">{escalation.summary}</div>
            </div>
          </div>

          {/* Urgency Badge */}
          <div className="escalation-section">
            <div className="escalation-section-label">Urgency Classification</div>
            <div className="escalation-urgency" style={{
              backgroundColor: uBadge.bg, color: uBadge.color, border: `1px solid ${uBadge.border}`
            }}>
              <span className="escalation-urgency-dot" style={{ backgroundColor: uBadge.color }} />
              {escalation.urgency}
            </div>
          </div>

          {/* Recommendation */}
          {(isHigh || isMedium) && (
            <div className="escalation-section">
              <div className="escalation-section-label">Recommendation</div>
              <div className="escalation-rec-text">{escalation.recommendation}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="escalation-section">
            <div className="escalation-section-label">Supervisor Actions</div>
            <div className="escalation-actions">
              <button
                className={`escalation-action-btn ${actions.reviewed ? 'done' : ''}`}
                onClick={handleReviewed}
                disabled={actions.reviewed || saving === 'reviewed'}
              >
                <span>{actions.reviewed ? '✅' : '☐'}</span>
                <span>{saving === 'reviewed' ? 'Saving…' : actions.reviewed ? 'Reviewed' : 'Mark Reviewed'}</span>
              </button>

              {(isHigh || isMedium) && (
                <button
                  className={`escalation-action-btn ${actions.doctorCalled ? 'done' : ''}`}
                  onClick={handleDoctorCalled}
                  disabled={actions.doctorCalled || saving === 'doctor'}
                >
                  <span>{actions.doctorCalled ? '📞' : '☐'}</span>
                  <span>{saving === 'doctor' ? 'Saving…' : actions.doctorCalled ? 'Doctor Contacted' : 'Contact Doctor'}</span>
                </button>
              )}

              {isHigh && (
                <button
                  className={`escalation-action-btn escalation-action-referral ${actions.referred ? 'done' : ''}`}
                  onClick={handleReferral}
                  disabled={actions.referred || saving === 'referral'}
                >
                  <span>{actions.referred ? '🏥' : '☐'}</span>
                  <span>{saving === 'referral' ? 'Saving…' : actions.referred ? 'Referral Initiated' : 'Initiate Referral'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="escalation-section escalation-timestamp">
            Created: {alert.created_at
              ? new Date(alert.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
              : 'N/A'}
          </div>

        </div>
      </div>
    </>
  );
}
