import { RISK_THRESHOLDS, RISK_LEVEL, RISK_FLAGS } from '../constants/riskThresholds';
import { VISIT_TYPES } from '../constants/visitTypes';

/**
 * Offline risk engine — runs synchronously on-device.
 * Evaluates risk based on visit data and patient profile.
 *
 * Thresholds and flags from implementation plan Section 5.
 *
 * @param {object} visit - Visit data (fields from the visit form)
 * @param {object} patient - Patient data (age, condition_type, etc.)
 * @returns {{ riskLevel: string, riskFlags: string[] }}
 */
export function evaluateRisk(visit, patient) {
  const flags = [];
  const isPregnancy = patient.condition_type === 'pregnancy';
  const isChild = patient.condition_type === 'child' ||
                  visit.visit_type === VISIT_TYPES.CHILD;
  const isTB = patient.condition_type === 'tb' ||
               visit.visit_type === VISIT_TYPES.TB_FOLLOWUP;

  const bpSys = visit.bp_systolic ? Number(visit.bp_systolic) : null;
  const bpDia = visit.bp_diastolic ? Number(visit.bp_diastolic) : null;
  const temp = visit.temperature_c ? Number(visit.temperature_c) : null;
  const muac = visit.muac_cm ? Number(visit.muac_cm) : null;
  const age = patient.age ? Number(patient.age) : null;
  const coughWeeks = visit.tb_cough_weeks ? Number(visit.tb_cough_weeks) : null;
  const postnatalDay = visit.postnatal_day ? Number(visit.postnatal_day) : null;

  // ── Pregnancy-related checks ──

  // Severe hypertension in pregnancy: BP >= 160/110 → HIGH
  if (isPregnancy && bpSys !== null && bpDia !== null) {
    if (bpSys >= RISK_THRESHOLDS.SEVERE_BP_SYSTOLIC && bpDia >= RISK_THRESHOLDS.SEVERE_BP_DIASTOLIC) {
      flags.push(RISK_FLAGS.SEVERE_HYPERTENSION);
    } else if (bpSys >= RISK_THRESHOLDS.HIGH_BP_SYSTOLIC || bpDia >= RISK_THRESHOLDS.HIGH_BP_DIASTOLIC) {
      // High BP in pregnancy: BP >= 140/90 → MEDIUM
      flags.push(RISK_FLAGS.HIGH_BP_PREGNANCY);
    }
  }

  // Bleeding in pregnancy → HIGH
  if (isPregnancy && visit.bleeding) {
    flags.push(RISK_FLAGS.BLEEDING_PREGNANCY);
  }

  // Seizure → HIGH
  if (visit.seizure) {
    flags.push(RISK_FLAGS.SEIZURE);
  }

  // Teen pregnancy: age <= 19 → MEDIUM
  if (isPregnancy && age !== null && age <= RISK_THRESHOLDS.TEEN_AGE) {
    flags.push(RISK_FLAGS.TEEN_PREGNANCY);
  }

  // ── Postnatal checks ──

  // Postpartum follow-up missed: postnatal day > 2 and < 7 → MEDIUM
  if (visit.visit_type === VISIT_TYPES.POSTNATAL && postnatalDay !== null) {
    if (postnatalDay > 2 && postnatalDay < 7) {
      flags.push(RISK_FLAGS.POSTPARTUM_FOLLOW_UP_MISSED);
    }
  }

  // ── TB checks ──

  // TB cough screening due: cough >= 2 weeks → MEDIUM
  if (coughWeeks !== null && coughWeeks >= RISK_THRESHOLDS.TB_COUGH_WEEKS) {
    flags.push(RISK_FLAGS.TB_COUGH_SCREENING_DUE);
  }

  // TB follow-up missed → HIGH
  if (visit.tb_followup_missed) {
    flags.push(RISK_FLAGS.TB_FOLLOWUP_MISSED);
  }

  // ── Child / temperature checks ──

  // Danger fever: temp >= 39.5 → HIGH
  if (temp !== null && temp >= RISK_THRESHOLDS.DANGER_FEVER_TEMP) {
    flags.push(RISK_FLAGS.DANGER_FEVER);
  } else if (temp !== null && temp >= RISK_THRESHOLDS.FEVER_TEMP) {
    // Fever: temp >= 38.0 → MEDIUM
    flags.push(RISK_FLAGS.FEVER);
  }

  // Breathlessness in child → HIGH
  if (isChild && visit.breathlessness) {
    flags.push(RISK_FLAGS.BREATHLESSNESS_CHILD);
  }

  // Severe malnutrition: MUAC < 11.5 → HIGH
  if (muac !== null && muac < RISK_THRESHOLDS.MALNUTRITION_MUAC) {
    flags.push(RISK_FLAGS.SEVERE_MALNUTRITION);
  }

  // ── Vaccination checks ──

  // Vaccination overdue: due = true, given = false → MEDIUM
  if (visit.vaccination_due && !visit.vaccination_given) {
    flags.push(RISK_FLAGS.VACCINATION_OVERDUE);
  }

  // ── Determine overall risk level ──
  const highFlags = [
    RISK_FLAGS.SEVERE_HYPERTENSION,
    RISK_FLAGS.BLEEDING_PREGNANCY,
    RISK_FLAGS.SEIZURE,
    RISK_FLAGS.TB_FOLLOWUP_MISSED,
    RISK_FLAGS.DANGER_FEVER,
    RISK_FLAGS.BREATHLESSNESS_CHILD,
    RISK_FLAGS.SEVERE_MALNUTRITION,
  ];

  let riskLevel = RISK_LEVEL.NONE;
  if (flags.some(f => highFlags.includes(f))) {
    riskLevel = RISK_LEVEL.HIGH;
  } else if (flags.length > 0) {
    riskLevel = RISK_LEVEL.MEDIUM;
  }

  return { riskLevel, riskFlags: flags };
}
