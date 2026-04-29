/**
 * Get current timestamp as ISO string.
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Format ISO string to readable date.
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format ISO string to readable time.
 */
export function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format ISO string to date + time.
 */
export function formatDateTime(isoString) {
  if (!isoString) return '';
  return `${formatDate(isoString)}, ${formatTime(isoString)}`;
}

/**
 * Get today's date string (YYYY-MM-DD).
 */
export function todayString() {
  return new Date().toISOString().split('T')[0];
}
