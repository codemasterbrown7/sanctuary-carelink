import { NextRequest } from 'next/server';
import { getConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';
import { buildCareEmail } from '@/lib/email';
import { translateEmailContent, getEnglishEmailStrings } from '@/lib/claude';
import { demoConfig } from '@/config/demo';

// Preview the HTML email that would be sent to the patient
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const consultation = await getConsultation(id);

  if (!consultation) {
    return new Response('Consultation not found', { status: 404 });
  }

  const matchResult = matchContent({
    icd10Codes: consultation.icd10Codes,
    medications: consultation.medications,
  });

  const titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Miss', 'Prof'];
  const firstName = consultation.patientName.split(' ').filter(p => !titles.includes(p))[0] || consultation.patientName.split(' ')[0];

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
  } catch {
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

  const html = buildCareEmail(consultation, matchResult.videos, demoConfig.callbackNumber, emailStrings);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
