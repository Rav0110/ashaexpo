import React from 'react';

export default function StatsCard({ icon, value, label, color }) {
  // Determine background based on color (just a very light tint)
  const isDanger = color === '#D32F2F' || color === 'var(--danger-color)';
  const isWarning = color === '#F57C00' || color === 'var(--warning-color)';
  const isSuccess = color === '#4CAF50' || color === 'var(--success-color)';
  
  let iconBg = 'var(--bg-color)';
  let actualColor = 'var(--primary-color)';
  
  if (isDanger) { iconBg = 'var(--danger-bg)'; actualColor = 'var(--danger-color)'; }
  else if (isWarning) { iconBg = 'var(--warning-bg)'; actualColor = 'var(--warning-color)'; }
  else if (isSuccess) { iconBg = 'var(--success-bg)'; actualColor = 'var(--success-color)'; }

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)', 
      borderRadius: 'var(--radius-lg)', 
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flex: '1 1 200px',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ 
        width: '56px', height: '56px', 
        borderRadius: 'var(--radius-md)', 
        backgroundColor: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}
