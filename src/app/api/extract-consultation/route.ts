import { NextRequest } from 'next/server';
import { extractConsultationData } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { transcript } = body;

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 20) {
    return Response.json({ error: 'Transcript too short' }, { status: 400 });
  }

  // Cap transcript length to prevent cost amplification (50k chars ≈ 12k tokens)
  const trimmedTranscript = transcript.slice(0, 50000);

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const extracted = await extractConsultationData(trimmedTranscript);
    return Response.json({ extracted });
  } catch (err) {
    console.error('Extraction error:', err);
    return Response.json(
      { error: 'Failed to extract consultation data. Please try again.' },
      { status: 500 },
    );
  }
}
