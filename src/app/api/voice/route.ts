import { NextRequest } from 'next/server';
import { getConsultationByPhone } from '@/lib/store';

// Escape XML special characters to prevent TwiML injection
function escXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Twilio voice webhook — routes incoming calls to ElevenLabs via <Stream>
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callerPhone = formData.get('From') as string || '';
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (agentId) {
    const consultation = await getConsultationByPhone(callerPhone);

    let customParams = '';
    if (consultation) {
      customParams = `
        <Parameter name="consultation_id" value="${escXml(consultation.id)}" />
        <Parameter name="caller_phone" value="${escXml(callerPhone)}" />`;
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://api.elevenlabs.io/v1/convai/twilio/${escXml(agentId)}">
      <Parameter name="agent_id" value="${escXml(agentId)}" />${customParams}
    </Stream>
  </Connect>
</Response>`;

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Fallback: simple TwiML greeting if ElevenLabs is not configured
  const consultation = await getConsultationByPhone(callerPhone);
  const patientName = consultation?.patientName.split(' ')[0] || 'there';
  const diagnosis = consultation?.diagnosis || 'your recent visit';

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Amy">Hello ${escXml(patientName)}. Welcome to Sanctuary Careflow. I can see your recent consultation regarding ${escXml(diagnosis)}. Unfortunately, the voice AI is not configured for this demo. Please contact your healthcare provider directly for questions.</Say>
</Response>`;

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
