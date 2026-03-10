import type { ChatMessage } from '../../ai/providers/types.js';

export function rubricGraderPrompt(prompt: string, output: string, rubric: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are grading the output of an AI agent that was given a skill instruction. ' +
        'Evaluate how well the agent followed the skill by comparing its output against the provided rubric. ' +
        'Be strict but fair. Output ONLY a JSON object, no additional text.',
    },
    {
      role: 'user',
      content: `Grade the following agent output against the rubric.

Prompt given to the agent:
---
${prompt}
---

Agent output:
---
${output}
---

Grading rubric:
---
${rubric}
---

Respond with ONLY a JSON object in this exact format:
{ "passed": true|false, "reasoning": "1-3 sentence explanation of your grading decision", "score": 0-100 }`,
    },
  ];
}
