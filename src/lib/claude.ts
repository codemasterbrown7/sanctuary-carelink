import type { Language } from './mock-api/types';

// Known ICD-10 codes that have matched content in our video library
const ICD10_REFERENCE = [
  'E11 — Type 2 diabetes mellitus',
  'E11.9 — Type 2 diabetes mellitus without complications',
  'E11.65 — Type 2 diabetes mellitus with hyperglycaemia',
  'E11.0 — Type 2 diabetes mellitus with hyperosmolarity',
  'E11.3 — Type 2 diabetes mellitus with ophthalmic complications',
  'E10 — Type 1 diabetes mellitus',
  'E10.9 — Type 1 diabetes mellitus without complications',
  'I10 — Essential (primary) hypertension',
  'I11 — Hypertensive heart disease',
  'I11.9 — Hypertensive heart disease without heart failure',
  'F41 — Other anxiety disorders',
  'F41.1 — Generalised anxiety disorder',
  'F41.0 — Panic disorder',
  'F32 — Depressive episode',
  'F32.1 — Moderate depressive episode',
  'F32.9 — Depressive episode, unspecified',
  'J45 — Asthma',
  'J45.9 — Asthma, unspecified',
  'J44 — Other chronic obstructive pulmonary disease',
  'J44.9 — Chronic obstructive pulmonary disease, unspecified',
  'I25.1 — Atherosclerotic heart disease',
  'I21 — Acute myocardial infarction',
  'I48 — Atrial fibrillation and flutter',
  'J32 — Chronic sinusitis',
  'N39.0 — Urinary tract infection, site not specified',
  'J20 — Acute bronchitis',
  'R50.9 — Fever, unspecified',
  'R51 — Headache',
  'R06.0 — Dyspnoea',
  'R07.9 — Chest pain, unspecified',
  'M54.5 — Low back pain',
].join('\n');

// ── Transcript extraction ────────────────────────────────────

export interface ExtractedConsultation {
  diagnosis: string;
  icd10Codes: string[];
  medications: string[];
  medicationInstructions: string;
  plan: string;
  followUpDate: string | null;
  followUpInstructions: string;
  safetyNetting: string;
}

export async function extractConsultationData(transcript: string): Promise<ExtractedConsultation> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const today = new Date().toISOString().split('T')[0];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a clinical data extraction system. Extract structured data from this GP consultation transcript.

ICD-10 CODES (pick the most specific matching codes from this list):
${ICD10_REFERENCE}

TODAY'S DATE: ${today}

TRANSCRIPT:
${transcript}

Respond with ONLY valid JSON, no markdown fences:

{
  "diagnosis": "plain language diagnosis name, e.g. Type 2 diabetes mellitus",
  "icd10Codes": ["array of matching ICD-10 codes from the list above"],
  "medications": ["array of prescribed medications with strengths, e.g. Metformin 500mg tablets"],
  "medicationInstructions": "dosage and directions as stated by the doctor",
  "plan": "the management plan — combine all action items the doctor mentioned",
  "followUpDate": "ISO date string if a specific date/timeframe is mentioned (calculate from today ${today}), or null",
  "followUpInstructions": "what the doctor said about the follow-up visit",
  "safetyNetting": "any safety netting advice — warning signs to watch for, when to seek urgent help"
}

Rules:
- Pick ALL matching ICD-10 codes (e.g. both E11 and E11.9 for Type 2 diabetes)
- For followUpDate, if the doctor says "3 months", calculate the actual date from today
- If a field isn't mentioned in the transcript, use an empty string (or null for followUpDate)
- Do NOT invent information not present in the transcript`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';
  const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

// ── Transcript translation ───────────────────────────────────

// Maps both ISO codes and full names to display names.
// Full language names (e.g. "Spanish") pass through as-is for Claude.
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ar: 'Arabic', zh: 'Chinese', hi: 'Hindi', pt: 'Portuguese',
  pl: 'Polish', ur: 'Urdu', bn: 'Bengali', so: 'Somali',
  ro: 'Romanian', tr: 'Turkish', gu: 'Gujarati', pa: 'Punjabi',
};

export async function translateTranscript(transcript: string, targetLanguage: Language): Promise<string> {
  if (targetLanguage === 'en') return transcript;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Translate this medical consultation transcript into ${langName}. Keep the "Doctor:" and "Patient:" speaker labels but translate them too (e.g. "Médico:" / "Paciente:" in Spanish). Preserve the conversational tone. Translate medical terms accurately but use plain language where the doctor used plain language.

${transcript}`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text || transcript;
}

// ── Email translation ────────────────────────────────────────
// Translates ALL patient-facing email content in one Claude call.
// Works for any language — no hardcoded translation maps.

export interface EmailTranslations {
  // Template chrome
  subtitle: string;
  greeting: string;
  intro: string;
  diagnosisLabel: string;
  careSummaryHeading: string;
  medicationsLabel: string;
  followUpLabel: string;
  safetyLabel: string;
  resourcesHeading: string;
  resourcesSubtext: string;
  ctaHeading: string;
  ctaSubtext: string;
  ctaButton: string;
  footer: string;
  // Patient-specific data fields
  diagnosis: string;
  medicationInstructions: string;
  followUpInstructions: string;
  safetyNetting: string;
  // Video topic headings
  topicOverview: string;
  topicMedication: string;
  topicSideEffects: string;
  topicLifestyle: string;
  topicSymptoms: string;
  topicRisks: string;
  topicSupport: string;
  topicCauses: string;
  topicDiagnosis: string;
}

const ENGLISH_EMAIL_STRINGS: EmailTranslations = {
  subtitle: 'Your Post-Consultation Care Summary',
  greeting: '', // filled dynamically
  intro: "Thank you for your visit today. Below you'll find your personalised care summary and educational resources selected for your diagnosis.",
  diagnosisLabel: 'Diagnosis',
  careSummaryHeading: 'Your Care Summary',
  medicationsLabel: 'Your Medications',
  followUpLabel: 'Follow-up Appointment',
  safetyLabel: 'Important Safety Information',
  resourcesHeading: 'Your Educational Resources',
  resourcesSubtext: '', // filled dynamically
  ctaHeading: 'Have questions?',
  ctaSubtext: 'Call our AI health companion — it knows about your consultation and can help.',
  ctaButton: 'Call',
  footer: 'Powered by Sanctuary Health Careflow. All content is from trusted medical channels. This is not a substitute for professional medical advice.',
  diagnosis: '',
  medicationInstructions: '',
  followUpInstructions: '',
  safetyNetting: '',
  topicOverview: 'Understanding Your Condition',
  topicMedication: 'Your Medication',
  topicSideEffects: 'Medication Side Effects',
  topicLifestyle: 'Lifestyle & Wellbeing',
  topicSymptoms: 'Symptoms to Watch For',
  topicRisks: 'Important Information',
  topicSupport: 'Support & Resources',
  topicCauses: 'Understanding the Causes',
  topicDiagnosis: 'Your Diagnosis Explained',
};

export function getEnglishEmailStrings(): EmailTranslations {
  return { ...ENGLISH_EMAIL_STRINGS };
}

export async function translateEmailContent(
  fields: {
    firstName: string;
    videoCount: number;
    diagnosis: string;
    medicationInstructions: string;
    followUpInstructions: string;
    safetyNetting: string;
  },
  targetLanguage: string,
): Promise<EmailTranslations> {
  const langLower = targetLanguage.toLowerCase();
  if (langLower === 'en' || langLower === 'english') {
    return {
      ...ENGLISH_EMAIL_STRINGS,
      greeting: `Hi ${fields.firstName},`,
      resourcesSubtext: `${fields.videoCount} videos matched to your diagnosis from trusted health channels`,
      diagnosis: fields.diagnosis,
      medicationInstructions: fields.medicationInstructions,
      followUpInstructions: fields.followUpInstructions,
      safetyNetting: fields.safetyNetting,
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback to English if no API key
    return {
      ...ENGLISH_EMAIL_STRINGS,
      greeting: `Hi ${fields.firstName},`,
      resourcesSubtext: `${fields.videoCount} videos matched to your diagnosis from trusted health channels`,
      diagnosis: fields.diagnosis,
      medicationInstructions: fields.medicationInstructions,
      followUpInstructions: fields.followUpInstructions,
      safetyNetting: fields.safetyNetting,
    };
  }

  // Resolve language name — handle both codes ("es") and full names ("Spanish")
  const langName = LANGUAGE_NAMES[langLower] || targetLanguage;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Translate ALL of the following into ${langName}. These are strings for a patient-facing healthcare email. Use warm, clear, plain language. Return ONLY valid JSON, no markdown fences.

{
  "subtitle": "Your Post-Consultation Care Summary",
  "greeting": "Hi ${fields.firstName},",
  "intro": "Thank you for your visit today. Below you'll find your personalised care summary and educational resources selected for your diagnosis.",
  "diagnosisLabel": "Diagnosis",
  "careSummaryHeading": "Your Care Summary",
  "medicationsLabel": "Your Medications",
  "followUpLabel": "Follow-up Appointment",
  "safetyLabel": "Important Safety Information",
  "resourcesHeading": "Your Educational Resources",
  "resourcesSubtext": "${fields.videoCount} videos matched to your diagnosis from trusted health channels",
  "ctaHeading": "Have questions?",
  "ctaSubtext": "Call our AI health companion — it knows about your consultation and can help.",
  "ctaButton": "Call",
  "footer": "Powered by Sanctuary Health Careflow. All content is from trusted medical channels. This is not a substitute for professional medical advice.",
  "diagnosis": "${fields.diagnosis}",
  "medicationInstructions": "${fields.medicationInstructions}",
  "followUpInstructions": "${fields.followUpInstructions}",
  "safetyNetting": "${fields.safetyNetting}",
  "topicOverview": "Understanding Your Condition",
  "topicMedication": "Your Medication",
  "topicSideEffects": "Medication Side Effects",
  "topicLifestyle": "Lifestyle & Wellbeing",
  "topicSymptoms": "Symptoms to Watch For",
  "topicRisks": "Important Information",
  "topicSupport": "Support & Resources",
  "topicCauses": "Understanding the Causes",
  "topicDiagnosis": "Your Diagnosis Explained"
}`,
      }],
    }),
  });

  if (!response.ok) {
    // Fallback to English
    return {
      ...ENGLISH_EMAIL_STRINGS,
      greeting: `Hi ${fields.firstName},`,
      resourcesSubtext: `${fields.videoCount} videos matched to your diagnosis from trusted health channels`,
      diagnosis: fields.diagnosis,
      medicationInstructions: fields.medicationInstructions,
      followUpInstructions: fields.followUpInstructions,
      safetyNetting: fields.safetyNetting,
    };
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';
  try {
    const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      ...ENGLISH_EMAIL_STRINGS,
      greeting: `Hi ${fields.firstName},`,
      resourcesSubtext: `${fields.videoCount} videos matched to your diagnosis from trusted health channels`,
      diagnosis: fields.diagnosis,
      medicationInstructions: fields.medicationInstructions,
      followUpInstructions: fields.followUpInstructions,
      safetyNetting: fields.safetyNetting,
    };
  }
}

// ── Care summary generation ──────────────────────────────────

interface CareSummaryInput {
  patientName: string;
  diagnosis: string;
  icd10Codes: string[];
  medications: string[];
  doctorInstructions: string;
  contentTitles: string[];
  courseTitles: string[];
  language: Language;
}

export async function generateCareSummary(input: CareSummaryInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const langName = LANGUAGE_NAMES[input.language] || input.language;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Generate a warm, personalised care summary for a patient who just had a medical consultation. Write in plain language (8th grade reading level). Be empathetic but informative. Do not use medical jargon.

PATIENT: ${input.patientName}
DIAGNOSIS: ${input.diagnosis} (ICD-10: ${input.icd10Codes.join(', ')})
MEDICATIONS: ${input.medications.join(', ') || 'None prescribed'}
DOCTOR'S INSTRUCTIONS: ${input.doctorInstructions || 'None recorded'}

We have matched ${input.contentTitles.length} educational resources for them:
${input.contentTitles.map(t => `- ${t}`).join('\n')}

${input.courseTitles.length > 0 ? `We have also enrolled them in: ${input.courseTitles.join(', ')}` : ''}

Write the summary as if speaking directly to the patient. Include:
1. A warm greeting using their first name
2. A clear explanation of their diagnosis in simple terms
3. Information about their medication and why it was prescribed
4. The doctor's key instructions rephrased clearly
5. A mention of the educational resources available to them
6. An encouraging closing message

${input.language !== 'en' ? `IMPORTANT: Write the ENTIRE summary in ${langName}.` : ''}

Keep it to 4-6 paragraphs. Do not use bullet points or headers — write it as flowing, warm prose like a letter.`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error('Unexpected Claude response format');
}
