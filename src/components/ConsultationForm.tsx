'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ExtractedConsultation } from '@/lib/claude';

// ── Demo fill button ─────────────────────────────────────────
function DemoFill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Auto-fill for demo"
      className="ml-2 px-1.5 py-0.5 text-[10px] text-gray-400 hover:text-[#005eb8] hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
          >
            <span className="w-2 h-2 rounded-sm bg-white" />
            Stop Recording ({formatTime(recordingTime)})
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
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

// ── Demo data ────────────────────────────────────────────────
const DEMO_CONTACT = {
  patientName: 'Mrs Maria Garcia',
  patientPhone: '+447983665987',
  patientEmail: 'lucas@tfest.ai',
  patientLanguage: 'Spanish',
};

const DEMO_TRANSCRIPT = `Doctor: Good morning Mrs Garcia, how are you feeling today?
Patient: I've been getting quite thirsty lately and going to the toilet a lot more than usual.
Doctor: I see, and when did you first notice these symptoms?
Patient: About three weeks ago. I've also been feeling very tired, even after a full night's sleep.
Doctor: Have you noticed any changes in your weight or vision?
Patient: Now you mention it, my vision has been a bit blurry sometimes. I haven't weighed myself though.
Doctor: Right. Your blood tests have come back and your HbA1c is elevated at 58 millimoles per mol. This confirms a diagnosis of Type 2 diabetes.
Patient: Oh. I was worried about that. My mother had it as well.
Doctor: Yes, family history is a significant risk factor. The good news is that Type 2 diabetes is very manageable, especially when caught early like this.
Patient: What do I need to do?
Doctor: I'm going to start you on a medication called Metformin — 500 milligrams, one tablet twice a day, taken with meals. This helps your body use insulin more effectively.
Patient: Are there any side effects I should know about?
Doctor: Some people experience stomach upset initially — things like nausea or loose stools. Taking it with food usually helps. If you get persistent diarrhoea or stomach cramps, let us know and we can adjust the dose or try a slow-release version.
Patient: OK, I can manage that.
Doctor: I'd also like to talk about some lifestyle changes. A balanced diet with fewer refined carbs, regular physical activity — even 30 minutes of brisk walking most days — and keeping an eye on your weight can make a real difference.
Patient: I've been meaning to walk more anyway.
Doctor: That's great. We'll also teach you how to monitor your blood glucose at home. The nurse will go through that with you. And I'm referring you to our diabetes education programme — it's very helpful for people newly diagnosed.
Patient: When should I come back?
Doctor: I'd like to see you again in three months. We'll repeat the HbA1c to see how the Metformin is working. In the meantime, if you experience persistent vomiting, confusion, or any difficulty breathing, please seek urgent medical help immediately.
Patient: Three months, got it. Thank you, Doctor.
Doctor: You're welcome, Mrs Garcia. You're not alone in this — we'll support you every step of the way.`;

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
      {/* ── Section A: Patient Contact ──────────── */}
      <div className="emis-banner">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-blue-200">Patient Contact Details</span>
          <DemoFill onClick={() => setContact(DEMO_CONTACT)} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="emis-label">Patient Name</label>
            <input className="emis-input" required value={contact.patientName} onChange={e => updateContact('patientName', e.target.value)} placeholder="Mrs Maria Garcia" />
          </div>
          <div>
            <label className="emis-label">Phone</label>
            <input className="emis-input" type="tel" required value={contact.patientPhone} onChange={e => updateContact('patientPhone', e.target.value)} placeholder="07700 900 123" />
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
          </div>
        </div>
      </div>

      {/* ── Section B: Transcript ──────────────── */}
      <div className="emis-section">
        <div className="flex items-center">
          <div className="emis-section-header flex-1">Consultation Transcript</div>
          <DemoFill onClick={() => setTranscript(DEMO_TRANSCRIPT)} />
        </div>
        <TranscriptRecorder
          transcript={transcript}
          onTranscriptChange={setTranscript}
        />
        <div className="mt-3">
          <button
            type="button"
            onClick={processTranscript}
            disabled={extracting || !transcript.trim()}
            className="w-full py-3 px-4 bg-[#005eb8] hover:bg-[#003d78] text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              className="w-full py-3 px-4 bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
