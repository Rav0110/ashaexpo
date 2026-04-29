import React from 'react';

export default function ReportTable({ data }) {
  if (!data) return null;
  const rows = [
    { label: 'Total Visits', value: data.totalVisits },
    { label: 'Pregnancy ANC Visits', value: data.ancVisits },
    { label: 'High-Risk Pregnancies', value: data.highRiskPregnancies },
    { label: 'TB Follow-ups', value: data.tbFollowups },
    { label: 'Children Under 5', value: data.childrenUnder5 },
    { label: 'Vaccinations Due', value: data.vaccinationsDue },
    { label: 'Vaccinations Given', value: data.vaccinationsGiven },
    { label: 'Alerts Generated', value: data.alertsGenerated },
    { label: 'Alerts Acknowledged', value: data.alertsAcknowledged },
  ];

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <thead>
        <tr style={{ backgroundColor: '#1B5E20' }}>
          <th style={{ padding: '14px 20px', textAlign: 'left', color: '#fff', fontSize: 15, fontWeight: 600 }}>Metric</th>
          <th style={{ padding: '14px 20px', textAlign: 'right', color: '#fff', fontSize: 15, fontWeight: 600 }}>Count</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #EEEEEE', backgroundColor: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
            <td style={{ padding: '14px 20px', fontSize: 15, color: '#212121', fontWeight: 500 }}>{r.label}</td>
            <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 20, fontWeight: 700, color: '#1B5E20' }}>{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
