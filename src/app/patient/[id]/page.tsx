'use client';

import { useState, useEffect, use } from 'react';
import ContentCard from '@/components/ContentCard';
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
      {/* Greeting */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-primary text-xl">💚</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Hi {c.patientName.split(' ')[0]}, here is your care summary
        </h1>
        <p className="text-muted mt-2">
          Following your consultation on {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Care Summary */}
      {c.careSummary && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '250ms' }}>
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
        <div className="bg-primary-light/50 border border-primary/20 rounded-xl p-5 mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-semibold text-primary-dark mb-2">Your Care Plan</h3>
          <p className="text-sm text-primary-dark leading-relaxed">{c.plan}</p>
        </div>
      )}

      {/* Safety Netting */}
      {c.safetyNetting && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 animate-fade-in" style={{ animationDelay: '320ms' }}>
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

      {/* Callback CTA */}
      <div className="bg-primary text-white rounded-xl p-6 text-center mt-8 mb-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h2 className="text-lg font-semibold mb-2">Have Questions?</h2>
        <p className="text-sm text-white/80 mb-4">
          Call our AI health companion anytime. It knows about your consultation and can answer questions about your diagnosis, medications, and care plan.
        </p>
        <a
          href={`tel:${callbackNumber}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
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
