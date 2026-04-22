import { NextRequest } from 'next/server';
import { searchSnomedCodes } from '@/lib/snomed';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const results = searchSnomedCodes(q);
  return Response.json({ results });
}
