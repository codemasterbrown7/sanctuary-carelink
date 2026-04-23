'use client';

import type { HealthVideo } from '@/lib/mock-api/types';
import { getYouTubeThumbnail } from '@/lib/videos';

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

interface ContentCardProps {
  video: HealthVideo;
  index: number;
  compact?: boolean;
}

export default function ContentCard({ video, index, compact }: ContentCardProps) {
  const topicLabel = TOPIC_LABELS[video.topic] || video.topic;

  if (compact) {
    return (
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-3 p-3 bg-card border border-border hover:border-primary/30 transition-colors"
      >
        <img
          src={getYouTubeThumbnail(video.youtubeId)}
          alt={video.title}
          className="w-20 h-14 object-cover shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
          <p className="text-xs text-muted mt-0.5">{video.channel} · {video.durationMinutes} min</p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
    >
      <div className="relative">
        <img
          src={getYouTubeThumbnail(video.youtubeId)}
          alt={video.title}
          className="w-full h-36 object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5">
          {video.durationMinutes} min
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">{topicLabel}</span>
          <span className="text-xs text-muted font-mono">{video.icd10.join(', ')}</span>
        </div>
        <h4 className="text-sm font-semibold text-foreground">{video.title}</h4>
        <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">{video.description}</p>
        <p className="mt-2 text-xs text-muted">{video.channel}</p>
      </div>
    </a>
  );
}
