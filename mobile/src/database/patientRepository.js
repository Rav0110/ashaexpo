import { getDatabase } from './db';
import { generateId } from '../utils/idGenerator';
import { nowISO } from '../utils/dateUtils';

/**
 * Insert a new patient into SQLite.
 */
export async function insertPatient(patient) {
  const db = await getDatabase();
  const id = patient.id || generateId();
  const createdAt = patient.created_at || nowISO();

  await db.runAsync(
    `INSERT INTO patients (id, name, age, sex, village, phone, asha_id, condition_type, sync_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, patient.name, patient.age, patient.sex, patient.village, patient.phone,
     patient.asha_id, patient.condition_type, 'offline', createdAt]
  );
  return { ...patient, id, created_at: createdAt, sync_status: 'offline' };
}

/**
 * Fetch all patients ordered by creation date.
 */
export async function getAllPatients() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM patients ORDER BY created_at DESC');
}

/**
 * Search patients by name or village.
 */
export async function searchPatients(query) {
  const db = await getDatabase();
  const term = `%${query}%`;
  return db.getAllAsync(
    'SELECT * FROM patients WHERE name LIKE ? OR village LIKE ? ORDER BY created_at DESC',
    [term, term]
  );
}

/**
 * Filter patients by condition type.
 */
export async function filterPatientsByCondition(conditionType) {
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM patients WHERE condition_type = ? ORDER BY created_at DESC',
    [conditionType]
  );
}

/**
 * Get a single patient by ID.
 */
export async function getPatientById(patientId) {
  const db = await getDatabase();
  return db.getFirstAsync('SELECT * FROM patients WHERE id = ?', [patientId]);
}

/**
 * Update patient sync status.
 */
export async function updatePatientSyncStatus(patientId, status) {
  const db = await getDatabase();
  await db.runAsync('UPDATE patients SET sync_status = ? WHERE id = ?', [status, patientId]);
}

/**
 * Count total patients.
 */
export async function countPatients() {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) as count FROM patients');
  return row?.count || 0;
}
