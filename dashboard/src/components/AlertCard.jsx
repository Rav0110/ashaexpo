import React from 'react';
import RiskBadge from './RiskBadge';

export default function AlertCard({ alert, onAcknowledge, onViewPatient }) {
  const flags = Array.isArray(alert.risk_flags)
    ? alert.risk_flags
    : (() => { try { return JSON.parse(alert.risk_flags || '[]'); } catch { return []; } })();
  const isAcked = alert.status === 'acknowledged';
  const borderColor = alert.risk_level === 'high' ? '#D32F2F' : '#F57C00';

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 12,
      borderLeft: `5px solid ${borderColor}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: isAcked ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <RiskBadge level={alert.risk_level} />
        <span style={{ fontSize: 13, color: '#9E9E9E' }}>
          {alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN') : ''}
        </span>
      </div>

      <h3 style={{ margin: '8px 0 4px', fontSize: 18, fontWeight: 700, color: '#212121' }}>
        {alert.patient_name || 'Unknown'}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: '#757575' }}>📍 {alert.village || 'N/A'}</p>

      {alert.asha_phone && (
        <p style={{ margin: '4px 0', fontSize: 14, color: '#1976D2' }}>
          📞 <a href={`tel:${alert.asha_phone}`} style={{ color: '#1976D2' }}>{alert.asha_phone}</a>
        </p>
      )}

      {flags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {flags.map((f, i) => (
            <span key={i} style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 6,
              backgroundColor: '#FFEBEE', color: '#D32F2F', fontSize: 12, fontWeight: 600,
            }}>
              {typeof f === 'string' ? f.replace(/_/g, ' ') : f}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {!isAcked ? (
          <button onClick={() => onAcknowledge(alert.id)} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            backgroundColor: '#1B5E20', color: '#fff', fontWeight: 600, fontSize: 14,
          }}>
            ✅ Acknowledge
          </button>
        ) : (
          <span style={{ padding: '10px 20px', borderRadius: 10, backgroundColor: '#E8F5E9', color: '#4CAF50', fontWeight: 600, fontSize: 14 }}>
            ✅ Acknowledged {alert.acknowledged_at ? `at ${new Date(alert.acknowledged_at).toLocaleTimeString('en-IN')}` : ''}
          </span>
        )}
      </div>
    </div>
  );
}
