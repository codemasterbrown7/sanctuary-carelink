import { NextRequest } from 'next/server';
import { getConsultation, updateConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.consultationId) {
    return Response.json({ error: 'Missing consultationId' }, { status: 400 });
  }
  const consultation = await getConsultation(body.consultationId);

  if (!consultation) {
    return Response.json({ error: 'Consultation not found' }, { status: 404 });
  }

  const matchResult = matchContent({
    icd10Codes: consultation.icd10Codes,
    medications: consultation.medications,
  });

  const videoTitles = matchResult.videos.slice(0, 5).map(v => v.title);

  let summary: string;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { generateCareSummary } = await import('@/lib/claude');
      summary = await generateCareSummary({
        patientName: consultation.patientName,
        diagnosis: consultation.diagnosis,
        icd10Codes: consultation.icd10Codes,
        medications: consultation.medications,
        doctorInstructions: consultation.plan,
        contentTitles: videoTitles,
        courseTitles: [],
        language: consultation.patientLanguage,
      });
    } catch (err) {
      console.error('Claude API error, using fallback:', err);
      summary = generateFallbackSummary(consultation, videoTitles);
    }
  } else {
    summary = generateFallbackSummary(consultation, videoTitles);
  }

  await updateConsultation(consultation.id, {
    careSummary: summary,
    status: 'summary_generated',
  });

  return Response.json({ summary });
}

function generateFallbackSummary(
  consultation: {
    patientName: string;
    diagnosis: string;
    medications: string[];
    plan: string;
    medicationInstructions: string;
    followUpDate: string | null;
    followUpInstructions: string;
    safetyNetting: string;
  },
  videoTitles: string[],
): string {
  const titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Miss', 'Prof'];
  const firstName = consultation.patientName.split(' ').filter(p => !titles.includes(p))[0] || consultation.patientName.split(' ')[0];
  const lines = [
    `Dear ${firstName},`,
    '',
    `Thank you for visiting today. Your doctor has diagnosed you with ${consultation.diagnosis}. We want to make sure you have all the information and support you need to manage your health going forward.`,
    '',
  ];

  if (consultation.medications.length > 0) {
    lines.push(`You have been prescribed ${consultation.medications.join(' and ')}. ${consultation.medicationInstructions || 'Please take your medication as directed by your doctor.'}`);
    lines.push('');
  }

  if (consultation.plan) {
    lines.push(`Your care plan: ${consultation.plan}`);
    lines.push('');
  }

  if (videoTitles.length > 0) {
    lines.push(`We've selected ${videoTitles.length} educational videos matched to your diagnosis to help you understand your condition. These cover topics from understanding your condition to medication guidance and lifestyle changes.`);
    lines.push('');
  }

  if (consultation.followUpDate) {
    lines.push(`Your follow-up appointment is scheduled for ${new Date(consultation.followUpDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. ${consultation.followUpInstructions || ''}`);
    lines.push('');
  }

  if (consultation.safetyNetting) {
    lines.push(`Important: ${consultation.safetyNetting}`);
    lines.push('');
  }

  lines.push('If you have any questions about your diagnosis, medications, or care plan, you can call our AI health companion at any time. It has full context from your consultation and can help answer your questions.');
  lines.push('');
  lines.push('Take care, and remember — you are not alone on this journey.');

  return lines.join('\n');
}
