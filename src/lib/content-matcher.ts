import type { HealthVideo, ContentTopic } from './mock-api/types';
import { matchVideos, groupVideosByTopic } from './videos';

export interface MatchInput {
  icd10Codes: string[];
  medications: string[];
  topics?: ContentTopic[];
}

export interface MatchResult {
  videos: HealthVideo[];
  groupedByTopic: Record<string, HealthVideo[]>;
  metadata: {
    totalMatched: number;
    icd10CodesUsed: string[];
    topicsIncluded: string[];
  };
}

const DEFAULT_TOPIC_PRIORITY: ContentTopic[] = [
  'overview',
  'medication',
  'lifestyle',
  'symptoms',
  'risks',
  'sideEffects',
  'support',
  'causes',
  'diagnosis',
];

export function matchContent(input: MatchInput): MatchResult {
  const videos = matchVideos(input.icd10Codes);

  const hasMedications = input.medications.length > 0;

  const sortedVideos = [...videos].sort((a, b) => {
    if (hasMedications) {
      const medTopics: ContentTopic[] = ['medication', 'sideEffects'];
      const aIsMed = medTopics.includes(a.topic);
      const bIsMed = medTopics.includes(b.topic);
      if (aIsMed && !bIsMed) return -1;
      if (!aIsMed && bIsMed) return 1;
    }

    const aPriority = DEFAULT_TOPIC_PRIORITY.indexOf(a.topic);
    const bPriority = DEFAULT_TOPIC_PRIORITY.indexOf(b.topic);
    return aPriority - bPriority;
  });

  const grouped = groupVideosByTopic(sortedVideos);
  const topicsIncluded = Object.keys(grouped);

  return {
    videos: sortedVideos,
    groupedByTopic: grouped,
    metadata: {
      totalMatched: sortedVideos.length,
      icd10CodesUsed: input.icd10Codes,
      topicsIncluded,
    },
  };
}
