import type { AIPrompt } from '../models/AIRequest';
import { BaseAdapter } from './BaseAdapter';

const OPENAI_CHAT_COMPLETIONS_URL =
  'https://api.openai.com/v1/chat/completions';

/**
 * Adapter for OpenAI chat-completions JSON generation.
 */
export class OpenAIAdapter extends BaseAdapter {
  /**
   * Generates a JSON text response from OpenAI.
   */
  public async generateJsonText({
    apiKey,
    model,
    prompt,
    timeoutMs,
  }: {
    readonly apiKey: string;
    readonly model: string;
    readonly prompt: AIPrompt;
    readonly timeoutMs: number;
  }): Promise<string> {
    const payload = await this.postJson({
      body: {
        messages: prompt.messages,
        model,
        response_format: { type: 'json_object' },
        temperature: 0.1,
      },
      endpoint: OPENAI_CHAT_COMPLETIONS_URL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      provider: 'openai',
      timeoutMs,
    });

    return this.readStringPath(payload, ['choices', 0, 'message', 'content']);
  }
}
