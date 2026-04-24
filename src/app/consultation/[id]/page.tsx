'use client';

import { useState, useEffect, use } from 'react';
import ContentCard from '@/components/ContentCard';
import StatusTimeline from '@/components/StatusTimeline';
import type { Consultation, HealthVideo } from '@/lib/mock-api/types';

interface ConsultationData {
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
  overview: 'Overview',
  medication: 'Medication',
  lifestyle: 'Lifestyle',
  symptoms: 'Symptoms',
  risks: 'Risks',
  sideEffects: 'Side Effects',
  support: 'Support',
  causes: 'Causes',
  diagnosis: 'Diagnosis',
};

export default function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ConsultationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetch(`/api/consultations/${id}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function generateSummary() {
    if (!data) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: id }),
      });
      const result = await res.json();
      setData(prev => prev ? {
        ...prev,
        consultation: { ...prev.consultation, careSummary: result.summary, status: 'summary_generated' },
      } : null);
    } catch (err) {
      console.error(err);
    }
    setGeneratingSummary(false);
  }

  async function sendNotification() {
    if (!data) return;
    setSendingNotification(true);
    try {
      const res = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId: id }),
      });
      const result = await res.json();
      if (result.success) {
        setData(prev => prev ? {
          ...prev,
          consultation: { ...prev.consultation, status: 'notification_sent' },
        } : null);
      }
    } catch (err) {
      console.error(err);
    }
    setSendingNotification(false);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#005eb8] border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted mt-4">Loading consultation...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-lg font-semibold text-foreground">Consultation not found</p>
        <a href="/dashboard" className="text-sm text-[#005eb8] hover:underline mt-2 inline-block">Back to dashboard</a>
      </div>
    );
  }

  const { consultation: c, matchedContent } = data;

  const timelineSteps = [
    {
      label: 'Consultation recorded',
      status: 'completed' as const,
      detail: new Date(c.createdAt).toLocaleString(),
    },
    {
      label: `${matchedContent.metadata.totalMatched} videos matched`,
      status: 'completed' as const,
      detail: `ICD-10: ${c.icd10Codes.join(', ')}`,
    },
    {
      label: 'AI care summary',
      status: (c.careSummary ? 'completed' : 'current') as 'completed' | 'current',
      detail: c.careSummary ? 'Generated' : 'Ready to generate',
    },
    {
      label: 'Patient notification',
      status: (c.status === 'notification_sent' ? 'completed' : 'pending') as 'completed' | 'pending',
      detail: c.status === 'notification_sent' ? 'SMS + Email sent' : 'In production: sent 2 hours post-consultation',
    },
    {
      label: 'Voice follow-up line active',
      status: (c.status === 'notification_sent' ? 'completed' : 'pending') as 'completed' | 'pending',
      detail: 'Patient can call to ask questions about their consultation',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Patient Header — NHS style */}
      <div className="bg-[#003087] text-white p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{c.patientName}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-blue-200">
              <span>DOB: {c.patientDOB}</span>
              <span>NHS: {c.patientNHSNumber}</span>
              <span>{c.patientSex}</span>
              <span>{c.patientPhone}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-2 py-0.5 bg-white/10 text-xs">
                {c.diagnosis}
              </span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-200 text-xs font-mono">
                ICD-10: {c.icd10Codes.join(', ')}
              </span>
            </div>
            {c.medications.length > 0 && (
              <p className="text-sm text-blue-200 mt-2">
                Rx: <span className="text-white font-medium">{c.medications.join(', ')}</span>
                {c.medicationInstructions && <span className="text-blue-300"> — {c.medicationInstructions}</span>}
              </p>
            )}
            {c.allergies && (
              <p className="text-sm mt-1">
                <span className="px-2 py-0.5 bg-red-500/30 text-red-200 text-xs font-medium">
                  Allergies: {c.allergies}
                </span>
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 text-right text-sm text-blue-200">
            <span>{c.consultationType}</span>
            <span>{c.clinician}</span>
            <span>{c.practice}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Matched Videos + Transcript */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content summary */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {matchedContent.metadata.totalMatched} educational videos matched
            </span>
            <span className="text-xs text-muted">|</span>
            <span className="text-xs text-muted">
              Topics: {matchedContent.metadata.topicsIncluded.map(t => TOPIC_LABELS[t] || t).join(', ')}
            </span>
          </div>
          <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2">
            These videos were matched using ICD-10 codes from the transcript — the same matching logic as S5&apos;s content API.
            In production, these would be real Sanctuary videos instead of YouTube placeholders.
          </p>

          {/* Videos grouped by topic */}
          {Object.entries(matchedContent.groupedByTopic).map(([topic, videos]) => (
            <div key={topic}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                {TOPIC_LABELS[topic] || topic}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(videos as HealthVideo[]).map((video, i) => (
                  <ContentCard key={video.id} video={video} index={i} />
                ))}
              </div>
            </div>
          ))}

          {/* Transcript */}
          {c.transcript && (
            <div className="bg-card border border-border p-6">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center justify-between w-full"
              >
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">
                  Consultation Transcript
                </h3>
                <span className="text-xs text-[#005eb8]">{showTranscript ? 'Hide' : 'Show'}</span>
              </button>
              {showTranscript && (
                <pre className="mt-4 text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 p-4 max-h-96 overflow-y-auto">
                  {c.transcript}
                </pre>
              )}
            </div>
          )}

          {/* Clinical Notes */}
          {(c.history || c.clinicalNotes || c.plan) && (
            <div className="bg-card border border-border p-6 space-y-4">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Clinical Record</h3>
              {c.history && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-1">History</p>
                  <p className="text-sm text-foreground">{c.history}</p>
                </div>
              )}
              {c.clinicalNotes && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-1">Clinical Notes</p>
                  <p className="text-sm text-foreground">{c.clinicalNotes}</p>
                </div>
              )}
              {c.plan && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-1">Plan</p>
                  <p className="text-sm text-foreground">{c.plan}</p>
                </div>
              )}
              {c.safetyNetting && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-1">Safety Netting</p>
                  <p className="text-sm text-foreground text-amber-700">{c.safetyNetting}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Timeline + Actions */}
        <div className="space-y-6">
          {/* Pipeline Status */}
          <div className="bg-card border border-border p-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Care Pipeline</h3>
            <StatusTimeline steps={timelineSteps} />
          </div>

          {/* Demo Controls */}
          <div className="bg-card border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Actions</h3>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Demo</span>
            </div>
            <div className="space-y-3">
              {!c.careSummary && (
                <div className="bg-amber-50 border-2 border-amber-300 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-600 text-white text-sm font-bold">4</span>
                    <span className="text-base font-bold text-amber-900">Generate care summary</span>
                    <span className="text-sm text-amber-500 font-medium ml-auto">Step 4 of 5</span>
                  </div>
                  <p className="text-sm text-amber-700 ml-9">
                    Claude writes a plain-language care summary from the transcript, at an 8th-grade reading level.
                  </p>
                </div>
              )}
              <button
                onClick={generateSummary}
                disabled={generatingSummary || !!c.careSummary}
                className="w-full py-2.5 px-4 bg-[#005eb8] hover:bg-[#003d78] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingSummary ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating with Claude...
                  </>
                ) : c.careSummary ? (
                  'Summary Generated'
                ) : (
                  'Generate AI Care Summary'
                )}
              </button>
              {c.careSummary && c.status !== 'notification_sent' && (
                <div className="bg-amber-50 border-2 border-amber-300 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-amber-600 text-white text-sm font-bold">5</span>
                    <span className="text-base font-bold text-amber-900">Send to patient</span>
                    <span className="text-sm text-amber-500 font-medium ml-auto">Step 5 of 5</span>
                  </div>
                  <p className="text-sm text-amber-700 ml-9">
                    Send the care summary, matched videos, and follow-up info to the patient via SMS and email.
                    In production, this fires automatically ~2 hours after the consultation.
                    {c.patientLanguage && c.patientLanguage !== 'en' && (
                      <span> The entire email will be translated into {c.patientLanguage}.</span>
                    )}
                  </p>
                  <p className="text-sm text-amber-700 ml-9 mt-1">
                    After sending, try <strong>calling the AI voice agent</strong> from the patient page — it knows the full
                    consultation context and can answer questions about the diagnosis, medications, and care plan.
                  </p>
                </div>
              )}
              <button
                onClick={sendNotification}
                disabled={sendingNotification || !c.careSummary || c.status === 'notification_sent'}
                className="w-full py-2.5 px-4 bg-[#007f3b] hover:bg-[#005a2b] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingNotification ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : c.status === 'notification_sent' ? (
                  'Notification Sent'
                ) : (
                  'Send SMS + Email Now'
                )}
              </button>
              <p className="text-xs text-muted text-center">
                In production: SMS + email sent automatically 2 hours post-consultation
              </p>
            </div>
          </div>

          {/* Care Summary Preview */}
          {c.careSummary && (
            <div className="bg-card border border-border p-6 animate-fade-in">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">AI Care Summary</h3>
              <div className="prose prose-sm max-w-none text-foreground">
                {c.careSummary.split('\n').map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed mb-2">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Guide: after notification sent */}
          {c.status === 'notification_sent' && (
            <div className="bg-green-50 border-2 border-green-300 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-green-600 text-white text-sm font-bold">&check;</span>
                <span className="text-base font-bold text-green-900">Done — check your phone and email</span>
              </div>
              <p className="text-sm text-green-700 ml-9">
                You should have received an SMS with a link and an HTML email with the care summary, medications, follow-up info,
                safety netting, and all matched videos.
              </p>
              <p className="text-sm text-green-700 ml-9">
                Open the patient page to see what the patient sees. At the bottom, there&apos;s a phone number for
                an <strong>AI voice agent</strong> — try calling it and asking questions about the consultation
                (e.g. &ldquo;What therapy did the doctor recommend?&rdquo; or &ldquo;What are my medication instructions?&rdquo;).
                It knows the full consultation context.
              </p>
              <p className="ml-9">
                <a href={`/patient/${id}`} className="text-sm font-bold text-[#005eb8] underline">
                  Open Patient View &rarr;
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
