// Sanctuary Health S5 GraphQL API — TypeScript Types
// Mirrors the real S5 schema from docs.sanctuaryhealth.io

export type ContentTopic =
  | 'overview'
  | 'risks'
  | 'sideEffects'
  | 'support'
  | 'lifestyle'
  | 'causes'
  | 'diagnosis'
  | 'medication'
  | 'symptoms';

export type Category =
  | 'condition_diabetes'
  | 'condition_cardiovascular'
  | 'condition_mentalHealth'
  | 'condition_anxiety'
  | 'condition_hypertension'
  | 'condition_depression'
  | 'condition_copd'
  | 'condition_asthma'
  | 'condition_obesity'
  | 'wellbeing_nutrition'
  | 'wellbeing_fitness'
  | 'wellbeing_mentalHealth'
  | 'wellbeing_sleep'
  | 'wellbeing_meditation';

// Accepts both ISO codes ("en", "es") and full names ("Spanish", "Bengali")
// Claude handles either format for translation
export type Language = string;

export type LanguageReviewLevel = 'clinicallyReviewed' | 'reviewed' | 'machineTranslated' | 'unreviewed';

export type PostMediaType = 'video' | 'audio' | 'article';

// Media types (union in GraphQL)
export interface VideoMedia {
  __typename: 'VideoMedia';
  id: string;
  url: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export interface AudioMedia {
  __typename: 'AudioMedia';
  id: string;
  url: string;
  durationSeconds: number;
}

export interface ArticleMedia {
  __typename: 'ArticleMedia';
  id: string;
  url: string;
}

export type Media = VideoMedia | AudioMedia | ArticleMedia;

// PostDetails — language-specific child of Post
export interface PostDetails {
  id: string;
  language: Language;
  languageReviewLevel: LanguageReviewLevel;
  title: string;
  description: string;
  keywords: string[];
  learningOutcome: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  postId: string;
}

// Post — language-invariant parent
export interface Post {
  id: string;
  universalTitle: string;
  contentValue: number;
  category: Category[];
  topic: ContentTopic[];
  icd10: string[];
  clinicallyVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  mediaType: PostMediaType;
  postDetailsList: PostDetails[];
  media: Media[];
}

// Course types
export interface CourseItem {
  id: string;
  order: number;
  contentType: 'post' | 'cardPack';
  contentId: string;
  post?: Post;
}

export interface CourseDetails {
  id: string;
  language: Language;
  languageReviewLevel: LanguageReviewLevel;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  courseId: string;
}

export interface Course {
  id: string;
  universalTitle: string;
  category: Category[];
  icd10: string[];
  clinicallyVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  courseDetailsList: CourseDetails[];
  courseItems: CourseItem[];
}

// Query filter types (mirrors S5 where inputs)
export interface PostWhere {
  icd10?: { contains?: string[] };
  category?: { in?: Category[] };
  topic?: { in?: ContentTopic[] };
  clinicallyVerified?: { eq?: boolean };
  mediaType?: { eq?: PostMediaType };
}

export interface CourseWhere {
  icd10?: { contains?: string[] };
  category?: { in?: Category[] };
  clinicallyVerified?: { eq?: boolean };
}

// =============================================
// SNOMED CT — NHS Primary Care coding
// =============================================

export interface SnomedCode {
  code: string;        // e.g. "44054006"
  term: string;        // e.g. "Type 2 diabetes mellitus"
  icd10: string[];     // Mapped ICD-10 codes: ["E11", "E11.9"]
}

// =============================================
// YouTube Health Content — Real videos
// =============================================

export interface HealthVideo {
  id: string;
  title: string;
  url: string;                // YouTube URL
  youtubeId: string;          // YouTube video ID for thumbnails
  channel: string;            // e.g. "Diabetes UK"
  durationMinutes: number;
  description: string;
  topic: ContentTopic;
  icd10: string[];            // Which conditions this video is relevant to
}

// =============================================
// Consultation — NHS GP style
// =============================================

export interface Consultation {
  id: string;
  // Patient demographics (NHS-style banner)
  patientName: string;
  patientDOB: string;
  patientNHSNumber: string;    // 3-3-4 format: "943 476 5919"
  patientSex: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  patientAddress: string;
  patientLanguage: Language;
  allergies: string;

  // Consultation header
  consultationType: 'Surgery consultation' | 'Telephone encounter' | 'Video consultation' | 'Home visit';
  clinician: string;
  practice: string;

  // Clinical record (EMIS Web style)
  history: string;              // History / Presenting Complaint (free text)
  examination: string;          // Examination findings (free text)
  observations: {               // Structured vitals
    bp?: string;                // e.g. "142/88"
    hr?: string;                // e.g. "76"
    temp?: string;              // e.g. "36.8"
    spo2?: string;              // e.g. "98"
    weight?: string;            // kg
    height?: string;            // cm
    bmi?: string;
  };

  // Diagnosis
  diagnosis: string;            // Plain language diagnosis
  icd10Codes: string[];         // ICD-10 codes for content matching

  // Plan
  clinicalNotes: string;        // Comment / clinical notes
  plan: string;                 // Management plan
  medications: string[];        // Prescriptions (dm+d names)
  medicationInstructions: string; // Dosage directions
  investigations: string;       // Tests requested
  referrals: string;            // Referrals made

  // Follow-up
  followUpDate: string | null;
  followUpInstructions: string;
  safetyNetting: string;        // Safety netting advice (NHS-specific)

  // Transcript
  transcript: string | null;    // Full consultation transcript with speaker labels

  // CareLink processing
  careSummary: string | null;
  matchedVideoIds: string[];
  status: 'created' | 'content_matched' | 'summary_generated' | 'notification_sent';
  createdAt: string;
  updatedAt: string;
}
