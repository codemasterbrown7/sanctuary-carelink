import { NextRequest } from 'next/server';
import { extractConsultationData } from '@/lib/claude';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { transcript } = body;

  if (!transcript || transcript.trim().length < 20) {
    return Response.json({ error: 'Transcript too short' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const extracted = await extractConsultationData(transcript);
    return Response.json({ extracted });
  } catch (err) {
    console.error('Extraction error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Extraction failed' },
      { status: 500 },
    );
  }
}
