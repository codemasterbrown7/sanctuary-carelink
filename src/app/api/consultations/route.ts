import { NextRequest } from 'next/server';
import { createConsultation, updateConsultation, listConsultations } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';


export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.patientName || typeof body.patientName !== 'string') {
    return Response.json({ error: 'patientName is required' }, { status: 400 });
  }
  if (!body.patientPhone || typeof body.patientPhone !== 'string') {
    return Response.json({ error: 'patientPhone is required' }, { status: 400 });
  }

  // Sanitize string fields — cap at reasonable lengths
  const str = (v: unknown, max = 1000) => typeof v === 'string' ? v.slice(0, max) : '';
  const strArr = (v: unknown, max = 500) =>
    Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').map(s => s.slice(0, max)) : [];

  const consultation = await createConsultation({
    patientName: str(body.patientName, 200),
    patientDOB: str(body.patientDOB, 20),
    patientNHSNumber: str(body.patientNHSNumber, 20),
    patientSex: (['Male', 'Female', 'Other'].includes(body.patientSex) ? body.patientSex : 'Female') as 'Male' | 'Female' | 'Other',
    patientPhone: str(body.patientPhone, 30),
    patientEmail: str(body.patientEmail, 200),
    patientAddress: str(body.patientAddress, 500),
    patientLanguage: str(body.patientLanguage || 'en', 50),
    allergies: str(body.allergies),
    consultationType: (['Surgery consultation', 'Telephone encounter', 'Video consultation', 'Home visit'].includes(body.consultationType) ? body.consultationType : 'Surgery consultation') as 'Surgery consultation' | 'Telephone encounter' | 'Video consultation' | 'Home visit',
    clinician: str(body.clinician, 200),
    practice: str(body.practice, 200),
    history: str(body.history, 5000),
    examination: str(body.examination, 5000),
    observations: typeof body.observations === 'object' && body.observations !== null ? body.observations : {},
    diagnosis: str(body.diagnosis, 500),
    icd10Codes: strArr(body.icd10Codes, 20),
    clinicalNotes: str(body.clinicalNotes, 5000),
    plan: str(body.plan, 5000),
    medications: strArr(body.medications),
    medicationInstructions: str(body.medicationInstructions, 2000),
    investigations: str(body.investigations, 2000),
    referrals: str(body.referrals, 2000),
    followUpDate: typeof body.followUpDate === 'string' ? body.followUpDate.slice(0, 20) : null,
    followUpInstructions: str(body.followUpInstructions, 2000),
    safetyNetting: str(body.safetyNetting, 2000),
    transcript: typeof body.transcript === 'string' ? body.transcript.slice(0, 50000) : null,
  });

  // Automatically match content
  const matchResult = matchContent({
    icd10Codes: consultation.icd10Codes,
    medications: consultation.medications,
  });

  // Update consultation with matched video IDs
  const updated = await updateConsultation(consultation.id, {
    matchedVideoIds: matchResult.videos.map(v => v.id),
    status: 'content_matched',
  });

  return Response.json({
    consultation: updated || { ...consultation, status: 'content_matched' },
    matchResult,
  }, { status: 201 });
}

export async function GET() {
  const consultations = await listConsultations();
  return Response.json({ consultations });
}
