import type { AIPrompt } from '../models/AIRequest';
import type { PromptConversationContext } from './SummaryPrompt';

export const buildMetadataPrompt = (
  context: PromptConversationContext,
): AIPrompt => ({
  messages: [
    {
      content:
        'You are InboxMind AI. Extract metadata from the email conversation and return valid JSON only. Do not use markdown.',
      role: 'system',
    },
    {
      content: JSON.stringify({
        conversation: context,
        outputSchema: {
          confidence: 'number from 0 to 1',
          entities: [
            {
              name: 'entity text',
              type: 'person | company | product | date | money | location',
            },
          ],
          language: 'BCP 47 language code',
          risk: 'low | medium | high',
          sentiment: 'negative | neutral | positive',
        },
        task: 'metadata',
      }),
      role: 'user',
    },
  ],
  responseFormat: 'json_object',
  task: 'metadata',
});
