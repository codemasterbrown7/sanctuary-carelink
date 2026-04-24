'use client';

import { useState } from 'react';
import ConsultationForm from '@/components/ConsultationForm';
import GuideCard from '@/components/GuideCard';

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuideCard step="Welcome" title="Careflow — A New Way to Use S5's Content Library" variant="info">
        <p>
          S5 has built a large library of clinically verified educational content, all tagged with ICD-10 codes.
          Right now, that content sits in S5. <strong>Careflow shows how it could be put to work</strong> — delivered
          directly to patients, matched to their specific diagnosis, as part of the post-consultation workflow.
        </p>
        <p>
          <strong>The full loop:</strong> A GP has a consultation &rarr; Careflow extracts structured clinical data from
          the transcript &rarr; matches educational content from S5 via ICD-10 codes &rarr; generates a personalised
          care summary &rarr; delivers everything to the patient via email, SMS, and a voice agent they can call with follow-up questions.
          All in the patient&apos;s language.
        </p>
        <p className="text-xs opacity-75 mt-2">
          <strong>Why this matters:</strong> 40-80% of medical information is forgotten immediately after a consultation (Kessels, 2003, JRSM).
          3 in 10 patients with limited English proficiency have difficulty understanding their provider&apos;s instructions (KFF Survey).
          Careflow addresses both — and gives S5&apos;s content a direct route to the patients who need it.
        </p>
      </GuideCard>

      <GuideCard step="Step 1" title="Start here — fill in patient details and a transcript" variant="action">
        <p>
          This is the <strong>clinician view</strong> — a lightweight app the GP has open alongside their existing system.
          All they need to enter is the patient&apos;s name, phone, email, and language. The consultation is recorded and
          transcribed in real time using Deepgram — the transcription does the rest.
        </p>
        <p>
          For this demo, click the <strong>&ldquo;Anxiety&rdquo;</strong> button in the blue banner to pre-fill with a real consultation
          transcript from PriMock57 — a dataset of 57 mock primary care consultations conducted by real Babylon Health clinicians.
        </p>
        <p>
          <strong>Enter your phone number</strong> in the Phone field so the SMS notification reaches you.
          Then click <strong>&ldquo;Process Transcript&rdquo;</strong> to see the AI extract structured clinical data.
        </p>
      </GuideCard>

      <div className="bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#003087] text-white">
          <div>
            <h2 className="text-lg font-semibold">New Consultation</h2>
            <p className="text-xs text-blue-200 mt-0.5">EMIS Web — Clinical Record Entry</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-blue-200 hover:text-white font-medium"
          >
            {showForm ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {showForm && <ConsultationForm />}
      </div>
    </div>
  );
}
