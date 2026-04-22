import type { HealthVideo } from './mock-api/types';

// Real YouTube health education videos from reputable channels
// All video IDs verified live as of 2026-04-22
export const HEALTH_VIDEOS: HealthVideo[] = [
  // =============================================
  // TYPE 2 DIABETES (E11)
  // =============================================
  {
    id: 'vid-diabetes-overview',
    title: 'What Is Type 2 Diabetes? | 2 Minute Guide',
    url: 'https://www.youtube.com/watch?v=4SZGM_E5cLI',
    youtubeId: '4SZGM_E5cLI',
    channel: 'Diabetes UK',
    durationMinutes: 2,
    description: 'Short animated explainer from Diabetes UK covering the basics of what Type 2 Diabetes is, how it develops, and why it matters.',
    topic: 'overview',
    icd10: ['E11', 'E11.9', 'E10'],
  },
  {
    id: 'vid-diabetes-overview-2',
    title: 'Understanding Type 2 Diabetes',
    url: 'https://www.youtube.com/watch?v=oDOVXww7sSE',
    youtubeId: 'oDOVXww7sSE',
    channel: 'British Heart Foundation',
    durationMinutes: 3,
    description: 'British Heart Foundation animation explaining how Type 2 Diabetes affects the body, including insulin resistance and long-term health risks.',
    topic: 'overview',
    icd10: ['E11', 'E11.9'],
  },
  {
    id: 'vid-metformin-guide',
    title: 'How Do Drugs Work: Insulin and Metformin',
    url: 'https://www.youtube.com/watch?v=rF7LfWuXH80',
    youtubeId: 'rF7LfWuXH80',
    channel: 'British Pharmacological Society',
    durationMinutes: 5,
    description: 'Expert explanation on how insulin and metformin work to control blood sugar levels in diabetes.',
    topic: 'medication',
    icd10: ['E11', 'E11.9', 'E11.65'],
  },
  {
    id: 'vid-metformin-side-effects',
    title: 'Metformin for Diabetes: Doses, Side Effects & More',
    url: 'https://www.youtube.com/watch?v=4AmiqM6iy8A',
    youtubeId: '4AmiqM6iy8A',
    channel: 'Doctor O\'Donovan',
    durationMinutes: 8,
    description: 'A doctor explains metformin dosing, common side effects (GI issues, vitamin B12 deficiency), and practical tips for managing them.',
    topic: 'sideEffects',
    icd10: ['E11', 'E11.9'],
  },
  {
    id: 'vid-diabetes-diet',
    title: 'Type 2 Diabetes: Nutrition Basics',
    url: 'https://www.youtube.com/watch?v=HJ9z249j46c',
    youtubeId: 'HJ9z249j46c',
    channel: 'Interior Health',
    durationMinutes: 6,
    description: 'Overview of how food affects blood sugar, covering carbohydrates, portion sizes, and building a balanced meal plan for diabetes management.',
    topic: 'lifestyle',
    icd10: ['E11', 'E11.9'],
  },
  {
    id: 'vid-blood-sugar-monitoring',
    title: 'How to Measure Your Blood Sugar',
    url: 'https://www.youtube.com/watch?v=nxIJeHWlhF4',
    youtubeId: 'nxIJeHWlhF4',
    channel: 'Mayo Clinic',
    durationMinutes: 3,
    description: 'Step-by-step guide to home blood glucose monitoring including equipment and finger-prick technique.',
    topic: 'lifestyle',
    icd10: ['E11', 'E11.9', 'E11.65'],
  },
  {
    id: 'vid-diabetes-symptoms',
    title: 'Symptoms of Type 2 Diabetes',
    url: 'https://www.youtube.com/watch?v=BP99t8DaXVU',
    youtubeId: 'BP99t8DaXVU',
    channel: 'NHS inform',
    durationMinutes: 2,
    description: 'NHS Scotland video explaining the key signs and symptoms of Type 2 Diabetes to watch out for.',
    topic: 'symptoms',
    icd10: ['E11', 'E11.9'],
  },
  {
    id: 'vid-diabetes-living',
    title: 'Living with Type 2 Diabetes | Emma\'s Year Vlog',
    url: 'https://www.youtube.com/watch?v=jaXIMxMUXMo',
    youtubeId: 'jaXIMxMUXMo',
    channel: 'Diabetes UK',
    durationMinutes: 5,
    description: 'A personal vlog following Emma over a year as she navigates life with Type 2 Diabetes — real challenges, diet, activity, and emotional wellbeing.',
    topic: 'support',
    icd10: ['E11', 'E11.9'],
  },

  // =============================================
  // HYPERTENSION (I10)
  // =============================================
  {
    id: 'vid-bp-overview',
    title: 'How Blood Pressure Works',
    url: 'https://www.youtube.com/watch?v=Ab9OZsDECZw',
    youtubeId: 'Ab9OZsDECZw',
    channel: 'TED-Ed',
    durationMinutes: 4,
    description: 'TED-Ed animated explainer on what blood pressure is, how it works, and why it matters for your health.',
    topic: 'overview',
    icd10: ['I10', 'I11'],
  },
  {
    id: 'vid-bp-understanding',
    title: 'Understanding Blood Pressure',
    url: 'https://www.youtube.com/watch?v=4YNdp3pRjig',
    youtubeId: '4YNdp3pRjig',
    channel: 'British Heart Foundation',
    durationMinutes: 3,
    description: 'Animated explainer covering what systolic and diastolic numbers mean, what different blood pressure ranges indicate, and consequences of sustained high BP.',
    topic: 'diagnosis',
    icd10: ['I10', 'I11'],
  },
  {
    id: 'vid-bp-medication',
    title: 'High Blood Pressure: How to Lower It',
    url: 'https://www.youtube.com/watch?v=jbzFZoRFa1s',
    youtubeId: 'jbzFZoRFa1s',
    channel: 'British Heart Foundation',
    durationMinutes: 5,
    description: 'Expert-led Q&A covering blood pressure medications, treatment options, and how to lower high blood pressure.',
    topic: 'medication',
    icd10: ['I10', 'I11'],
  },
  {
    id: 'vid-bp-lifestyle',
    title: 'Natural Ways to Lower Blood Pressure',
    url: 'https://www.youtube.com/watch?v=cqLZhO06yeE',
    youtubeId: 'cqLZhO06yeE',
    channel: 'Cleveland Clinic',
    durationMinutes: 4,
    description: 'Cleveland Clinic cardiologist answers questions about natural and lifestyle approaches to lowering blood pressure, including diet, exercise, and salt reduction.',
    topic: 'lifestyle',
    icd10: ['I10'],
  },
  {
    id: 'vid-bp-home-monitoring',
    title: 'How to Measure Your Own Blood Pressure',
    url: 'https://www.youtube.com/watch?v=GSNZVaW1Wg4',
    youtubeId: 'GSNZVaW1Wg4',
    channel: 'British Heart Foundation',
    durationMinutes: 3,
    description: 'Step-by-step guide to measuring your blood pressure at home, covering equipment, technique, and getting an accurate reading.',
    topic: 'lifestyle',
    icd10: ['I10'],
  },

  // =============================================
  // ANXIETY (F41)
  // =============================================
  {
    id: 'vid-anxiety-overview',
    title: 'What is Anxiety? | Hear from the Experts',
    url: 'https://www.youtube.com/watch?v=WQak9vWiZT4',
    youtubeId: 'WQak9vWiZT4',
    channel: 'Maudsley NHS',
    durationMinutes: 4,
    description: 'NHS Maudsley experts explain what anxiety is, how it affects the brain and body, and the difference between normal worry and anxiety disorders.',
    topic: 'overview',
    icd10: ['F41', 'F41.1', 'F41.0'],
  },
  {
    id: 'vid-anxiety-breathing',
    title: 'Breathing Exercises for Stress and Anxiety',
    url: 'https://www.youtube.com/watch?v=DbDoBzGY3vo',
    youtubeId: 'DbDoBzGY3vo',
    channel: 'NHS',
    durationMinutes: 5,
    description: 'Guided breathing exercise for managing stress and anxiety, with meditation techniques.',
    topic: 'lifestyle',
    icd10: ['F41', 'F41.1', 'F41.0'],
  },
  {
    id: 'vid-anxiety-ssris',
    title: 'SSRIs: How They Can Help Depression & Anxiety',
    url: 'https://www.youtube.com/watch?v=9Zwo3GhqaBs',
    youtubeId: '9Zwo3GhqaBs',
    channel: 'Stanford Center for Health Education',
    durationMinutes: 7,
    description: 'Stanford psychiatrist explains how SSRIs work, their use in treating depression and anxiety, side effects, and what to expect.',
    topic: 'medication',
    icd10: ['F41', 'F41.1', 'F32'],
  },
  {
    id: 'vid-anxiety-support',
    title: 'Treatment for Depression and Anxiety | NHS Talking Therapies',
    url: 'https://www.youtube.com/watch?v=jLgv0E1k6hs',
    youtubeId: 'jLgv0E1k6hs',
    channel: 'NHS',
    durationMinutes: 3,
    description: 'Official NHS video explaining Talking Therapies — how to self-refer, what treatment involves, and types of psychological therapy available.',
    topic: 'support',
    icd10: ['F41', 'F41.1', 'F32'],
  },
  {
    id: 'vid-anxiety-coping',
    title: 'How to Cope with Anxiety',
    url: 'https://www.youtube.com/watch?v=WWloIAQpMcQ',
    youtubeId: 'WWloIAQpMcQ',
    channel: 'TEDx',
    durationMinutes: 15,
    description: 'Olivia Remes from Cambridge University shares practical self-help strategies for coping with anxiety.',
    topic: 'lifestyle',
    icd10: ['F41', 'F41.1'],
  },
];

// Match videos by ICD-10 codes (like Sanctuary's content matching)
export function matchVideos(icd10Codes: string[]): HealthVideo[] {
  return HEALTH_VIDEOS.filter(video =>
    video.icd10.some(code =>
      icd10Codes.some(queryCode =>
        code.startsWith(queryCode) || queryCode.startsWith(code)
      )
    )
  );
}

// Get YouTube thumbnail URL
export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

// Group videos by topic
export function groupVideosByTopic(videos: HealthVideo[]): Record<string, HealthVideo[]> {
  const grouped: Record<string, HealthVideo[]> = {};
  for (const video of videos) {
    if (!grouped[video.topic]) grouped[video.topic] = [];
    grouped[video.topic].push(video);
  }
  return grouped;
}
