export function normalizePhone(phone: string): string {
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Strip leading + for uniform processing, we'll add it back
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }
  // Handle double country code: 4407xxx → 447xxx
  if (cleaned.startsWith('440') && cleaned.length === 13) {
    cleaned = '44' + cleaned.slice(3);
  }
  // UK mobile starting with 07 → 447
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    cleaned = '44' + cleaned.slice(1);
  }
  // Bare number without country code (7983...)
  if (cleaned.startsWith('7') && cleaned.length === 10) {
    cleaned = '44' + cleaned;
  }
  return '+' + cleaned;
}
