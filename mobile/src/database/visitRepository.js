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
