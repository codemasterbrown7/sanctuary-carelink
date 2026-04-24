function normalizePhone(phone: string): string {
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

export async function sendSMS(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio credentials not configured');
  }

  const normalizedTo = normalizePhone(to);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: normalizedTo, From: from, Body: body }).toString(),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Twilio API error: ${response.status} ${err}`);
  }
}
