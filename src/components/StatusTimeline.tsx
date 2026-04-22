'use client';

interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  detail?: string;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export default function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full mt-1 ${
              step.status === 'completed' ? 'bg-success' :
              step.status === 'current' ? 'bg-primary animate-pulse-dot' :
              'bg-border'
            }`} />
            {i < steps.length - 1 && (
              <div className={`w-0.5 h-8 ${
                step.status === 'completed' ? 'bg-success/30' : 'bg-border'
              }`} />
            )}
          </div>
          <div className="pb-6">
            <p className={`text-sm font-medium ${
              step.status === 'completed' ? 'text-success' :
              step.status === 'current' ? 'text-primary' :
              'text-muted'
            }`}>
              {step.label}
            </p>
            {step.detail && (
              <p className="text-xs text-muted mt-0.5">{step.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
