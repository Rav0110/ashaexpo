import React, { useState, useEffect } from 'react';
import { fetchReportData, getVillages } from '../services/reportService';
import ReportTable from '../components/ReportTable';
import VillageFilter from '../components/VillageFilter';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ReportsPage() {
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getVillages().then(setVillages); }, []);

  useEffect(() => {
    setLoading(true);
    fetchReportData({ village: selectedVillage || undefined, month: selectedMonth, year: selectedYear })
      .then(setData).finally(() => setLoading(false));
  }, [selectedVillage, selectedMonth, selectedYear]);

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, color: '#212121' }}>
          HMIS Monthly Summary — ASHA Village Report
        </h2>

        <VillageFilter villages={villages} selected={selectedVillage} onChange={setSelectedVillage} />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E0E0E0', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handlePrint} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            backgroundColor: '#1B5E20', color: '#fff', fontWeight: 600, fontSize: 14,
          }}>
            🖨️ Print / Export
          </button>
        </div>
      </div>

      <div id="report-content">
        <div className="print-only" style={{ display: 'none', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>HMIS Monthly Summary — ASHA Village Report</h1>
          <p>{selectedVillage || 'All Villages'} • {MONTHS[selectedMonth]} {selectedYear}</p>
        </div>
        {loading ? <p style={{ textAlign: 'center', color: '#9E9E9E', padding: 40 }}>Loading...</p> : <ReportTable data={data} />}
      </div>
    </div>
  );
}
