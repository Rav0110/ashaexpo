import { getDatabase } from './db';
import { generateId } from '../utils/idGenerator';
import { nowISO } from '../utils/dateUtils';

/**
 * Insert a visit into SQLite.
 */
export async function insertVisit(visit) {
  const db = await getDatabase();
  const id = visit.id || generateId();
  const createdAt = visit.created_at || nowISO();

  await db.runAsync(
    `INSERT INTO visits
     (id, patient_id, visit_type, anc_number, trimester, bp_systolic, bp_diastolic,
      weight_kg, muac_cm, temperature_c, gestational_weeks, bleeding, seizure,
      breathlessness, tb_cough_weeks, tb_followup_missed, vaccination_due,
      vaccination_given, postnatal_day, raw_note, parsed_fields, audio_path,
      risk_level, risk_flags, sync_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, visit.patient_id, visit.visit_type,
      visit.anc_number || null, visit.trimester || null,
      visit.bp_systolic || null, visit.bp_diastolic || null,
      visit.weight_kg || null, visit.muac_cm || null,
      visit.temperature_c || null, visit.gestational_weeks || null,
      visit.bleeding ? 1 : 0, visit.seizure ? 1 : 0,
      visit.breathlessness ? 1 : 0,
      visit.tb_cough_weeks || null, visit.tb_followup_missed ? 1 : 0,
      visit.vaccination_due ? 1 : 0, visit.vaccination_given ? 1 : 0,
      visit.postnatal_day || null,
      visit.raw_note || '', visit.parsed_fields || '{}',
      visit.audio_path || null,
      visit.risk_level || 'none', visit.risk_flags || '[]',
      'offline', createdAt,
    ]
  );
  return { ...visit, id, created_at: createdAt, sync_status: 'offline' };
}

/**
 * Get all visits for a specific patient.
 */
export async function getVisitsByPatientId(patientId) {
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM visits WHERE patient_id = ? ORDER BY created_at DESC',
    [patientId]
  );
}

/**
 * Count visits, optionally filtered by type.
 */
export async function countVisits(visitType) {
  const db = await getDatabase();
  if (visitType) {
    const row = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM visits WHERE visit_type = ?', [visitType]
    );
    return row?.count || 0;
  }
  const row = await db.getFirstAsync('SELECT COUNT(*) as count FROM visits');
  return row?.count || 0;
}

/**
 * Count visits created today.
 */
export async function countVisitsToday() {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const row = await db.getFirstAsync(
    "SELECT COUNT(*) as count FROM visits WHERE created_at LIKE ?",
    [`${today}%`]
  );
  return row?.count || 0;
}

/**
 * Update visit sync status.
 */
export async function updateVisitSyncStatus(visitId, status) {
  const db = await getDatabase();
  await db.runAsync('UPDATE visits SET sync_status = ? WHERE id = ?', [status, visitId]);
}

/**
 * Count vaccinations due / given.
 */
export async function countVaccinations() {
  const db = await getDatabase();
  const due = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM visits WHERE vaccination_due = 1'
  );
  const given = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM visits WHERE vaccination_given = 1'
  );
  return { due: due?.count || 0, given: given?.count || 0 };
}

/**
 * Check if a patient already has a visit recorded today.
 * Returns the existing visit(s) or an empty array.
 */
export async function getVisitsForPatientToday(patientId) {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  return db.getAllAsync(
    "SELECT * FROM visits WHERE patient_id = ? AND created_at LIKE ? ORDER BY created_at DESC",
    [patientId, `${today}%`]
  );
}

/**
 * Get the highest risk level for each patient (from their most recent visit).
 * Returns an object mapping patient_id → { risk_level, risk_flags, last_visit_date }.
 */
export async function getPatientRiskMap() {
  const db = await getDatabase();
  // Get the latest visit per patient with its risk info
  const rows = await db.getAllAsync(`
    SELECT v.patient_id, v.risk_level, v.risk_flags, v.created_at
    FROM visits v
    INNER JOIN (
      SELECT patient_id, MAX(created_at) as max_date
      FROM visits
      GROUP BY patient_id
    ) latest ON v.patient_id = latest.patient_id AND v.created_at = latest.max_date
  `);

  const map = {};
  for (const row of rows) {
    // If multiple visits on the same max_date, pick the higher risk
    if (!map[row.patient_id] || riskPriority(row.risk_level) > riskPriority(map[row.patient_id].risk_level)) {
      map[row.patient_id] = {
        risk_level: row.risk_level || 'none',
        risk_flags: row.risk_flags || '[]',
        last_visit_date: row.created_at,
      };
    }
  }
  return map;
}

function riskPriority(level) {
  if (level === 'high') return 2;
  if (level === 'medium') return 1;
  return 0;
}

