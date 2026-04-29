import React from 'react';

const RISK_STYLES = {
  high: { bg: '#FFEBEE', color: '#D32F2F', label: '🔴 HIGH RISK' },
  medium: { bg: '#FFF3E0', color: '#F57C00', label: '🟡 MEDIUM' },
  none: { bg: '#E8F5E9', color: '#4CAF50', label: '🟢 LOW' },
};

export default function RiskBadge({ level }) {
  const s = RISK_STYLES[level] || RISK_STYLES.none;
  return (
    <span style={{ display:'inline-block', padding:'4px 12px', borderRadius:8, backgroundColor:s.bg, color:s.color, fontWeight:700, fontSize:13 }}>
      {s.label}
    </span>
  );
}
