import type { AIPrompt } from '../models/AIRequest';
import { BaseAdapter } from './BaseAdapter';

/**
 * Adapter for Gemini JSON generation.
 */
export class GeminiAdapter extends BaseAdapter {
  /**
   * Generates a JSON text response from Gemini.
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = await this.postJson({
      body: {
        contents: [
          {
            parts: prompt.messages.map((message) => ({
              text: `${message.role.toUpperCase()}: ${message.content}`,
            })),
            role: 'user',
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      },
      endpoint,
      headers: {},
      provider: 'gemini',
      timeoutMs,
    });

    return this.readStringPath(payload, [
      'candidates',
      0,
      'content',
      'parts',
      0,
      'text',
    ]);
  }
}
