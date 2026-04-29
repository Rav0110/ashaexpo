import { countPatients } from '../database/patientRepository';
import { countVisits, countVaccinations } from '../database/visitRepository';
import { countAlertsByRisk } from '../database/alertRepository';
import { VISIT_TYPES } from '../constants/visitTypes';

/**
 * Generate a local village report from SQLite data.
 * Matches the report fields from implementation plan Section 10.7.
 */
export async function generateReport() {
  const totalPatients = await countPatients();
  const totalVisits = await countVisits();
  const ancVisits = await countVisits(VISIT_TYPES.ANC);
  const childVisits = await countVisits(VISIT_TYPES.CHILD);
  const tbFollowups = await countVisits(VISIT_TYPES.TB_FOLLOWUP);
  const vaccinations = await countVaccinations();
  const highRiskAlerts = await countAlertsByRisk('high');
  const mediumRiskAlerts = await countAlertsByRisk('medium');

  return {
    totalPatients,
    totalVisits,
    ancVisits,
    childVisits,
    tbFollowups,
    vaccinationsDue: vaccinations.due,
    vaccinationsGiven: vaccinations.given,
    highRiskAlerts,
    mediumRiskAlerts,
  };
}
