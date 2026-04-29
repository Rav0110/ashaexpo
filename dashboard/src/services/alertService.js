import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Subscribe to real-time alerts from Firestore.
 * Returns unsubscribe function.
 */
export function subscribeToAlerts(callback) {
  const q = query(collection(db, 'alerts'), orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const alerts = [];
    snapshot.forEach(d => alerts.push({ id: d.id, ...d.data() }));
    callback(alerts, snapshot.docChanges());
  });
}

/**
 * Acknowledge an alert.
 */
export async function acknowledgeAlert(alertId) {
  await updateDoc(doc(db, 'alerts', alertId), {
    status: 'acknowledged',
    acknowledged_at: new Date().toISOString(),
  });
}
