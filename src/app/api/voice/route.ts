import { NextRequest } from 'next/server';
import { getConsultationByPhone } from '@/lib/store';

// Twilio voice webhook — receives incoming calls and routes to ElevenLabs
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callerPhone = formData.get('From') as string || '';
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  // Look up the patient by phone number
  const consultation = await getConsultationByPhone(callerPhone);

  if (agentId) {
    // ElevenLabs Conversational AI integration via Twilio <Connect>
    // The ElevenLabs agent will call our /api/voice-context endpoint
    // to get the patient's consultation context as a dynamic system prompt
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const contextParam = consultation
      ? `consultationId=${consultation.id}`
      : `phone=${encodeURIComponent(callerPhone)}`;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationalAI url="wss://api.elevenlabs.io/v1/convai/twilio/${agentId}" agentUrl="${baseUrl}/api/voice-context?${contextParam}" />
  </Connect>
</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Fallback: simple TwiML greeting if ElevenLabs is not configured
  const patientName = consultation?.patientName.split(' ')[0] || 'there';
  const diagnosis = consultation?.diagnosis || 'your recent visit';
  const medications = consultation?.medications.join(' and ') || '';

  const greeting = consultation
    ? `Hello ${patientName}. Welcome to Sanctuary CareLink. I can see your recent consultation regarding ${diagnosis}.${medications ? ` You were prescribed ${medications}.` : ''} I'm here to help answer any questions about your diagnosis, medications, or care plan. Unfortunately, the voice AI is not configured for this demo, but in production, you would be speaking with an intelligent AI companion that has full context from your consultation.`
    : `Hello there. Welcome to Sanctuary CareLink. I wasn't able to find a consultation linked to your phone number. Please make sure you're calling from the number your clinic has on file. If you need immediate help, please contact your healthcare provider directly.`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">${greeting}</Say>
  <Pause length="2"/>
  <Say voice="Polly.Amy">Thank you for calling. Goodbye.</Say>
</Response>`;

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
