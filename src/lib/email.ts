import type { Consultation, HealthVideo } from './mock-api/types';
import type { EmailTranslations } from './claude';
import { getYouTubeThumbnail } from './videos';

const TOPIC_KEY_MAP: Record<string, keyof EmailTranslations> = {
  overview: 'topicOverview',
  medication: 'topicMedication',
  sideEffects: 'topicSideEffects',
  lifestyle: 'topicLifestyle',
  symptoms: 'topicSymptoms',
  risks: 'topicRisks',
  support: 'topicSupport',
  causes: 'topicCauses',
  diagnosis: 'topicDiagnosis',
};

export function buildCareEmail(
  consultation: Consultation,
  videos: HealthVideo[],
  callbackNumber: string,
  t: EmailTranslations,
): string {
  const videosByTopic: Record<string, HealthVideo[]> = {};
  for (const v of videos) {
    if (!videosByTopic[v.topic]) videosByTopic[v.topic] = [];
    videosByTopic[v.topic].push(v);
  }

  const topicOrder = ['overview', 'medication', 'sideEffects', 'lifestyle', 'symptoms', 'risks', 'support', 'causes', 'diagnosis'];
  const orderedTopics = topicOrder.filter(topic => videosByTopic[topic]);

  let videoSections = '';
  for (const topic of orderedTopics) {
    const topicVideos = videosByTopic[topic];
    const topicKey = TOPIC_KEY_MAP[topic];
    const topicLabel = (topicKey && t[topicKey]) || topic;

    videoSections += `
      <tr><td style="padding: 24px 32px 8px;">
        <h3 style="margin:0; font-size:16px; color:#005eb8; border-bottom:2px solid #005eb8; padding-bottom:6px;">
          ${topicLabel}
        </h3>
      </td></tr>`;

    for (const v of topicVideos) {
      videoSections += `
      <tr><td style="padding: 8px 32px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="width:160px; vertical-align:top;">
              <a href="${v.url}" style="display:block;">
                <img src="${getYouTubeThumbnail(v.youtubeId)}" alt="${v.title}" width="160" height="90" style="display:block; object-fit:cover;" />
              </a>
            </td>
            <td style="padding:12px 16px; vertical-align:top;">
              <a href="${v.url}" style="color:#212b32; font-weight:600; font-size:14px; text-decoration:none;">
                ${v.title}
              </a>
              <p style="margin:4px 0 0; font-size:12px; color:#4c6272; line-height:1.4;">
                ${v.description}
              </p>
              <p style="margin:6px 0 0; font-size:11px; color:#768692;">
                ${v.channel} &middot; ${v.durationMinutes} min
              </p>
            </td>
          </tr>
        </table>
      </td></tr>`;
    }
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f0f4f5; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f4f5;">
<tr><td align="center" style="padding:24px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="600" style="background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">

  <!-- Header -->
  <tr><td style="background:#003087; padding:24px 32px; border-radius:12px 12px 0 0;">
    <h1 style="margin:0; color:#fff; font-size:20px;">Sanctuary CareLink</h1>
    <p style="margin:4px 0 0; color:#7eb3e0; font-size:13px;">${t.subtitle}</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:24px 32px;">
    <h2 style="margin:0; font-size:18px; color:#212b32;">${t.greeting}</h2>
    <p style="margin:8px 0 0; font-size:14px; color:#4c6272; line-height:1.6;">
      ${t.intro}
    </p>
  </td></tr>

  <!-- Diagnosis Card -->
  <tr><td style="padding:0 32px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f7ff; border:1px solid #b8d4f0; border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0; font-size:12px; color:#005eb8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">${t.diagnosisLabel}</p>
        <p style="margin:4px 0 0; font-size:16px; color:#212b32; font-weight:600;">${t.diagnosis}</p>
        <p style="margin:4px 0 0; font-size:11px; color:#768692; font-family:monospace;">ICD-10: ${consultation.icd10Codes.join(', ')}</p>
      </td></tr>
    </table>
  </td></tr>

  ${consultation.careSummary ? `
  <!-- Care Summary -->
  <tr><td style="padding:0 32px 16px;">
    <h3 style="margin:0 0 8px; font-size:16px; color:#005eb8;">${t.careSummaryHeading}</h3>
    <div style="font-size:14px; color:#212b32; line-height:1.6;">
      ${consultation.careSummary.split('\n').filter(Boolean).map(l => `<p style="margin:0 0 8px;">${l}</p>`).join('')}
    </div>
  </td></tr>` : ''}

  ${consultation.medications.length > 0 ? `
  <!-- Medications -->
  <tr><td style="padding:0 32px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0; font-size:12px; color:#1e40af; font-weight:600; text-transform:uppercase;">${t.medicationsLabel}</p>
        ${consultation.medications.map(m => `<p style="margin:4px 0 0; font-size:14px; color:#1e3a5f;">&bull; ${m}</p>`).join('')}
        ${t.medicationInstructions ? `<p style="margin:8px 0 0; font-size:13px; color:#3b6fa0;">${t.medicationInstructions}</p>` : ''}
      </td></tr>
    </table>
  </td></tr>` : ''}

  ${consultation.followUpDate ? `
  <!-- Follow-up -->
  <tr><td style="padding:0 32px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0; font-size:12px; color:#92400e; font-weight:600; text-transform:uppercase;">${t.followUpLabel}</p>
        <p style="margin:4px 0 0; font-size:14px; color:#78350f; font-weight:600;">
          ${new Date(consultation.followUpDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        ${t.followUpInstructions ? `<p style="margin:4px 0 0; font-size:13px; color:#92400e;">${t.followUpInstructions}</p>` : ''}
      </td></tr>
    </table>
  </td></tr>` : ''}

  ${t.safetyNetting ? `
  <!-- Safety Netting -->
  <tr><td style="padding:0 32px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px;">
      <tr><td style="padding:16px;">
        <p style="margin:0; font-size:12px; color:#991b1b; font-weight:600; text-transform:uppercase;">${t.safetyLabel}</p>
        <p style="margin:4px 0 0; font-size:14px; color:#7f1d1d;">${t.safetyNetting}</p>
      </td></tr>
    </table>
  </td></tr>` : ''}

  <!-- Educational Videos -->
  <tr><td style="padding:16px 32px 8px;">
    <h2 style="margin:0; font-size:18px; color:#212b32;">${t.resourcesHeading}</h2>
    <p style="margin:4px 0 0; font-size:13px; color:#4c6272;">
      ${t.resourcesSubtext}
    </p>
  </td></tr>

  ${videoSections}

  <!-- Call CTA -->
  <tr><td style="padding:24px 32px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0d9488; border-radius:8px;">
      <tr><td style="padding:20px; text-align:center;">
        <p style="margin:0; color:#fff; font-size:16px; font-weight:600;">${t.ctaHeading}</p>
        <p style="margin:6px 0 12px; color:rgba(255,255,255,0.8); font-size:13px;">
          ${t.ctaSubtext}
        </p>
        <a href="tel:${callbackNumber}" style="display:inline-block; background:#fff; color:#0d9488; font-weight:600; font-size:14px; padding:10px 24px; border-radius:6px; text-decoration:none;">
          ${t.ctaButton} ${callbackNumber}
        </a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px 24px; border-top:1px solid #e2e8f0;">
    <p style="margin:0; font-size:11px; color:#768692; text-align:center;">
      ${t.footer.replace(/\n/g, '<br>')}
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Resend API key not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'CareLink <carelink@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${response.status} ${err}`);
  }
}
