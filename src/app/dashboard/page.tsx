'use client';

import { useState } from 'react';
import ConsultationForm from '@/components/ConsultationForm';
import GuideCard from '@/components/GuideCard';

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GuideCard step="Welcome" title="Careflow Demo — How S5 Content Gets to Patients" variant="info">
        <p>
          This demo shows how <strong>Careflow</strong> and <strong>S5</strong> could work together as one integrated product.
          The educational content S5 already has gets delivered to patients automatically, matched to their specific diagnosis,
          as part of the post-consultation workflow.
        </p>
        <p>
          <strong>The full loop:</strong> A GP has a consultation &rarr; Careflow extracts structured clinical data from
          the transcript &rarr; matches it to the right educational content via ICD-10 codes &rarr; generates a personalised
          care summary &rarr; delivers everything to the patient via email, SMS, and a voice agent they can call with follow-up questions.
          All in the patient&apos;s language.
        </p>
        <p className="text-xs opacity-75 mt-2">
          <strong>Why this matters:</strong> 40-80% of medical information is forgotten immediately after a consultation (Kessels, 2003, JRSM).
          3 in 10 patients with limited English proficiency have difficulty understanding their provider&apos;s instructions (KFF Survey).
          Careflow addresses both problems while saving GP time on documentation.
        </p>
      </GuideCard>

      <GuideCard step="Step 1" title="Start here — fill in patient details and a transcript" variant="action">
        <p>
          This is the <strong>clinician view</strong> — designed to sit inside the workflow a GP already uses (e.g. EMIS Web).
          In production, the system would record and transcribe the consultation in real time using Deepgram. The GP wouldn&apos;t need to type anything.
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
