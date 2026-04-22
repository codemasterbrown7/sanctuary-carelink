// ElevenLabs Conversational AI configuration
// The actual agent is configured in the ElevenLabs dashboard.
// This module provides helper functions for the integration.

export const ELEVENLABS_CONFIG = {
  agentId: process.env.ELEVENLABS_AGENT_ID || '',
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  // The server URL that ElevenLabs calls to get dynamic context
  serverUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice-context`,
};

// Generate a signed URL for the ElevenLabs Conversational AI widget (if using web embed)
export function getConversationUrl(consultationId: string): string {
  const baseUrl = 'https://elevenlabs.io/convai';
  const params = new URLSearchParams({
    agent_id: ELEVENLABS_CONFIG.agentId,
    // Custom data passed to the agent's system prompt via server URL
    consultation_id: consultationId,
  });
  return `${baseUrl}?${params.toString()}`;
}
