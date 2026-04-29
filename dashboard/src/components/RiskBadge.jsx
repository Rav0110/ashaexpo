import React from 'react';

const RISK_STYLES = {
  high: { bg: 'var(--danger-bg)', color: 'var(--danger-color)', border: 'var(--danger-color)', label: 'High Risk', icon: '🔴' },
  medium: { bg: 'var(--warning-bg)', color: '#d97706', border: 'var(--warning-color)', label: 'Medium Risk', icon: '🟡' },
  none: { bg: 'var(--success-bg)', color: 'var(--success-color)', border: 'var(--success-color)', label: 'Low Risk', icon: '🟢' },
};

export default function RiskBadge({ level }) {
  const s = RISK_STYLES[level] || RISK_STYLES.none;
  return (
    <span style={{ 
      display:'inline-flex', 
      alignItems: 'center',
      gap: '6px',
      padding:'4px 10px', 
      borderRadius: '100px', 
      backgroundColor:s.bg, 
      color:s.color, 
      border: `1px solid ${s.bg}`,
      fontWeight:600, 
      fontSize:'12px',
      letterSpacing: '0.02em',
      textTransform: 'uppercase'
    }}>
      <span style={{ fontSize: '10px' }}>{s.icon}</span> {s.label}
    </span>
  );
}
