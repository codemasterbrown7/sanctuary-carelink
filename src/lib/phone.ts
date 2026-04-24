export function normalizePhone(phone: string): string {
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // UK mobile starting with 07 → +44
  if (cleaned.startsWith('07') && cleaned.length === 11) {
    cleaned = '+44' + cleaned.slice(1);
  }
  // 44 without + prefix
  if (cleaned.startsWith('44') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  // Ensure + prefix for international
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}
