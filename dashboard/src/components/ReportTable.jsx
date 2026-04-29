import React from 'react';

export default function ReportTable({ data }) {
  if (!data) return null;
  const rows = [
    { label: 'Total Visits', value: data.totalVisits },
    { label: 'Pregnancy ANC Visits', value: data.ancVisits },
    { label: 'High-Risk Pregnancies', value: data.highRiskPregnancies, highlight: true },
    { label: 'TB Follow-ups', value: data.tbFollowups },
    { label: 'Children Under 5', value: data.childrenUnder5 },
    { label: 'Vaccinations Due', value: data.vaccinationsDue },
    { label: 'Vaccinations Given', value: data.vaccinationsGiven },
    { label: 'Alerts Generated', value: data.alertsGenerated },
    { label: 'Alerts Acknowledged', value: data.alertsAcknowledged },
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metric</th>
            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ 
              borderBottom: '1px solid var(--border-color)', 
              backgroundColor: i % 2 === 0 ? 'var(--card-bg)' : 'var(--bg-color)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'var(--card-bg)' : 'var(--bg-color)'; }}
            >
              <td style={{ padding: '16px 24px', fontSize: '15px', color: 'var(--text-main)', fontWeight: 500 }}>
                {r.label}
              </td>
              <td style={{ 
                padding: '16px 24px', textAlign: 'right', fontSize: '16px', fontWeight: 700, 
                color: r.highlight && r.value > 0 ? 'var(--danger-color)' : 'var(--text-main)' 
              }}>
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
