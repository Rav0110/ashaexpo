import React, { useEffect } from 'react';
import RiskBadge from './RiskBadge';

export default function PatientSidePanel({ alert, onClose }) {
  // Prevent scrolling on body when panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!alert) return null;
  const flags = Array.isArray(alert.risk_flags)
    ? alert.risk_flags
    : (() => { try { return JSON.parse(alert.risk_flags || '[]'); } catch { return []; } })();

  return (
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 999,
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '420px', height: '100vh',
        backgroundColor: 'var(--card-bg)', 
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000, 
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '24px', borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>Patient Details</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>ID: {alert.id.substring(0,8)}...</p>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', 
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Name</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>{alert.patient_name}</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Village</div>
              <div style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {alert.village}
              </div>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>Status</div>
              <div style={{ fontSize: '15px', color: alert.status === 'acknowledged' ? 'var(--success-color)' : 'var(--warning-color)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {alert.status === 'acknowledged' ? '✅ Acknowledged' : '⏳ Pending'}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Assessment</div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <RiskBadge level={alert.risk_level} />
              </div>
              
              {flags.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>Triggered Flags:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {flags.map((f, i) => (
                      <span key={i} style={{ 
                        padding: '6px 12px', borderRadius: 'var(--radius-md)', 
                        backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', 
                        fontSize: '13px', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' 
                      }}>
                        {typeof f === 'string' ? f.replace(/_/g, ' ') : f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              {alert.asha_phone && (
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ASHA Worker Phone</div>
                    <div style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>{alert.asha_phone}</div>
                  </div>
                  <a href={`tel:${alert.asha_phone}`} style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </a>
                </div>
              )}
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Created At</div>
                <div style={{ fontSize: '15px', color: 'var(--text-main)', fontWeight: 500, marginTop: '2px' }}>
                  {alert.created_at ? new Date(alert.created_at).toLocaleString('en-IN', {
                    dateStyle: 'full', timeStyle: 'short'
                  }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
