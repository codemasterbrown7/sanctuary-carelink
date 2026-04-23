import { NextRequest } from 'next/server';
import { getConsultationByPhone, getConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';

function buildSystemPrompt(consultation: {
  patientName: string;
  diagnosis: string;
  icd10Codes: string[];
  medications: string[];
  medicationInstructions?: string | null;
  plan?: string | null;
  followUpDate?: string | null;
  followUpInstructions?: string | null;
  safetyNetting?: string | null;
  patientLanguage: string;
  careSummary?: string | null;
  transcript?: string | null;
}, contentSummary: string): string {
  const transcriptSection = consultation.transcript
    ? `\nCONSULTATION TRANSCRIPT:\n${consultation.transcript}\n`
    : '';

  return `You are a caring, knowledgeable AI health companion for Sanctuary Health Careflow. You are speaking with ${consultation.patientName} who had a consultation recently.

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
- Keep responses concise — this is a phone call, not an essay.
- If the patient speaks in ${consultation.patientLanguage}, respond in that language.`;
}

const NO_CONSULTATION_PROMPT = 'You are a friendly health companion for Sanctuary Health Careflow. The caller does not have a recent consultation on file. Politely let them know and suggest they contact their healthcare provider directly. If they believe this is an error, suggest they call from the phone number their clinic has on file.';

// ElevenLabs native Twilio integration webhook
// Called by ElevenLabs when an inbound call arrives — returns dynamic system prompt override
export async function POST(request: NextRequest) {
  let callerPhone = '';
  let consultationId = '';

  // ElevenLabs sends caller info in the POST body
  try {
    const body = await request.json();
    callerPhone = body.caller_id || body.from || '';
    consultationId = body.consultation_id || '';
  } catch {
    // Fall back to query params (for GET requests or testing)
  }

  // Also check query params
  if (!callerPhone) {
    callerPhone = request.nextUrl.searchParams.get('phone') || '';
  }
  if (!consultationId) {
    consultationId = request.nextUrl.searchParams.get('consultationId') || '';
  }

  let consultation;
  if (consultationId) {
    consultation = await getConsultation(consultationId);
  } else if (callerPhone) {
    consultation = await getConsultationByPhone(callerPhone);
  }

  if (!consultation) {
    return Response.json({
      conversation_config_override: {
        agent: {
          prompt: { prompt: NO_CONSULTATION_PROMPT },
          first_message: 'Hello, welcome to Sanctuary Careflow. I wasn\'t able to find a consultation linked to your phone number. Could you please make sure you\'re calling from the number your clinic has on file?',
        },
      },
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

  const systemPrompt = buildSystemPrompt(consultation, contentSummary);

  // Strip title from patient name for greeting
  const titlePrefixes = ['mr', 'mrs', 'ms', 'dr', 'miss', 'prof'];
  const nameParts = consultation.patientName.split(' ');
  const firstName = titlePrefixes.includes(nameParts[0].toLowerCase())
    ? nameParts[1] || nameParts[0]
    : nameParts[0];

  return Response.json({
    conversation_config_override: {
      agent: {
        prompt: { prompt: systemPrompt },
        first_message: `Hello ${firstName}, welcome to Sanctuary Careflow. I can see your recent consultation regarding ${consultation.diagnosis}. I'm here to help you understand your diagnosis, medications, or care plan. What would you like to know?`,
      },
    },
    dynamic_variables: {
      patient_name: consultation.patientName,
      consultation_id: consultation.id,
      diagnosis: consultation.diagnosis,
    },
  });
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  return POST(request);
}
