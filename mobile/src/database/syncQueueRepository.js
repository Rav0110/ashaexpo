import { getDatabase } from './db';
import { generateId } from '../utils/idGenerator';
import { nowISO } from '../utils/dateUtils';
import { QUEUE_STATUS } from '../constants/appConfig';

/**
 * Add an item to the sync queue.
 * @param {string} recordType - 'alert' | 'visit' | 'patient'
 * @param {string} recordId - ID of the source record
 * @param {number} priority - 1=alert, 2=visit, 3=patient
 * @param {object} payload - Full data to sync to Firestore
 */
export async function enqueue(recordType, recordId, priority, payload) {
  const db = await getDatabase();
  const id = generateId();
  const createdAt = nowISO();

  await db.runAsync(
    `INSERT INTO sync_queue (id, record_type, record_id, priority, payload, status, retry_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, recordType, recordId, priority, JSON.stringify(payload), QUEUE_STATUS.PENDING, 0, createdAt]
  );
  return id;
}

/**
 * Get pending items from the sync queue ordered by priority then creation time.
 * Matches the query from implementation plan Section 8.
 */
export async function getPendingItems() {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT * FROM sync_queue
     WHERE status = 'pending' OR (status = 'failed' AND retry_count < 3)
     ORDER BY priority ASC, created_at ASC`
  );
}

/**
 * Mark a queue item as done.
 */
export async function markDone(queueId) {
  const db = await getDatabase();
  await db.runAsync("UPDATE sync_queue SET status = 'done' WHERE id = ?", [queueId]);
}

/**
 * Mark a queue item as failed, increment retry count.
 */
export async function markFailed(queueId) {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE sync_queue SET status = 'failed', retry_count = retry_count + 1, failed_at = ? WHERE id = ?",
    [nowISO(), queueId]
  );
}

/**
 * Count pending items.
 */
export async function countPending() {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending' OR (status = 'failed' AND retry_count < 3)"
  );
  return row?.count || 0;
}

/**
 * Count pending high-risk alerts.
 */
export async function countPendingAlerts() {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    "SELECT COUNT(*) as count FROM sync_queue WHERE record_type = 'alert' AND (status = 'pending' OR (status = 'failed' AND retry_count < 3))"
  );
  return row?.count || 0;
}

/**
 * Count permanently failed items (retry_count >= 3).
 */
export async function countFailed() {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'failed' AND retry_count >= 3"
  );
  return row?.count || 0;
}
