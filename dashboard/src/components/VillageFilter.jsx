import React from 'react';

export default function VillageFilter({ villages, selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      <button
        onClick={() => onChange('')}
        style={{
          padding: '8px 16px', borderRadius: 20, border: '1.5px solid',
          borderColor: !selected ? '#1B5E20' : '#E0E0E0',
          backgroundColor: !selected ? '#E8F5E9' : '#fff',
          color: !selected ? '#1B5E20' : '#757575',
          fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}
      >
        All Villages
      </button>
      {villages.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            padding: '8px 16px', borderRadius: 20, border: '1.5px solid',
            borderColor: selected === v ? '#1B5E20' : '#E0E0E0',
            backgroundColor: selected === v ? '#E8F5E9' : '#fff',
            color: selected === v ? '#1B5E20' : '#757575',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          📍 {v}
        </button>
      ))}
    </div>
  );
}
