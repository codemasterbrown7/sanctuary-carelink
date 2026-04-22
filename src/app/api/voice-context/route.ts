import { NextRequest } from 'next/server';
import { getConsultationByPhone, getConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';

// ElevenLabs Conversational AI calls this endpoint to get patient context
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');
  const consultationId = request.nextUrl.searchParams.get('consultationId');

  let consultation;
  if (consultationId) {
    consultation = await getConsultation(consultationId);
  } else if (phone) {
    consultation = await getConsultationByPhone(phone);
  }

  if (!consultation) {
    return Response.json({
      systemPrompt: 'You are a friendly health companion for Sanctuary Health. The caller does not have a recent consultation on file. Politely let them know and suggest they contact their healthcare provider directly.',
    });
  }

  // Get matched content for context
  const matchResult = matchContent({
    icd10Codes: consultation.icd10Codes,
    medications: consultation.medications,
  });

  const contentSummary = matchResult.videos
    .slice(0, 8)
    .map(v => `- ${v.title}: ${v.description}`)
    .join('\n');

  const transcriptSection = consultation.transcript
    ? `\nCONSULTATION TRANSCRIPT:\n${consultation.transcript}\n`
    : '';

  const systemPrompt = `You are a caring, knowledgeable AI health companion for Sanctuary Health Careflow. You are speaking with ${consultation.patientName} who had a consultation recently.

PATIENT CONTEXT:
- Name: ${consultation.patientName}
- Diagnosis: ${consultation.diagnosis} (ICD-10: ${consultation.icd10Codes.join(', ')})
- Medications prescribed: ${consultation.medications.join(', ') || 'None'}
- Medication instructions: ${consultation.medicationInstructions || 'No specific instructions recorded'}
- Care plan: ${consultation.plan || 'No specific plan recorded'}
- Follow-up date: ${consultation.followUpDate ? new Date(consultation.followUpDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Not scheduled'}
- Follow-up instructions: ${consultation.followUpInstructions || 'None'}
- Safety netting: ${consultation.safetyNetting || 'None'}
- Language preference: ${consultation.patientLanguage}

${consultation.careSummary ? `CARE SUMMARY (already sent to patient):\n${consultation.careSummary}\n` : ''}
${transcriptSection}
AVAILABLE EDUCATIONAL CONTENT:
${contentSummary}

GUIDELINES:
- Be warm, empathetic, and patient. Use plain language (8th grade reading level).
- Answer questions about their diagnosis, medications, side effects, and care plan.
- When quoting what the doctor said, refer to the transcript and care plan above.
- If asked about medication side effects, reference the educational content matched to their diagnosis.
- If asked something outside your knowledge or that requires clinical judgement, say: "That's a great question, but I'd recommend discussing that directly with your doctor to get personalised advice."
- Never diagnose, change medication, or contradict the doctor's instructions.
- Remind them of their follow-up appointment if relevant.
- Keep responses concise — this is a phone call, not an essay.`;

  return Response.json({
    systemPrompt,
    patientName: consultation.patientName,
    consultationId: consultation.id,
  });
}

// ElevenLabs may also call via POST
export async function POST(request: NextRequest) {
  return GET(request);
}
