'use client';

import { useState, useEffect, use } from 'react';
import ContentCard from '@/components/ContentCard';
import StatusTimeline from '@/components/StatusTimeline';
import GuideCard from '@/components/GuideCard';
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
      <GuideCard step="Step 3" title="Content has been matched — now generate the care summary" variant="info">
        <p>
          The system matched educational videos to this patient based on <strong>ICD-10 codes</strong> using
          bidirectional prefix matching — the same logic as S5&apos;s <code>icd10: &#123; contains: [...] &#125;</code> GraphQL filter.
          In production, you&apos;d swap the YouTube videos below for real Sanctuary content with a single API call to S5.
        </p>
        <p>
          On the right side, you&apos;ll see the <strong>Care Pipeline</strong> — this tracks the full delivery workflow.
          Now click <strong>&ldquo;Generate AI Care Summary&rdquo;</strong> to have Claude write a plain-language summary of the
          consultation, written at an 8th-grade reading level in the patient&apos;s language.
        </p>
        <p>
          After the summary generates, click <strong>&ldquo;Send SMS + Email Now&rdquo;</strong> to deliver everything to the patient.
          In production, this fires automatically ~2 hours after the consultation.
          If the patient&apos;s language isn&apos;t English, the entire email and care summary are translated automatically —
          similar to how S5&apos;s content supports multiple languages, but applied to the personalised output too.
        </p>
      </GuideCard>

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
            <GuideCard step="Step 4" title="Notification sent — check your phone and email" variant="action">
              <p>
                The patient just received an <strong>SMS</strong> with a link and a full <strong>HTML email</strong> with
                their diagnosis, care summary, medications, follow-up date, safety information, and all matched videos.
              </p>
              <p>
                If the patient&apos;s language isn&apos;t English, the entire email is translated — every heading, label, and piece
                of content — in a single Claude API call. It works for any language, not a hardcoded list.
              </p>
              <p>
                Click the link in the SMS or open the patient page below to see what the patient sees.
                At the bottom of that page, there&apos;s a phone number to call an <strong>AI voice agent</strong> that knows
                the full consultation context.
              </p>
              <p>
                <a href={`/patient/${id}`} className="font-semibold underline">
                  Open Patient View &rarr;
                </a>
              </p>
            </GuideCard>
          )}
        </div>
      </div>
    </div>
  );
}
