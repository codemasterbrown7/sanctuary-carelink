# Sanctuary Careflow

A working demo showing how S5's educational content library could be delivered directly to patients after GP consultations — matched to their diagnosis, translated into their language, and accessible through a voice agent they can call with questions.

**Live demo:** [sanctuary-health-careflow-s5-demo.vercel.app](https://sanctuary-health-careflow-s5-demo.vercel.app)

---

## What it does

A GP has a consultation. The conversation is transcribed (via Deepgram in production, or pasted in for the demo). From there, Careflow takes over:

1. Claude reads the transcript and pulls out the diagnosis, ICD-10 codes, medications, plan, follow-up, safety netting
2. The ICD-10 codes are used to match relevant educational videos from S5's library
3. Claude generates a care summary in plain English (or whatever language the patient speaks)
4. The patient gets an SMS, a full HTML email, and a phone number for a voice agent that knows their entire consultation

The voice agent bit is probably the most interesting part technically. When the patient calls, ElevenLabs fires a webhook to our API *before* the conversation starts. We look up the patient by phone number, load the full consultation context — diagnosis, meds, transcript, everything — and inject it as the system prompt. So the agent greets them by name, in their language, from the first word. No "let me look that up" delays.

---

## Why I built it

I was looking into what happens after a GP consultation and the stats are bad:

- 40-80% of what a doctor tells a patient is forgotten immediately, and almost half of what they *do* remember is wrong (Kessels, 2003)
- 3 in 10 patients with limited English have difficulty understanding what their doctor told them to do (KFF Survey)

S5 already has a library of clinically verified educational content, all tagged with ICD-10 codes. It's sitting there. Careflow is basically a pipeline to get that content to the patients who actually need it, at the right time, in their language.

It also saves GPs time — the care summary, safety netting, follow-up instructions are all generated from the transcript. The GP reviews and clicks send instead of writing it all up manually.

---

## How I built it

### Research

I kicked off about 23 parallel research threads using Claude sub-agents. Each one was investigating a different angle — patient recall literature, NHS digital health workflows, voice AI in healthcare, content delivery, that kind of thing. I told each agent to follow rabbit holes rather than just surface-level research, and if they found something interesting, to spawn another thread to go deeper.

Once all of that came back, I went through the results and decided to build a post-consultation care delivery system — it seemed like the most useful thing I could demo.

### Digging into S5

I went through Sanctuary Health's S5 platform and noticed that every video was tagged with ICD-10 codes. So if I could extract ICD-10 codes from a consultation transcript, I could automatically match the right videos to each patient. The matching uses the same logic as S5's GraphQL API (`icd10: { contains: [...] }`) with bidirectional prefix matching.

I don't have access to the actual S5 API, so the demo pulls YouTube videos tagged with the same codes. Swapping in real Sanctuary content would be a single API call change.

### The build

Built the whole thing in one session. A few things worth noting:

- The form is transcript-first — the GP doesn't fill in diagnosis fields manually. They enter the patient's contact details, the transcript comes from Deepgram, and Claude extracts everything else. The GP just reviews and corrects if needed.
- I used real consultation transcripts from published research datasets (ACI-Bench and PriMock57) instead of writing fake ones.
- Phone numbers get normalised to E.164 on save and on lookup. Learned this the hard way when someone entered `07xxx` in the form but ElevenLabs sent `+44xxx` as the caller ID and the voice agent couldn't find them.
- Translation isn't a hardcoded language list. One Claude API call translates the entire email — every heading, label, patient data — into whatever language the patient has set. Works for any language.

### Testing

Ran through the full pipeline end-to-end with each demo scenario (diabetes, hypertension, anxiety) — form submission through to receiving the SMS, opening the email, and calling the voice agent. Tested on mobile and desktop. Broke the phone matching, fixed it, broke it again with a different format, then added proper normalisation.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16, TypeScript, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| AI | Claude (Anthropic) — extraction, summarisation, translation |
| Transcription | Deepgram |
| SMS | Twilio |
| Email | Resend |
| Voice | ElevenLabs Conversational AI |
| Hosting | Vercel |

---

## How it fits together

```
Clinician enters patient details + transcript
  |
  v
POST /api/extract-consultation
Claude extracts diagnosis, ICD-10 codes, meds, plan, safety netting
  |
  v
POST /api/consultations
Saves to Supabase, matches S5 content via ICD-10
  |
  v
POST /api/generate-summary
Claude writes a care summary in the patient's language
  |
  v
POST /api/send-notification
SMS via Twilio, HTML email via Resend (translated if needed)
  |
  v
Patient gets: SMS with link, email with everything, voice agent number
  |
  v
POST /api/voice-context (ElevenLabs webhook, fires before call starts)
Looks up patient by phone, injects full consultation as system prompt
```

---

## Project structure

```
src/
  app/
    dashboard/              Clinician form
    consultation/[id]/      Consultation detail + care pipeline
    patient/[id]/           What the patient sees
    api/
      extract-consultation/ Claude transcript extraction
      consultations/        CRUD
      generate-summary/     Claude care summary
      send-notification/    Twilio + Resend
      voice-context/        ElevenLabs pre-call webhook
      transcribe/           Deepgram
      match-content/        ICD-10 matching
  lib/
    claude.ts               All Claude API calls
    content-matcher.ts      ICD-10 prefix matching
    videos.ts               Video library with ICD-10 tags
    email.ts                HTML email builder
    twilio.ts               SMS
    phone.ts                Phone normalisation
    store.ts                Supabase layer
    demo-transcripts.ts     Real transcripts from ACI-Bench + PriMock57
```

---

## Data sources

- **Transcripts:** [ACI-Bench](https://huggingface.co/datasets/mkieffer/ACI-Bench) (207 clinical dialogues, Nature Scientific Data, 2023) and [PriMock57](https://github.com/babylonhealth/PriMock57) (57 mock primary care consultations by Babylon Health clinicians)
- **Research:** Kessels 2003 (JRSM), Watson & McKinstry 2009 (JRSM), KFF Survey, Divi et al. 2007, Karliner et al. (Annals of Internal Medicine)

---

## Running locally

```bash
git clone https://github.com/codemasterbrown7/sanctuary-carelink.git
cd sanctuary-carelink
npm install
cp .env.example .env.local  # fill in your API keys
npm run dev
```

See `.env.example` for the required env vars.
