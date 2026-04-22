import { NextRequest } from 'next/server';
import { createConsultation, updateConsultation, listConsultations } from '@/lib/store';
import { matchContent } from '@/lib/content-matcher';


export async function POST(request: NextRequest) {
  const body = await request.json();

  const consultation = await createConsultation({
    patientName: body.patientName,
    patientDOB: body.patientDOB || '',
    patientNHSNumber: body.patientNHSNumber || '',
    patientSex: body.patientSex || 'Female',
    patientPhone: body.patientPhone,
    patientEmail: body.patientEmail || '',
    patientAddress: body.patientAddress || '',
    patientLanguage: body.patientLanguage || 'en',
    allergies: body.allergies || '',
    consultationType: body.consultationType || 'Surgery consultation',
    clinician: body.clinician || '',
    practice: body.practice || '',
    history: body.history || '',
    examination: body.examination || '',
    observations: body.observations || {},
    diagnosis: body.diagnosis || '',
    icd10Codes: body.icd10Codes || [],
    clinicalNotes: body.clinicalNotes || '',
    plan: body.plan || '',
    medications: body.medications || [],
    medicationInstructions: body.medicationInstructions || '',
    investigations: body.investigations || '',
    referrals: body.referrals || '',
    followUpDate: body.followUpDate || null,
    followUpInstructions: body.followUpInstructions || '',
    safetyNetting: body.safetyNetting || '',
    transcript: body.transcript || null,
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
