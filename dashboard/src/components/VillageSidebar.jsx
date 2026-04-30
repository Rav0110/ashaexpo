import React from 'react';
import RiskBadge from './RiskBadge';

/**
 * Compact village drill-down sidebar for supervisors.
 * Shows summary metrics, recent risky patients, and active alert count.
 * Only rendered when a village marker is clicked.
 */
export default function VillageSidebar({ village, onClose }) {
  if (!village) return null;

  const parseFlags = (raw) => {
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw || '[]'); } catch { return []; }
  };

  return (
    <div className="heatmap-sidebar">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div>
          <div className="heatmap-sidebar-title">
            <span style={{ marginRight: '6px' }}>📍</span>
            {village.village}
          </div>
          <div className="heatmap-sidebar-subtitle">
            {village.totalPatients} registered patient{village.totalPatients !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#F5F5F5', border: '1px solid #E0E0E0',
            borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9E9E9E', fontSize: '16px', flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EEEEEE'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F5F5F5'; }}
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Metric Cards — 2×2 grid */}
      <div className="heatmap-sidebar-metrics">
        <div className="heatmap-metric-card">
          <div className="heatmap-metric-value" style={{ color: '#EF4444' }}>{village.highRiskCount}</div>
          <div className="heatmap-metric-label">High Risk</div>
        </div>
        <div className="heatmap-metric-card">
          <div className="heatmap-metric-value" style={{ color: '#F59E0B' }}>{village.tbDefaulters}</div>
          <div className="heatmap-metric-label">TB Default</div>
        </div>
        <div className="heatmap-metric-card">
          <div className="heatmap-metric-value" style={{ color: '#F59E0B' }}>{village.missedVaccinations}</div>
          <div className="heatmap-metric-label">Vacc. Missed</div>
        </div>
        <div className="heatmap-metric-card">
          <div className="heatmap-metric-value" style={{ color: '#EF4444' }}>{village.activeAlerts}</div>
          <div className="heatmap-metric-label">Active Alerts</div>
        </div>
      </div>

      {/* Recent Risky Patients */}
      {village.recentPatients.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div className="heatmap-section-title">Risky Patients</div>
          {village.recentPatients.map((p, i) => (
            <div key={`${p.patientId}-${i}`} className="heatmap-patient-row">
              <div>
                <div className="heatmap-patient-name">{p.patientName}</div>
                <div className="heatmap-patient-type">{p.visitType || 'Visit'}</div>
              </div>
              <RiskBadge level={p.riskLevel} />
            </div>
          ))}
        </div>
      )}

      {/* Active Alert Snippets */}
      {village.activeAlerts > 0 && (
        <div>
          <div className="heatmap-section-title">Alert Summary</div>
          <div className="heatmap-alert-snippet">
            <span className="heatmap-alert-icon">🔔</span>
            <span className="heatmap-alert-text">
              <strong>{village.activeAlerts}</strong> unacknowledged alert{village.activeAlerts !== 1 ? 's' : ''} pending supervisor review
            </span>
          </div>
          {village.highRiskPregnancies > 0 && (
            <div className="heatmap-alert-snippet">
              <span className="heatmap-alert-icon">🤰</span>
              <span className="heatmap-alert-text">
                <strong>{village.highRiskPregnancies}</strong> high-risk pregnanc{village.highRiskPregnancies !== 1 ? 'ies' : 'y'} flagged
              </span>
            </div>
          )}
          {village.tbDefaulters > 0 && (
            <div className="heatmap-alert-snippet">
              <span className="heatmap-alert-icon">🦠</span>
              <span className="heatmap-alert-text">
                <strong>{village.tbDefaulters}</strong> TB follow-up defaulter{village.tbDefaulters !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state — low risk village */}
      {village.recentPatients.length === 0 && village.activeAlerts === 0 && (
        <div style={{
          textAlign: 'center', padding: '24px 16px',
          color: '#9E9E9E', fontSize: '14px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }}>✅</div>
          No active risk flags in this village.
        </div>
      )}
    </div>
  );
}
