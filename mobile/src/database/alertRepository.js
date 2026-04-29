import { getDatabase } from './db';
import { generateId } from '../utils/idGenerator';
import { nowISO } from '../utils/dateUtils';

/**
 * Insert a new alert into SQLite.
 */
export async function insertAlert(alert) {
  const db = await getDatabase();
  const id = alert.id || generateId();
  const createdAt = alert.created_at || nowISO();

  await db.runAsync(
    `INSERT INTO alerts (id, visit_id, patient_id, patient_name, village, risk_flags, risk_level, status, doctor_notified, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, alert.visit_id, alert.patient_id, alert.patient_name,
      alert.village, JSON.stringify(alert.risk_flags || []),
      alert.risk_level, 'sent', 0, createdAt,
    ]
  );
  return { ...alert, id, created_at: createdAt, status: 'sent' };
}

/**
 * Get all alerts ordered by creation date.
 */
export async function getAllAlerts() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM alerts ORDER BY created_at DESC');
}

/**
 * Count alerts by risk level.
 */
export async function countAlertsByRisk(riskLevel) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM alerts WHERE risk_level = ?', [riskLevel]
  );
  return row?.count || 0;
}

/**
 * Count total alerts.
 */
export async function countAlerts() {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) as count FROM alerts');
  return row?.count || 0;
}
