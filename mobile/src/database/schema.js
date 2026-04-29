/**
 * SQLite schema — exactly matching implementation plan Section 6.
 * Called once on first app launch via db.js.
 */
export async function createTables(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT,
      age INTEGER,
      sex TEXT,
      village TEXT,
      phone TEXT,
      asha_id TEXT,
      condition_type TEXT,
      sync_status TEXT DEFAULT 'offline',
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      visit_type TEXT,
      anc_number INTEGER,
      trimester INTEGER,
      bp_systolic INTEGER,
      bp_diastolic INTEGER,
      weight_kg REAL,
      muac_cm REAL,
      temperature_c REAL,
      gestational_weeks INTEGER,
      bleeding INTEGER DEFAULT 0,
      seizure INTEGER DEFAULT 0,
      breathlessness INTEGER DEFAULT 0,
      tb_cough_weeks INTEGER,
      tb_followup_missed INTEGER DEFAULT 0,
      vaccination_due INTEGER DEFAULT 0,
      vaccination_given INTEGER DEFAULT 0,
      postnatal_day INTEGER,
      raw_note TEXT,
      parsed_fields TEXT,
      audio_path TEXT,
      risk_level TEXT DEFAULT 'none',
      risk_flags TEXT,
      sync_status TEXT DEFAULT 'offline',
      created_at TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      visit_id TEXT,
      patient_id TEXT,
      patient_name TEXT,
      village TEXT,
      risk_flags TEXT,
      risk_level TEXT,
      status TEXT DEFAULT 'sent',
      doctor_notified INTEGER DEFAULT 0,
      created_at TEXT,
      FOREIGN KEY (visit_id) REFERENCES visits(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      record_type TEXT,
      record_id TEXT,
      priority INTEGER,
      payload TEXT,
      status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      failed_at TEXT,
      created_at TEXT
    );
  `);
}
