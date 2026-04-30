// App-wide configuration constants
export const APP_NAME = 'Village Health Assistant';
export const APP_VERSION = '1.0.0';
export const DB_NAME = 'village_health.db';
export const VOICE_AUDIO_DIR = 'voice_recordings/';

// ASHA worker defaults — can be changed per deployment
export const DEFAULT_ASHA_ID = 'ASHA-001';
export const DEFAULT_VILLAGE = 'Rampur';

// Sync configuration
export const MAX_RETRY_COUNT = 3;
export const SYNC_BATCH_SIZE = 10;

// Firestore collections
export const FIRESTORE_COLLECTIONS = {
  PATIENTS: 'patients',
  VISITS: 'visits',
  ALERTS: 'alerts',
};

// Sync queue priorities
export const SYNC_PRIORITY = {
  ALERT: 1,
  VISIT: 2,
  PATIENT: 3,
  REPORT: 4,
};

// Sync status values
export const SYNC_STATUS = {
  OFFLINE: 'offline',
  RISK_CHECKED: 'risk_checked',
  ALERT_QUEUED: 'alert_queued',
  SYNCED: 'synced',
  FAILED: 'failed',
};

// Queue item status
export const QUEUE_STATUS = {
  PENDING: 'pending',
  DONE: 'done',
  FAILED: 'failed',
};

// Alert status
export const ALERT_STATUS = {
  SENT: 'sent',
  ACKNOWLEDGED: 'acknowledged',
};
