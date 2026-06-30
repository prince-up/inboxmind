import type { AIPrompt } from '../models/AIRequest';

export interface PromptEmailContext {
  readonly attachments: readonly string[];
  readonly body: string;
  readonly date: string | null;
  readonly from: string;
  readonly subject: string;
  readonly to: readonly string[];
}

export interface PromptConversationContext {
  readonly conversationId: string;
  readonly emails: readonly PromptEmailContext[];
  readonly subject: string;
  readonly url: string;
}

export const buildSummaryPrompt = (
  context: PromptConversationContext,
): AIPrompt => ({
  messages: [
    {
      content:
        'You are InboxMind AI. Analyze the email conversation and return valid JSON only. Do not use markdown. Dates must use YYYY-MM-DD or null.',
      role: 'system',
    },
    {
      content: JSON.stringify({
        conversation: context,
        outputSchema: {
          confidence: 'number from 0 to 1',
          deadline: 'YYYY-MM-DD or null',
          followUpDate: 'YYYY-MM-DD or null',
          priority: 'low | medium | high',
          summary: 'concise factual summary',
        },
        task: 'summary',
      }),
      role: 'user',
    },
  ],
  responseFormat: 'json_object',
  task: 'summary',
});
