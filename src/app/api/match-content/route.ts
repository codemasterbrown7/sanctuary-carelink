import { NextRequest } from 'next/server';
import { matchContent } from '@/lib/content-matcher';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = matchContent({
    icd10Codes: body.icd10Codes || [],
    medications: body.medications || [],
    topics: body.topics,
  });

  return Response.json(result);
}
