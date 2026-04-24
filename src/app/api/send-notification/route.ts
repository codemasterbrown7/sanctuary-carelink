import { NextRequest } from 'next/server';
import { getConsultation, updateConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';
import { demoConfig } from '@/config/demo';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.consultationId) {
    return Response.json({ error: 'Missing consultationId' }, { status: 400 });
  }
  const consultation = await getConsultation(body.consultationId);

  if (!consultation) {
    return Response.json({ error: 'Consultation not found' }, { status: 404 });
  }

  if (!consultation.careSummary) {
    return Response.json({ error: 'Care summary not yet generated' }, { status: 400 });
  }

  const callbackNumber = demoConfig.callbackNumber;
  const results: { sms: string; email: string } = { sms: 'skipped', email: 'skipped' };

  // Get matched videos for email
  const matchResult = matchContent({
    icd10Codes: consultation.icd10Codes,
    medications: consultation.medications,
  });

  const titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Miss', 'Prof'];
  const firstName = consultation.patientName.split(' ').filter(p => !titles.includes(p))[0] || consultation.patientName.split(' ')[0];

  // ── Translate all email content via Claude ────────────
  const { translateEmailContent, getEnglishEmailStrings } = await import('@/lib/claude');
  let emailStrings;
  try {
    emailStrings = await translateEmailContent({
      firstName,
      videoCount: matchResult.videos.length,
      diagnosis: consultation.diagnosis,
      medicationInstructions: consultation.medicationInstructions,
      followUpInstructions: consultation.followUpInstructions,
      safetyNetting: consultation.safetyNetting,
    }, consultation.patientLanguage);
  } catch (err) {
    console.error('Translation error, using English:', err);
    const en = getEnglishEmailStrings();
    emailStrings = {
      ...en,
      greeting: `Hi ${firstName},`,
      resourcesSubtext: `${matchResult.videos.length} videos matched to your diagnosis from trusted health channels`,
      diagnosis: consultation.diagnosis,
      medicationInstructions: consultation.medicationInstructions,
      followUpInstructions: consultation.followUpInstructions,
      safetyNetting: consultation.safetyNetting,
    };
  }

  // ── SMS ────────────────────────────────────────────────
  const smsBody = [
    `${emailStrings.greeting}`,
    `${emailStrings.intro.split('.')[0]}.`,
    `${emailStrings.ctaSubtext}`,
    `${emailStrings.ctaButton} ${callbackNumber}`,
    `— Sanctuary Careflow`,
  ].join('\n');

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const { sendSMS } = await import('@/lib/twilio');
      await sendSMS(consultation.patientPhone, smsBody);
      results.sms = 'sent';
      console.log(`SMS sent to ${consultation.patientPhone}`);
    } catch (err) {
      console.error('Twilio error:', err);
      results.sms = 'error';
    }
  } else {
    console.log('[Demo] SMS would be sent to:', consultation.patientPhone);
    console.log('[Demo] SMS body:', smsBody);
    results.sms = 'demo';
  }

  // ── Email ──────────────────────────────────────────────
  if (consultation.patientEmail) {
    if (process.env.RESEND_API_KEY) {
      try {
        const { buildCareEmail, sendEmail } = await import('@/lib/email');
        const html = buildCareEmail(consultation, matchResult.videos, callbackNumber, emailStrings);
        await sendEmail(
          consultation.patientEmail,
          `Your care summary — ${consultation.diagnosis} | Sanctuary Careflow`,
          html,
        );
        results.email = 'sent';
        console.log(`Email sent to ${consultation.patientEmail}`);
      } catch (err) {
        console.error('Email error:', err);
        results.email = 'error';
      }
    } else {
      console.log('[Demo] Email would be sent to:', consultation.patientEmail);
      results.email = 'demo';
    }
  }

  await updateConsultation(consultation.id, { status: 'notification_sent' });

  return Response.json({
    success: true,
    message: 'Notifications sent',
    results,
    smsPreview: smsBody,
  });
}
