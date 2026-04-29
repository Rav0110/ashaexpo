/**
 * Format risk flags array for display.
 */
export function formatRiskFlags(flagsJson) {
  try {
    const flags = typeof flagsJson === 'string' ? JSON.parse(flagsJson) : flagsJson;
    if (!Array.isArray(flags) || flags.length === 0) return '';
    return flags.map(f => f.replace(/_/g, ' ')).join(', ');
  } catch {
    return '';
  }
}

/**
 * Format a phone number for display.
 */
export function formatPhone(phone) {
  if (!phone) return 'N/A';
  return phone;
}

/**
 * Capitalize first letter.
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format BP values.
 */
export function formatBP(systolic, diastolic) {
  if (!systolic && !diastolic) return 'N/A';
  return `${systolic || '-'}/${diastolic || '-'} mmHg`;
}

/**
 * Format temperature.
 */
export function formatTemp(tempC) {
  if (!tempC) return 'N/A';
  return `${tempC}°C`;
}
