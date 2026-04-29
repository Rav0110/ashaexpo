/**
 * Deterministic AI clinical escalation summary generator.
 * Maps risk flags → medical narrative + urgency + recommendation.
 * No external API dependency — pure template mapping.
 */

const FLAG_MAP = {
  'SEVERE_HYPERTENSION':   { sentence: 'severe hypertension (BP ≥160/110) indicating potential pre-eclampsia',                  severity: 3 },
  'HIGH_BP_PREGNANCY':     { sentence: 'elevated blood pressure in pregnancy (BP ≥140/90) requiring close monitoring',          severity: 2 },
  'BLEEDING_PREGNANCY':    { sentence: 'active vaginal bleeding during pregnancy — potential placenta previa or abruption',     severity: 3 },
  'SEIZURE':               { sentence: 'reported seizure episode — eclampsia must be ruled out immediately',                     severity: 3 },
  'TB_FOLLOWUP_MISSED':    { sentence: 'missed TB DOTS follow-up — risk of drug resistance and community transmission',         severity: 2 },
  'TB COUGH SCREENING DUE':{ sentence: 'TB cough screening overdue — sputum examination recommended at next contact',           severity: 2 },
  'DANGER_FEVER':          { sentence: 'dangerously high fever (≥39.5°C) — investigate for sepsis or severe infection',          severity: 3 },
  'BREATHLESSNESS_CHILD':  { sentence: 'acute respiratory distress in pediatric patient — rule out pneumonia',                   severity: 3 },
  'SEVERE_MALNUTRITION':   { sentence: 'severe acute malnutrition (MUAC <11.5cm) — therapeutic feeding required',               severity: 2 },
  'VACCINATION_OVERDUE':   { sentence: 'overdue vaccination schedule — update immunization at next contact',                     severity: 1 },
  'TEEN_PREGNANCY':        { sentence: 'adolescent pregnancy (age ≤19) — high-risk ANC protocol required',                      severity: 2 },
  'LOW_HEMOGLOBIN':        { sentence: 'low hemoglobin level suggesting moderate-to-severe anemia',                              severity: 2 },
  'POOR_WEIGHT_GAIN':      { sentence: 'inadequate gestational weight gain — nutritional counseling and follow-up needed',       severity: 1 },
  'SWELLING':              { sentence: 'reported edema in extremities — monitor for pre-eclampsia signs',                        severity: 2 },
};

const RECOMMENDATIONS = {
  3: [
    'Immediate PHC/CHC referral recommended.',
    'Arrange emergency transport if patient is remote.',
    'Administer first-aid stabilization measures if trained.',
    'Notify the Medical Officer on call.',
  ],
  2: [
    'Schedule priority follow-up within 48 hours.',
    'Ensure ASHA worker conducts a home visit.',
    'Verify medication adherence and compliance.',
    'Re-assess at next scheduled contact.',
  ],
  1: [
    'Continue routine monitoring at next scheduled visit.',
    'Counsel patient/family on warning signs.',
    'Update records and mark for next review cycle.',
  ],
};

/**
 * Normalize a risk flag string to match the FLAG_MAP keys.
 */
function normalizeFlag(flag) {
  if (typeof flag !== 'string') return String(flag);
  const upper = flag.toUpperCase().trim();
  // Direct match first
  if (FLAG_MAP[upper]) return upper;
  // Try with underscores replaced by spaces and vice versa
  const withSpaces = upper.replace(/_/g, ' ');
  if (FLAG_MAP[withSpaces]) return withSpaces;
  const withUnderscores = upper.replace(/\s+/g, '_');
  if (FLAG_MAP[withUnderscores]) return withUnderscores;
  return upper;
}

/**
 * Generate a clinical escalation summary from alert data.
 *
 * @param {{ patient_name: string, village: string, risk_level: string, risk_flags: string[]|string }} alert
 * @returns {{ urgency: string, summary: string, recommendation: string, escalationLevel: string }}
 */
export function generateEscalationSummary(alert) {
  const { patient_name = 'Unknown', village = 'N/A', risk_level = 'low' } = alert;

  // Parse flags
  let flags = alert.risk_flags || [];
  if (typeof flags === 'string') {
    try { flags = JSON.parse(flags); } catch { flags = [flags]; }
  }
  if (!Array.isArray(flags)) flags = [];

  const isHigh = risk_level === 'high';

  // Map flags to clinical sentences + track max severity
  let maxSeverity = 0;
  const sentences = [];
  const unmatchedFlags = [];

  flags.forEach(raw => {
    const key = normalizeFlag(raw);
    const entry = FLAG_MAP[key];
    if (entry) {
      sentences.push(entry.sentence);
      maxSeverity = Math.max(maxSeverity, entry.severity);
    } else {
      unmatchedFlags.push(typeof raw === 'string' ? raw.replace(/_/g, ' ').toLowerCase() : raw);
    }
  });

  // Add unmatched flags as generic entries
  unmatchedFlags.forEach(f => {
    sentences.push(`flagged for ${f} — clinical evaluation recommended`);
    maxSeverity = Math.max(maxSeverity, 1);
  });

  // If high risk but no flags parsed, still generate high-severity output
  if (isHigh && maxSeverity < 2) maxSeverity = 2;

  // Determine urgency
  let urgency, escalationLevel;
  if (maxSeverity >= 3) {
    urgency = 'CRITICAL';
    escalationLevel = 'IMMEDIATE_REFERRAL';
  } else if (maxSeverity >= 2 || isHigh) {
    urgency = 'URGENT';
    escalationLevel = 'PRIORITY_FOLLOWUP';
  } else if (maxSeverity >= 1) {
    urgency = 'ELEVATED';
    escalationLevel = 'SCHEDULED_REVIEW';
  } else {
    urgency = 'MONITOR';
    escalationLevel = 'ROUTINE_MONITOR';
  }

  // Build summary narrative
  let summary;
  if (sentences.length === 0) {
    summary = isHigh
      ? `Patient ${patient_name} (${village}) has been flagged as high risk. Clinical evaluation is needed to determine the appropriate course of action.`
      : `Patient ${patient_name} (${village}) is under routine observation. No active risk flags detected at this time.`;
  } else if (sentences.length === 1) {
    summary = `Patient ${patient_name} (${village}) presents with ${sentences[0]}.`;
  } else {
    const last = sentences.pop();
    summary = `Patient ${patient_name} (${village}) presents with ${sentences.join(', ')}, and ${last}.`;
  }

  // Build recommendation
  const recTier = RECOMMENDATIONS[Math.min(maxSeverity, 3)] || RECOMMENDATIONS[1];
  const recommendation = recTier.join(' ');

  return { urgency, summary, recommendation, escalationLevel };
}
