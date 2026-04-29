import React from 'react';

export default function PatientSidePanel({ alert, onClose }) {
  if (!alert) return null;
  const flags = Array.isArray(alert.risk_flags)
    ? alert.risk_flags
    : (() => { try { return JSON.parse(alert.risk_flags || '[]'); } catch { return []; } })();

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: 380, height: '100vh',
      backgroundColor: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
      zIndex: 1000, overflowY: 'auto', padding: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#212121' }}>Patient Details</h2>
        <button onClick={onClose} style={{
          border: 'none', background: '#F5F5F5', borderRadius: 8, padding: '8px 12px',
          cursor: 'pointer', fontSize: 16, fontWeight: 600,
        }}>✕</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>Patient Name</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>{alert.patient_name}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>Village</div>
        <div style={{ fontSize: 16, color: '#212121' }}>📍 {alert.village}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>Risk Level</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: alert.risk_level === 'high' ? '#D32F2F' : '#F57C00' }}>
          {alert.risk_level?.toUpperCase()}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>Risk Flags</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {flags.map((f, i) => (
            <span key={i} style={{ padding: '4px 10px', borderRadius: 6, backgroundColor: '#FFEBEE', color: '#D32F2F', fontSize: 12, fontWeight: 600 }}>
              {typeof f === 'string' ? f.replace(/_/g, ' ') : f}
            </span>
          ))}
        </div>
      </div>
      {alert.asha_phone && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>ASHA Phone</div>
          <a href={`tel:${alert.asha_phone}`} style={{ fontSize: 16, color: '#1976D2', fontWeight: 600 }}>📞 {alert.asha_phone}</a>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>Status</div>
        <div style={{ fontSize: 16, color: alert.status === 'acknowledged' ? '#4CAF50' : '#F57C00', fontWeight: 600 }}>
          {alert.status === 'acknowledged' ? '✅ Acknowledged' : '⏳ Pending'}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, color: '#9E9E9E', marginBottom: 4 }}>Created</div>
        <div style={{ fontSize: 14, color: '#212121' }}>
          {alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN') : 'N/A'}
        </div>
      </div>
    </div>
  );
}
