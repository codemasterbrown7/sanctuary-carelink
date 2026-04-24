'use client';

import { useState } from 'react';

interface GuideCardProps {
  step?: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'info' | 'action' | 'context';
}

export default function GuideCard({ step, title, children, defaultOpen = true, variant = 'info' }: GuideCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    action: 'bg-amber-50 border-amber-200 text-amber-900',
    context: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  const stepStyles = {
    info: 'bg-blue-600 text-white',
    action: 'bg-amber-600 text-white',
    context: 'bg-gray-500 text-white',
  };

  return (
    <div className={`border p-4 mb-4 ${styles[variant]}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left"
      >
        {step && (
          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${stepStyles[variant]}`}>
            {step}
          </span>
        )}
        <span className="text-sm font-semibold flex-1">{title}</span>
        <span className="text-xs opacity-60">{open ? 'hide' : 'show'}</span>
      </button>
      {open && (
        <div className="mt-3 text-sm leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
