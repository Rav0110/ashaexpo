import React, { useState, useEffect, useRef } from 'react';
import { subscribeToAlerts, acknowledgeAlert } from '../services/alertService';
import { playAlertSound } from '../services/audioService';
import AlertCard from '../components/AlertCard';
import VillageFilter from '../components/VillageFilter';
import StatsCard from '../components/StatsCard';
import PatientSidePanel from '../components/PatientSidePanel';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const isFirst = useRef(true);

  useEffect(() => {
    const unsub = subscribeToAlerts((allAlerts, changes) => {
      setAlerts(allAlerts);
      // Extract unique villages
      const vs = [...new Set(allAlerts.map(a => a.village).filter(Boolean))].sort();
      setVillages(vs);
      // Play sound for new high-risk alerts (skip initial load)
      if (!isFirst.current) {
        const added = changes.filter(c => c.type === 'added');
        const hasNewHigh = added.some(c => c.doc.data().risk_level === 'high');
        if (hasNewHigh) playAlertSound();
      }
      isFirst.current = false;
    });
    return () => unsub();
  }, []);

  const filtered = selectedVillage
    ? alerts.filter(a => a.village === selectedVillage)
    : alerts;

  const highCount = filtered.filter(a => a.risk_level === 'high' && a.status !== 'acknowledged').length;
  const medCount = filtered.filter(a => a.risk_level === 'medium' && a.status !== 'acknowledged').length;
  const ackedCount = filtered.filter(a => a.status === 'acknowledged').length;

  const handleAck = async (id) => {
    try { await acknowledgeAlert(id); } catch (err) { console.error('Ack failed:', err); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatsCard icon="🔴" value={highCount} label="High Risk Pending" color="#D32F2F" />
        <StatsCard icon="🟡" value={medCount} label="Medium Risk Pending" color="#F57C00" />
        <StatsCard icon="✅" value={ackedCount} label="Acknowledged" color="#4CAF50" />
        <StatsCard icon="📋" value={filtered.length} label="Total Alerts" color="#1976D2" />
      </div>

      <VillageFilter villages={villages} selected={selectedVillage} onChange={setSelectedVillage} />

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#9E9E9E' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>No alerts yet</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Alerts will appear here in real time when synced from the mobile app.</div>
        </div>
      )}

      {filtered.map(a => (
        <AlertCard key={a.id} alert={a} onAcknowledge={handleAck} onViewPatient={() => setSelectedAlert(a)} />
      ))}

      {selectedAlert && (
        <PatientSidePanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
