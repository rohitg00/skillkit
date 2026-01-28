import { AgentSkill } from "../types";

export async function generateAgentSkill(topic: string): Promise<AgentSkill> {
  const sanitizedTopic = topic?.trim().slice(0, 500) || '';
  if (!sanitizedTopic) {
    throw new Error("Topic is required");
  }

  const response = await fetch('/api/generate-skill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: sanitizedTopic }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to generate skill');
  }

  return response.json();
}

export const generateLearningPath: (topic: string) => Promise<AgentSkill> = generateAgentSkill;
