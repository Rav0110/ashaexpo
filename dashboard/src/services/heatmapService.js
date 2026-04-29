import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// ── Deterministic Village → Coordinate Mapping ──
// Known demo villages positioned across a fictional central-India district.
// Unknown villages get a deterministic offset from center via name hash.

const DEMO_CENTER = [23.25, 80.35];

const KNOWN_VILLAGES = {
  'Rampur':      [23.31, 80.32],
  'Sundarpur':   [23.22, 80.41],
  'Mohanganj':   [23.18, 80.28],
  'Lakshmipur':  [23.35, 80.45],
  'Keshavnagar': [23.28, 80.22],
  'Devipatan':   [23.15, 80.38],
  'Chandrapur':  [23.38, 80.30],
  'Sitamarhi':   [23.20, 80.50],
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getVillageCoordinates(villageName) {
  if (KNOWN_VILLAGES[villageName]) return KNOWN_VILLAGES[villageName];
  const h = hashCode(villageName);
  const latOff = ((h & 0xFF) / 255 - 0.5) * 0.3;
  const lngOff = (((h >> 8) & 0xFF) / 255 - 0.5) * 0.3;
  return [DEMO_CENTER[0] + latOff, DEMO_CENTER[1] + lngOff];
}

// ── Firebase Aggregation Pipeline ──

/**
 * Fetch all patients, visits, and alerts from Firestore.
 * Aggregate per-village risk summaries + global totals.
 *
 * Returns { villageSummaries: VillageSummary[], globalTotals }
 */
export async function fetchHeatmapData() {
  const [patientsSnap, visitsSnap, alertsSnap] = await Promise.all([
    getDocs(collection(db, 'patients')),
    getDocs(collection(db, 'visits')),
    getDocs(collection(db, 'alerts')),
  ]);

  // Build lookup maps
  const patients = new Map();
  patientsSnap.forEach(d => patients.set(d.id, { id: d.id, ...d.data() }));

  const visits = [];
  visitsSnap.forEach(d => visits.push({ id: d.id, ...d.data() }));

  const alerts = [];
  alertsSnap.forEach(d => alerts.push({ id: d.id, ...d.data() }));

  // Per-village accumulator
  const villageMap = new Map();

  const getOrCreate = (village) => {
    if (!villageMap.has(village)) {
      villageMap.set(village, {
        village,
        coordinates: getVillageCoordinates(village),
        totalPatients: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        tbDefaulters: 0,
        missedVaccinations: 0,
        highRiskPregnancies: 0,
        activeAlerts: 0,
        riskScore: 0,
        recentPatients: [],
      });
    }
    return villageMap.get(village);
  };

  // 1. Count patients per village
  patients.forEach(p => {
    if (!p.village) return;
    getOrCreate(p.village).totalPatients++;
  });

  // 2. Aggregate visit-level metrics + track per-patient highest risk
  const patientRisk = new Map();

  visits.forEach(v => {
    const patient = patients.get(v.patient_id);
    const village = patient?.village || v.village;
    if (!village) return;

    const summary = getOrCreate(village);

    if (v.tb_followup_missed) summary.tbDefaulters++;
    if (v.vaccination_due && !v.vaccination_given) summary.missedVaccinations++;
    if (v.visit_type === 'ANC' && v.risk_level === 'high') summary.highRiskPregnancies++;

    // Track highest risk per patient
    const cur = patientRisk.get(v.patient_id);
    if (v.risk_level === 'high') {
      patientRisk.set(v.patient_id, 'high');
    } else if (v.risk_level === 'medium' && cur !== 'high') {
      patientRisk.set(v.patient_id, 'medium');
    }

    // Collect risky patients for sidebar drill-down
    if (v.risk_level === 'high' || v.risk_level === 'medium') {
      summary.recentPatients.push({
        patientId: v.patient_id,
        patientName: patient?.name || 'Unknown',
        riskLevel: v.risk_level,
        visitType: v.visit_type,
        riskFlags: v.risk_flags,
        createdAt: v.created_at,
      });
    }
  });

  // 3. Roll up per-patient risk into village counts
  patientRisk.forEach((level, patientId) => {
    const patient = patients.get(patientId);
    if (!patient?.village) return;
    const summary = getOrCreate(patient.village);
    if (level === 'high') summary.highRiskCount++;
    else if (level === 'medium') summary.mediumRiskCount++;
  });

  // 4. Aggregate active alerts per village
  alerts.forEach(a => {
    if (!a.village) return;
    if (a.status !== 'acknowledged') {
      getOrCreate(a.village).activeAlerts++;
    }
  });

  // 5. Compute risk scores, trim recent patients, collect results
  const villageSummaries = [];

  villageMap.forEach(s => {
    s.riskScore =
      (s.highRiskCount * 3) +
      (s.mediumRiskCount * 1) +
      (s.tbDefaulters * 2) +
      (s.missedVaccinations * 1);

    // Keep top 5, high risk first, then by date desc
    s.recentPatients.sort((a, b) => {
      if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
      if (a.riskLevel !== 'high' && b.riskLevel === 'high') return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
    s.recentPatients = s.recentPatients.slice(0, 5);

    villageSummaries.push(s);
  });

  const globalTotals = {
    totalPatients: patients.size,
    highRiskVillages: villageSummaries.filter(v => v.highRiskCount > 0).length,
    totalTbDefaulters: villageSummaries.reduce((acc, v) => acc + v.tbDefaulters, 0),
    totalMissedVaccinations: villageSummaries.reduce((acc, v) => acc + v.missedVaccinations, 0),
  };

  return { villageSummaries, globalTotals };
}
