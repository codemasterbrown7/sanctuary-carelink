# Sanctuary Careflow

An AI-powered post-consultation care delivery system that shows how S5's educational content library could be delivered directly to patients, matched to their specific diagnosis, as part of the post-consultation workflow.

**Live demo:** [sanctuary-health-careflow-s5-demo.vercel.app](https://sanctuary-health-careflow-s5-demo.vercel.app)

---

## What it does

After a GP consultation is recorded and transcribed, Careflow:

1. **Extracts structured clinical data** from the transcript using Claude — diagnosis, ICD-10 codes, medications, care plan, follow-up, safety netting
2. **Matches educational content** from S5's video library using bidirectional ICD-10 prefix matching
3. **Generates a personalised care summary** written at an 8th-grade reading level, in the patient's language
4. **Delivers everything to the patient** via SMS (Twilio), email (Resend), and an AI voice agent (ElevenLabs) they can call with follow-up questions

The voice agent loads the full consultation context — diagnosis, medications, transcript, care plan — before the call even starts via ElevenLabs' Conversation Initiation Client Data webhook, so it greets the patient by name in their language from the first word.

---

## Why it matters

- **Patient recall:** 40-80% of medical information is forgotten immediately after a consultation. Almost half of what is remembered is incorrect. (Kessels, 2003, Journal of the Royal Society of Medicine)
- **Language barriers:** 3 in 10 patients with limited English proficiency report difficulty understanding their provider's instructions. (KFF Survey). LEP patients experience medical errors resulting in physical harm more frequently. (Divi et al., 2007)
- **GP workload:** The care summary, safety netting, and follow-up instructions are all generated from the transcript — the GP reviews instead of writes. Patients can call the voice agent with follow-up questions instead of calling the practice.

---

## How I built it

### Research phase

I started by spawning 23 parallel research threads using Claude sub-agents, each investigating a different angle — patient recall literature, NHS digital health initiatives, post-consultation workflows, voice AI in healthcare, content delivery mechanisms, and more. Each sub-agent was prompted to follow rabbit holes and spawn further research threads when they found something interesting.

From these threads, I identified the highest-impact demo concepts and landed on a post-consultation care delivery system that could integrate with S5's existing content library.

### S5 API research

I looked through Sanctuary Health's S5 platform and found that each educational video was tagged with ICD-10 codes. This meant I could build automatic content matching — extract ICD-10 codes from a consultation transcript, then match them to relevant educational videos using the same filtering logic as S5's GraphQL API (`icd10: { contains: [...] }`).

Since I don't have access to the actual S5 API, the demo uses YouTube videos tagged with the same ICD-10 codes. In production, this would be a single API call swap to pull real Sanctuary content.

### Building

The app was built in a single session. Key decisions:

- **Transcript-first design** — The form isn't a data entry screen. The GP enters patient contact details and the transcript (recorded via Deepgram or pasted). Everything else is extracted by Claude.
- **GP reviews, AI assists** — All extracted data is editable before saving. The clinician is always in control.
- **Real transcripts** — Demo scenarios use real consultation transcripts from published research datasets (ACI-Bench and PriMock57) rather than synthetic data.
- **Phone number normalisation** — All phone numbers are normalised to E.164 format on save and on lookup, so the voice agent matches regardless of how the number was entered (07xxx, +44xxx, etc).
- **Translation** — A single Claude API call translates the entire email into any language. Not a hardcoded list — any language the patient specifies.

### Verification

- End-to-end testing of the full pipeline: form submission, transcript extraction, content matching, summary generation, SMS delivery, email delivery, voice agent context loading
- Tested with multiple demo scenarios (Type 2 Diabetes, Hypertension, Generalised Anxiety Disorder) across different languages
- Verified phone normalisation handles all common UK formats
- Confirmed voice agent loads consultation context correctly via webhook
- Tested on mobile and desktop

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| AI | Claude (Anthropic) — extraction + summarisation + translation |
| Transcription | Deepgram |
| SMS | Twilio |
| Email | Resend |
| Voice agent | ElevenLabs Conversational AI |
| Deployment | Vercel |

---

## Architecture

```
Consultation Form (clinician view)
        |
        v
  POST /api/extract-consultation
  Claude extracts: diagnosis, ICD-10, meds, plan, safety netting
        |
        v
  POST /api/consultations
  Saves to Supabase, matches S5 content via ICD-10 codes
        |
        v
  POST /api/generate-summary
  Claude generates plain-language care summary
        |
        v
  POST /api/send-notification
  Twilio SMS + Resend email (translated if non-English)
        |
        v
  Patient receives: SMS link, HTML email, voice agent number
        |
        v
  POST /api/voice-context (ElevenLabs webhook)
  Loads full consultation context into voice agent system prompt
```

---

## Project structure

```
src/
  app/
    dashboard/          Clinician form view
    consultation/[id]/  Consultation detail + care pipeline
    patient/[id]/       Patient-facing care summary page
    api/
      extract-consultation/   Claude transcript extraction
      consultations/          CRUD operations
      generate-summary/       Claude care summary generation
      send-notification/      Twilio SMS + Resend email
      voice-context/          ElevenLabs webhook for voice agent
      transcribe/             Deepgram audio transcription
      match-content/          ICD-10 content matching
  lib/
    claude.ts           Claude API (extraction, summary, translation)
    content-matcher.ts  Bidirectional ICD-10 prefix matching
    videos.ts           Educational video library with ICD-10 tags
    email.ts            HTML email template builder
    twilio.ts           SMS delivery
    phone.ts            Phone number normalisation (E.164)
    store.ts            Supabase persistence layer
    elevenlabs.ts       Voice agent configuration
    demo-transcripts.ts Real consultation transcripts (ACI-Bench, PriMock57)
```

---

## Data sources

- **Consultation transcripts:** [ACI-Bench](https://huggingface.co/datasets/mkieffer/ACI-Bench) (207 clinical dialogues, Nature Scientific Data, 2023) and [PriMock57](https://github.com/babylonhealth/PriMock57) (57 mock primary care consultations by real Babylon Health clinicians)
- **Patient recall research:** Kessels, 2003, JRSM; Watson & McKinstry, 2009, JRSM
- **Language barrier research:** KFF Survey; Divi et al., 2007; Karliner et al., Annals of Internal Medicine

---

## Running locally

```bash
git clone https://github.com/codemasterbrown7/sanctuary-carelink.git
cd sanctuary-carelink
npm install
cp .env.example .env.local  # Fill in API keys
npm run dev
```

Required environment variables — see `.env.example` for the full list.
