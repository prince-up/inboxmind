import type { AIPrompt } from '../models/AIRequest';
import type { PromptConversationContext } from './SummaryPrompt';

export const buildActionPrompt = (
  context: PromptConversationContext,
): AIPrompt => ({
  messages: [
    {
      content:
        'You are InboxMind AI. Detect practical email actions and return valid JSON only. Do not perform actions. Do not use markdown.',
      role: 'system',
    },
    {
      content: JSON.stringify({
        conversation: context,
        outputSchema: {
          actions: [
            {
              confidence: 'number from 0 to 1',
              description: 'action rationale',
              dueDate: 'YYYY-MM-DD or null',
              risk: 'low | medium | high',
              title: 'short action title',
              type: 'reply | calendar | follow_up | schedule_reminder | forward | archive | star',
            },
          ],
          confidence: 'number from 0 to 1',
        },
        task: 'actions',
      }),
      role: 'user',
    },
  ],
  responseFormat: 'json_object',
  task: 'actions',
});
