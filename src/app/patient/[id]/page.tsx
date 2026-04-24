'use client';

import { useState, useEffect, use } from 'react';
import ContentCard from '@/components/ContentCard';
import GuideCard from '@/components/GuideCard';
import { demoConfig } from '@/config/demo';
import type { Consultation, HealthVideo } from '@/lib/mock-api/types';

interface PatientData {
  consultation: Consultation;
  matchedContent: {
    videos: HealthVideo[];
    groupedByTopic: Record<string, HealthVideo[]>;
    metadata: {
      totalMatched: number;
      icd10CodesUsed: string[];
      topicsIncluded: string[];
    };
  };
}

const TOPIC_LABELS: Record<string, string> = {
  overview: 'Understanding Your Condition',
  medication: 'Your Medication',
  lifestyle: 'Lifestyle & Wellbeing',
  symptoms: 'Symptoms to Watch For',
  risks: 'Important Information',
  sideEffects: 'Medication Side Effects',
  support: 'Support & Resources',
  causes: 'Understanding the Causes',
  diagnosis: 'Your Diagnosis Explained',
};

export default function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/consultations/${id}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted mt-4">Loading your care information...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted">Care information not found.</p>
      </div>
    );
  }

  const { consultation: c, matchedContent } = data;
  const callbackNumber = demoConfig.callbackNumber;

  const priorityTopics = ['overview', 'medication', 'lifestyle'];
  const otherTopics = Object.keys(matchedContent.groupedByTopic).filter(
    t => !priorityTopics.includes(t)
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <GuideCard step="Patient View" title="This is what the patient receives" variant="info">
        <p>
          This page is what the patient sees when they click the link in their SMS or email.
          It contains their care summary, medications, follow-up date, safety information,
          and all the educational videos matched to their diagnosis.
        </p>
        {c.patientLanguage && c.patientLanguage !== 'en' && (
          <p>
            Because this patient&apos;s language is set to <strong>{c.patientLanguage}</strong>,
            the care summary is generated in {c.patientLanguage}. The email they received is also
            fully translated — every heading, label, and piece of content.
          </p>
        )}
        <p>
          At the bottom of this page is a phone number for an <strong>AI voice agent</strong>.
          When the patient calls, before the conversation even starts, ElevenLabs fires a webhook
          to our API. We look up the patient by their phone number, load the full consultation
          context — diagnosis, medications, care plan, transcript — and inject it as the system prompt.
          The agent greets them by name, in their language, from the very first word.
        </p>
        <p>
          For example, if the patient forgot the specific type of therapy the doctor recommended,
          or can&apos;t remember their medication instructions, they can call this number instead of
          having to ring the GP practice — which saves time for both the patient and the practice.
        </p>
      </GuideCard>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">
          Your care summary
        </h1>
        <p className="text-sm text-muted mt-1">
          {c.patientName} — consultation on {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Care Summary */}
      {c.careSummary && (
        <div className="bg-card border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">Your Care Summary</h2>
          <div className="space-y-2">
            {c.careSummary.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {c.medications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Your Medications</h3>
            <ul className="space-y-1">
              {c.medications.map((med, i) => (
                <li key={i} className="text-sm text-blue-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {med}
                </li>
              ))}
            </ul>
            {c.medicationInstructions && (
              <p className="text-xs text-blue-600 mt-2">{c.medicationInstructions}</p>
            )}
          </div>
        )}
        {c.followUpDate && (
          <div className="bg-amber-50 border border-amber-200 p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Follow-up Appointment</h3>
            <p className="text-sm text-amber-700">
              {new Date(c.followUpDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {c.followUpInstructions && (
              <p className="text-xs text-amber-600 mt-1">{c.followUpInstructions}</p>
            )}
          </div>
        )}
      </div>

      {/* Plan / Instructions */}
      {c.plan && (
        <div className="bg-primary-light/50 border border-primary/20 p-5 mb-8">
          <h3 className="text-sm font-semibold text-primary-dark mb-2">Your Care Plan</h3>
          <p className="text-sm text-primary-dark leading-relaxed">{c.plan}</p>
        </div>
      )}

      {/* Safety Netting */}
      {c.safetyNetting && (
        <div className="bg-red-50 border border-red-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Important Safety Information</h3>
          <p className="text-sm text-red-700 leading-relaxed">{c.safetyNetting}</p>
        </div>
      )}

      {/* Videos by Topic */}
      {[...priorityTopics, ...otherTopics].map(topic => {
        const videos = matchedContent.groupedByTopic[topic];
        if (!videos || videos.length === 0) return null;
        return (
          <div key={topic} className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-3">{TOPIC_LABELS[topic] || topic}</h2>
            <div className="space-y-3">
              {(videos as HealthVideo[]).map((video, i) => (
                <ContentCard key={video.id} video={video} index={i} compact />
              ))}
            </div>
          </div>
        );
      })}

      {/* Guide: try calling */}
      <div className="bg-amber-50 border-2 border-amber-300 px-4 py-3 mt-8">
        <p className="text-base font-bold text-amber-900 mb-1">Try calling the AI voice agent</p>
        <p className="text-sm text-amber-700">
          Call the number below and ask it questions about the consultation — for example,
          &ldquo;What therapy did the doctor recommend?&rdquo; or &ldquo;What are my medication instructions?&rdquo;.
          The agent loads the full consultation context before the call even starts, so it knows everything the doctor discussed.
        </p>
      </div>

      {/* Callback CTA */}
      <div className="bg-primary text-white p-6 text-center mt-4 mb-8">
        <h2 className="text-lg font-semibold mb-2">Have Questions?</h2>
        <p className="text-sm text-white/80 mb-4">
          Call our AI health companion anytime. It knows about your consultation and can answer questions about your diagnosis, medications, and care plan.
        </p>
        <a
          href={`tel:${callbackNumber}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call {callbackNumber}
        </a>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted pb-8">
        <p>Powered by Sanctuary Health Careflow</p>
        <p className="mt-1">All content is clinically verified. This is not a substitute for professional medical advice.</p>
      </div>
    </div>
  );
}
