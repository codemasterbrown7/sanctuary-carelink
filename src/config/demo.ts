export const demoConfig = {
  // Set to 0 for live demo (immediate), 7200000 for production (2 hours)
  deliveryDelayMs: 0,
  // Show the production timeline in UI even when sending immediately
  showProductionTimeline: true,
  // Base URL for patient-facing pages (set to Vercel URL in production)
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  // Twilio callback number (displayed to patients)
  callbackNumber: process.env.NEXT_PUBLIC_CALLBACK_NUMBER || '+1234567890',
};
