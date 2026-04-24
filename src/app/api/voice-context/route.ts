import { NextRequest } from 'next/server';
import { getConsultationByPhone, getConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';
import { normalizePhone } from '@/lib/phone';

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

LANGUAGE: The patient's preferred language is ${consultation.patientLanguage}. You MUST speak in ${consultation.patientLanguage} from the very start of the conversation and throughout. All responses should be in ${consultation.patientLanguage}.`;
}

const NO_CONSULTATION_PROMPT = 'You are a friendly health companion for Sanctuary Health Careflow. The caller does not have a recent consultation on file. Politely let them know and suggest they contact their healthcare provider directly. If they believe this is an error, suggest they call from the phone number their clinic has on file.';

// First message translations for common NHS patient languages
const FIRST_MESSAGES: Record<string, (name: string, diagnosis: string) => string> = {
  Spanish: (name, diagnosis) => `Hola ${name}, bienvenido a Sanctuary Careflow. Puedo ver tu consulta reciente sobre ${diagnosis}. Estoy aquí para ayudarte a entender tu diagnóstico, medicamentos o plan de cuidados. ¿Qué te gustaría saber?`,
  Polish: (name, diagnosis) => `Cześć ${name}, witamy w Sanctuary Careflow. Widzę twoją ostatnią konsultację dotyczącą ${diagnosis}. Jestem tutaj, aby pomóc ci zrozumieć diagnozę, leki lub plan opieki. O czym chciałbyś porozmawiać?`,
  Urdu: (name, diagnosis) => `ہیلو ${name}، Sanctuary Careflow میں خوش آمدید۔ میں آپ کی ${diagnosis} کے بارے میں حالیہ مشاورت دیکھ سکتا ہوں۔ میں آپ کی تشخیص، ادویات، یا نگہداشت کے منصوبے کو سمجھنے میں مدد کے لیے حاضر ہوں۔ آپ کیا جاننا چاہیں گے؟`,
  Bengali: (name, diagnosis) => `হ্যালো ${name}, Sanctuary Careflow-এ স্বাগতম। আমি আপনার ${diagnosis} সম্পর্কে সাম্প্রতিক পরামর্শ দেখতে পাচ্ছি। আমি আপনার রোগ নির্ণয়, ওষুধ বা যত্ন পরিকল্পনা বুঝতে সাহায্য করতে এখানে আছি। আপনি কী জানতে চান?`,
  Arabic: (name, diagnosis) => `مرحبا ${name}، أهلاً بك في Sanctuary Careflow. يمكنني رؤية استشارتك الأخيرة بخصوص ${diagnosis}. أنا هنا لمساعدتك في فهم تشخيصك أو أدويتك أو خطة رعايتك. ماذا تود أن تعرف؟`,
  Somali: (name, diagnosis) => `Salaam ${name}, ku soo dhawoow Sanctuary Careflow. Waxaan arki karaa la-talintaadii dhowaan ee ku saabsanayd ${diagnosis}. Waxaan halkan u joogaa inaan ku caawiyo fahamka caafimaadkaaga, daawadaada, ama qorshaha daryeelkaaga. Maxaad jeceshahay inaad ogaato?`,
  Romanian: (name, diagnosis) => `Bună ${name}, bine ai venit la Sanctuary Careflow. Pot vedea consultația ta recentă privind ${diagnosis}. Sunt aici să te ajut să înțelegi diagnosticul, medicamentele sau planul de îngrijire. Ce ai dori să afli?`,
  Portuguese: (name, diagnosis) => `Olá ${name}, bem-vindo ao Sanctuary Careflow. Posso ver a sua consulta recente sobre ${diagnosis}. Estou aqui para ajudá-lo a entender o seu diagnóstico, medicamentos ou plano de cuidados. O que gostaria de saber?`,
  French: (name, diagnosis) => `Bonjour ${name}, bienvenue à Sanctuary Careflow. Je peux voir votre consultation récente concernant ${diagnosis}. Je suis là pour vous aider à comprendre votre diagnostic, vos médicaments ou votre plan de soins. Que souhaitez-vous savoir ?`,
  Turkish: (name, diagnosis) => `Merhaba ${name}, Sanctuary Careflow'a hoş geldiniz. ${diagnosis} ile ilgili son muayenenizi görebiliyorum. Tanınızı, ilaçlarınızı veya bakım planınızı anlamanıza yardımcı olmak için buradayım. Ne öğrenmek istersiniz?`,
};

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

  // Normalize the caller phone so it matches regardless of format
  if (callerPhone) {
    callerPhone = normalizePhone(callerPhone);
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

  // Use translated first message if available, otherwise English
  const lang = consultation.patientLanguage;
  const getFirstMessage = FIRST_MESSAGES[lang];
  const firstMessage = getFirstMessage
    ? getFirstMessage(firstName, consultation.diagnosis)
    : `Hello ${firstName}, welcome to Sanctuary Careflow. I can see your recent consultation regarding ${consultation.diagnosis}. I'm here to help you understand your diagnosis, medications, or care plan. What would you like to know?`;

  return Response.json({
    conversation_config_override: {
      agent: {
        prompt: { prompt: systemPrompt },
        first_message: firstMessage,
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
