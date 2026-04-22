'use client';

import { useState } from 'react';
import ConsultationForm from '@/components/ConsultationForm';

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#003087] text-white">
          <div>
            <h2 className="text-lg font-semibold">New Consultation</h2>
            <p className="text-xs text-blue-200 mt-0.5">EMIS Web — Clinical Record Entry</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-blue-200 hover:text-white font-medium"
          >
            {showForm ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {showForm && <ConsultationForm />}
      </div>
    </div>
  );
}
