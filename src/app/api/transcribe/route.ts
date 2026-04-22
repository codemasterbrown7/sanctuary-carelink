import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audio = formData.get('audio') as Blob | null;

  if (!audio) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 });
  }

  // If Deepgram API key is available, use real transcription
  if (process.env.DEEPGRAM_API_KEY) {
    try {
      const buffer = Buffer.from(await audio.arrayBuffer());

      const res = await fetch('https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&diarize=true&punctuate=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': audio.type || 'audio/webm',
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error(`Deepgram API error: ${res.status}`);
      }

      const data = await res.json();
      const words = data.results?.channels?.[0]?.alternatives?.[0]?.words || [];

      // Format with speaker labels
      let transcript = '';
      let currentSpeaker = -1;
      for (const word of words) {
        if (word.speaker !== currentSpeaker) {
          currentSpeaker = word.speaker;
          const label = currentSpeaker === 0 ? 'Doctor' : 'Patient';
          transcript += `\n${label}: `;
        }
        transcript += word.punctuated_word + ' ';
      }

      return Response.json({ transcript: transcript.trim() });
    } catch (err) {
      console.error('Deepgram transcription error:', err);
      return Response.json({
        transcript: null,
        error: 'Transcription failed — paste transcript manually',
      });
    }
  }

  // Fallback: no API key
  return Response.json({
    transcript: null,
    error: 'Transcription service not configured — paste transcript manually',
  });
}
