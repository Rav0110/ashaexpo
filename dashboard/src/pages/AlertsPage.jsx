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
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Live Alerts</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Monitor and respond to village health reports in real-time.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatsCard icon="🚨" value={highCount} label="High Risk Pending" color="var(--danger-color)" />
        <StatsCard icon="⚠️" value={medCount} label="Medium Risk Pending" color="var(--warning-color)" />
        <StatsCard icon="✅" value={ackedCount} label="Acknowledged" color="var(--success-color)" />
        <StatsCard icon="📋" value={filtered.length} label="Total Alerts" color="var(--primary-color)" />
      </div>

      <VillageFilter villages={villages} selected={selectedVillage} onChange={setSelectedVillage} />

      {filtered.length === 0 && (
        <div style={{ 
          textAlign: 'center', padding: '80px 24px', 
          backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>No alerts found</div>
          <div style={{ fontSize: '15px', marginTop: '8px', color: 'var(--text-muted)' }}>
            {selectedVillage ? `No alerts for ${selectedVillage}.` : 'Alerts will appear here in real time when synced.'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filtered.map(a => (
          <AlertCard key={a.id} alert={a} onAcknowledge={handleAck} onViewPatient={() => setSelectedAlert(a)} />
        ))}
      </div>

      {selectedAlert && (
        <PatientSidePanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
