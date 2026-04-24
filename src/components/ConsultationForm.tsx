'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ExtractedConsultation } from '@/lib/claude';
import { DEMO_SCENARIOS } from '@/lib/demo-transcripts';
import GuideCard from '@/components/GuideCard';

// ── Demo fill button ─────────────────────────────────────────
function DemoFill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Auto-fill for demo"
      className="ml-2 px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-[#005eb8] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
    >
      fill
    </button>
  );
}

// ── Transcript Recorder ──────────────────────────────────────
function TranscriptRecorder({ transcript, onTranscriptChange }: {
  transcript: string;
  onTranscriptChange: (t: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.transcript) {
            onTranscriptChange(transcript ? transcript + '\n\n' + data.transcript : data.transcript);
          }
        } catch {
          onTranscriptChange(transcript ? transcript + '\n\n[Transcription failed — paste transcript below]' : '[Transcription failed — paste transcript below]');
        }
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone access or paste the transcript manually.');
    }
  }, [transcript, onTranscriptChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 bg-[#d5281b] hover:bg-[#b2211a] text-white text-sm font-medium transition-colors"
          >
            <span className="w-2 h-2 bg-white" />
            Stop Recording ({formatTime(recordingTime)})
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-[#d5281b] hover:bg-[#b2211a] text-white text-sm font-medium transition-colors"
          >
            <span className="w-2 h-2 bg-white" />
            Record Consultation
          </button>
        )}
        <span className="text-xs text-gray-500">
          {recording ? 'Recording... Click stop when consultation ends' : 'Or paste transcript below'}
        </span>
      </div>
      <textarea
        value={transcript}
        onChange={e => onTranscriptChange(e.target.value)}
        rows={10}
        placeholder="Doctor: Good morning Mrs Garcia, how are you feeling today?&#10;Patient: I've been getting quite thirsty lately and going to the toilet a lot...&#10;Doctor: I see, and when did you first notice these symptoms?&#10;..."
        className="emis-input w-full text-sm font-mono resize-y"
      />
    </div>
  );
}

// ── Demo data sourced from DEMO_SCENARIOS ───────────────────

// ── Main Form ────────────────────────────────────────────────
export default function ConsultationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Section A: Contact
  const [contact, setContact] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientLanguage: 'en',
  });

  // Section B: Transcript
  const [transcript, setTranscript] = useState('');

  // Section C: Extracted data (null = not yet processed)
  const [extracted, setExtracted] = useState<ExtractedConsultation | null>(null);
  const [editableExtracted, setEditableExtracted] = useState<ExtractedConsultation | null>(null);

  const updateContact = (field: string, value: string) =>
    setContact(prev => ({ ...prev, [field]: value }));

  const updateExtracted = (field: string, value: string | string[] | null) =>
    setEditableExtracted(prev => prev ? { ...prev, [field]: value } : null);

  async function processTranscript() {
    if (!transcript.trim()) {
      alert('Please enter or record a transcript first');
      return;
    }
    setExtracting(true);

    try {
      const res = await fetch('/api/extract-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Extraction failed');
      }

      const data = await res.json();
      setExtracted(data.extracted);
      setEditableExtracted(data.extracted);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to process transcript');
    }
    setExtracting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editableExtracted) {
      alert('Please process the transcript first');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: contact.patientName,
          patientPhone: contact.patientPhone,
          patientEmail: contact.patientEmail,
          patientLanguage: contact.patientLanguage,
          patientDOB: '',
          patientNHSNumber: '',
          patientSex: 'Female',
          patientAddress: '',
          allergies: '',
          consultationType: 'Surgery consultation',
          clinician: '',
          practice: '',
          history: '',
          examination: '',
          observations: {},
          diagnosis: editableExtracted.diagnosis,
          icd10Codes: editableExtracted.icd10Codes,
          clinicalNotes: '',
          plan: editableExtracted.plan,
          medications: editableExtracted.medications,
          medicationInstructions: editableExtracted.medicationInstructions,
          investigations: '',
          referrals: '',
          followUpDate: editableExtracted.followUpDate,
          followUpInstructions: editableExtracted.followUpInstructions,
          safetyNetting: editableExtracted.safetyNetting,
          transcript,
        }),
      });

      if (!res.ok) throw new Error('Failed to create consultation');
      const data = await res.json();
      router.push(`/consultation/${data.consultation.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="emis-form">
      {/* ── Step 1: Choose a demo scenario ──────────── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <p className="text-xs font-semibold text-amber-800 mb-0.5">Step 1 &mdash; Choose a demo scenario</p>
        <p className="text-xs text-amber-700 mb-2">
          Each uses a real consultation transcript from published research datasets. This pre-fills the patient details and transcript below.
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setContact(s.contact);
                setTranscript(s.transcript);
                setExtracted(null);
                setEditableExtracted(null);
              }}
              className="px-4 py-2 bg-[#005eb8] hover:bg-[#003d78] text-white text-sm font-medium transition-colors"
            >
              {s.condition}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section A: Patient Contact ──────────── */}
      <div className="emis-banner">
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-wider text-blue-200">Patient Contact Details</span>
          <p className="text-xs text-blue-200 mt-1 font-normal">
            In production, a GP has this open alongside their existing system. All they enter is the patient&apos;s contact info — the transcription handles everything else.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="emis-label">Patient Name</label>
            <input className="emis-input" required value={contact.patientName} onChange={e => updateContact('patientName', e.target.value)} placeholder="Mrs Maria Garcia" />
          </div>
          <div>
            <label className="emis-label">
              Phone
              {contact.patientName && !contact.patientPhone && (
                <span className="ml-1 text-[10px] text-amber-600 font-normal">&larr; enter your number</span>
              )}
            </label>
            <input
              className={`emis-input ${contact.patientName && !contact.patientPhone ? 'border-amber-400 bg-amber-50' : ''}`}
              type="tel"
              required
              value={contact.patientPhone}
              onChange={e => updateContact('patientPhone', e.target.value)}
              placeholder="+44 your number here"
            />
            {contact.patientName && !contact.patientPhone && (
              <p className="text-[10px] text-amber-600 mt-1">Step 2 &mdash; Enter your phone number so the SMS notification reaches you</p>
            )}
          </div>
          <div>
            <label className="emis-label">Email</label>
            <input className="emis-input" type="email" value={contact.patientEmail} onChange={e => updateContact('patientEmail', e.target.value)} placeholder="maria.garcia@email.com" />
          </div>
          <div>
            <label className="emis-label">Language</label>
            <select className="emis-input" value={contact.patientLanguage} onChange={e => updateContact('patientLanguage', e.target.value)}>
              <option value="en">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Polish">Polish</option>
              <option value="Urdu">Urdu</option>
              <option value="Bengali">Bengali</option>
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Somali">Somali</option>
              <option value="Romanian">Romanian</option>
              <option value="Turkish">Turkish</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Punjabi">Punjabi</option>
              <option value="Chinese">Chinese</option>
            </select>
            <p className="text-[10px] text-blue-200 mt-1">Try changing this — the care summary and email are translated into any language, similar to S5&apos;s multi-language content.</p>
          </div>
        </div>
      </div>

      {/* ── Section B: Transcript ──────────────── */}
      <div className="emis-section">
        <div className="emis-section-header">Consultation Transcript</div>
        <p className="text-xs text-gray-500 mb-2">In production, the consultation is recorded and transcribed in real time using Deepgram. For this demo, a real transcript has been pre-filled above.</p>
        <TranscriptRecorder
          transcript={transcript}
          onTranscriptChange={setTranscript}
        />
        <div className="mt-3">
          {transcript.trim() && !extracted && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mb-2">
              Step 3 &mdash; Click below to have Claude extract structured clinical data (diagnosis, ICD-10 codes, medications, plan) from the transcript.
            </p>
          )}
          <button
            type="button"
            onClick={processTranscript}
            disabled={extracting || !transcript.trim()}
            className="w-full py-3 px-4 bg-[#005eb8] hover:bg-[#003d78] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {extracting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Extracting clinical data from transcript...
              </>
            ) : extracted ? (
              'Re-process Transcript'
            ) : (
              'Process Transcript'
            )}
          </button>
        </div>
      </div>

      {/* ── Section C: Extracted Data ─────────── */}
      {editableExtracted && (
        <div className="animate-fade-in">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2">
              Step 4 &mdash; Claude extracted all of this from the transcript. The GP reviews and can edit anything before saving.
              The ICD-10 codes determine which educational videos from S5&apos;s library are matched to this patient.
              When ready, click <strong>&ldquo;Save &amp; Match Content&rdquo;</strong> at the bottom.
            </p>
          </div>
          {/* Diagnosis */}
          <div className="emis-section">
            <div className="emis-section-header">Extracted Diagnosis</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="emis-label">Diagnosis</label>
                <input
                  className="emis-input"
                  value={editableExtracted.diagnosis}
                  onChange={e => updateExtracted('diagnosis', e.target.value)}
                />
              </div>
              <div>
                <label className="emis-label">ICD-10 Codes</label>
                <input
                  className="emis-input font-mono"
                  value={editableExtracted.icd10Codes.join(', ')}
                  onChange={e => updateExtracted('icd10Codes', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Auto-extracted from transcript. Edit if needed — ICD-10 codes determine which content is matched.</p>
          </div>

          {/* Medications */}
          <div className="emis-section">
            <div className="emis-section-header">Medications</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="emis-label">Prescribed</label>
                <input
                  className="emis-input"
                  value={editableExtracted.medications.join(', ')}
                  onChange={e => updateExtracted('medications', e.target.value.split(',').map(m => m.trim()).filter(Boolean))}
                />
              </div>
              <div>
                <label className="emis-label">Instructions</label>
                <input
                  className="emis-input"
                  value={editableExtracted.medicationInstructions}
                  onChange={e => updateExtracted('medicationInstructions', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Plan */}
          <div className="emis-section">
            <div className="emis-section-header">Management Plan</div>
            <textarea
              className="emis-input w-full text-sm resize-none"
              rows={3}
              value={editableExtracted.plan}
              onChange={e => updateExtracted('plan', e.target.value)}
            />
          </div>

          {/* Follow-up */}
          <div className="emis-section">
            <div className="emis-section-header">Follow-up</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="emis-label">Review Date</label>
                <input
                  className="emis-input"
                  type="date"
                  value={editableExtracted.followUpDate || ''}
                  onChange={e => updateExtracted('followUpDate', e.target.value || null)}
                />
              </div>
              <div>
                <label className="emis-label">Instructions</label>
                <input
                  className="emis-input"
                  value={editableExtracted.followUpInstructions}
                  onChange={e => updateExtracted('followUpInstructions', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Safety Netting */}
          <div className="emis-section">
            <div className="emis-section-header">Safety Netting</div>
            <textarea
              className="emis-input w-full text-sm resize-none"
              rows={2}
              value={editableExtracted.safetyNetting}
              onChange={e => updateExtracted('safetyNetting', e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="pt-4 pb-4 px-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#007f3b] hover:bg-[#005a2b] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving & Matching Content...
                </>
              ) : (
                'Save & Match Content'
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
