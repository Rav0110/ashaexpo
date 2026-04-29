import React from 'react';

export default function VillageFilter({ villages, selected, onChange }) {
  const baseBtnStyle = {
    padding: '8px 16px', 
    borderRadius: '100px', 
    border: '1px solid',
    fontWeight: 500, 
    fontSize: '14px', 
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const getActiveStyle = (isActive) => ({
    borderColor: isActive ? 'var(--primary-color)' : 'var(--border-color)',
    backgroundColor: isActive ? 'var(--primary-color)' : 'var(--card-bg)',
    color: isActive ? '#fff' : 'var(--text-muted)',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
  });

  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-light)', marginRight: '4px' }}>
        Filter:
      </span>
      <button
        onClick={() => onChange('')}
        style={{ ...baseBtnStyle, ...getActiveStyle(!selected) }}
      >
        All Villages
      </button>
      {villages.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{ ...baseBtnStyle, ...getActiveStyle(selected === v) }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
