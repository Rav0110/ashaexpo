import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Fetch report data from Firestore visits and alerts.
 */
export async function fetchReportData(filters = {}) {
  const { village, month, year } = filters;

  // Build visits query
  let visitsRef = collection(db, 'visits');
  const visits = [];
  const snap = await getDocs(visitsRef);
  snap.forEach(d => {
    const data = { id: d.id, ...d.data() };
    // Apply client-side filters
    if (village && data.village !== village) return;
    if (month !== undefined && year !== undefined && data.created_at) {
      const date = new Date(data.created_at);
      if (date.getMonth() !== month || date.getFullYear() !== year) return;
    }
    visits.push(data);
  });

  // Build alerts query
  const alertsSnap = await getDocs(collection(db, 'alerts'));
  const alerts = [];
  alertsSnap.forEach(d => {
    const data = { id: d.id, ...d.data() };
    if (village && data.village !== village) return;
    if (month !== undefined && year !== undefined && data.created_at) {
      const date = new Date(data.created_at);
      if (date.getMonth() !== month || date.getFullYear() !== year) return;
    }
    alerts.push(data);
  });

  return {
    totalVisits: visits.length,
    ancVisits: visits.filter(v => v.visit_type === 'ANC').length,
    highRiskPregnancies: visits.filter(v => v.visit_type === 'ANC' && v.risk_level === 'high').length,
    tbFollowups: visits.filter(v => v.visit_type === 'TB Follow-up').length,
    childrenUnder5: visits.filter(v => v.visit_type === 'Child').length,
    vaccinationsDue: visits.filter(v => v.vaccination_due).length,
    vaccinationsGiven: visits.filter(v => v.vaccination_given).length,
    alertsGenerated: alerts.length,
    alertsAcknowledged: alerts.filter(a => a.status === 'acknowledged').length,
  };
}

/**
 * Get unique villages from alerts.
 */
export async function getVillages() {
  const snap = await getDocs(collection(db, 'alerts'));
  const villages = new Set();
  snap.forEach(d => {
    const v = d.data().village;
    if (v) villages.add(v);
  });
  return Array.from(villages).sort();
}
