import { NextRequest } from 'next/server';
import { getConsultation } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const consultation = await getConsultation(id);

  if (!consultation) {
    return Response.json({ error: 'Consultation not found' }, { status: 404 });
  }

  // Re-run content matching to return full video objects
  const matchResult = matchContent({
    icd10Codes: consultation.icd10Codes,
    medications: consultation.medications,
  });

  return Response.json({
    consultation,
    matchedContent: matchResult,
  });
}
