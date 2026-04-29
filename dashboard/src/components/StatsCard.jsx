import React from 'react';

export default function StatsCard({ icon, value, label, color }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 14, padding: '20px 16px',
      textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderTop: `4px solid ${color || '#1B5E20'}`, minWidth: 140, flex: 1,
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || '#1B5E20', marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#757575', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}
