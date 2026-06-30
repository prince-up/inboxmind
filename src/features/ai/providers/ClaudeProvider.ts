import { BaseAdapter } from '../adapters/BaseAdapter';
import type { AIConfig } from '../config/AIConfig';
import { getDefaultModelId } from '../config/AIConfig';
import { AbstractAIProvider } from '../engine/AIProvider';
import type { AIRequest } from '../models/AIRequest';

const CLAUDE_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Claude provider implementation.
 */
export class ClaudeProvider extends AbstractAIProvider {
  public constructor(
    private readonly config: AIConfig,
    private readonly adapter = new ClaudeHttpAdapter(),
  ) {
    super({
      model: getDefaultModelId('claude'),
      type: 'claude',
    });
  }

  /**
   * Returns whether Anthropic credentials are available.
   */
  public isAvailable(): boolean {
    return Boolean(this.config.anthropicApiKey);
  }

  /**
   * Generates raw structured JSON text via Claude.
   */
  protected async generateText(request: AIRequest): Promise<string> {
    return this.adapter.generateJsonText({
      apiKey: this.config.anthropicApiKey ?? '',
      model: this.model,
      prompt: request.prompt,
      timeoutMs: request.timeoutMs,
    });
  }
}

class ClaudeHttpAdapter extends BaseAdapter {
  /**
   * Sends a Claude messages request and extracts text content.
   */
  public async generateJsonText({
    apiKey,
    model,
    prompt,
    timeoutMs,
  }: {
    readonly apiKey: string;
    readonly model: string;
    readonly prompt: AIRequest['prompt'];
    readonly timeoutMs: number;
  }): Promise<string> {
    const [systemMessage, ...userMessages] = prompt.messages;
    const payload = await this.postJson({
      body: {
        max_tokens: 2_048,
        messages: userMessages.map((message) => ({
          content: message.content,
          role: message.role === 'system' ? 'user' : message.role,
        })),
        model,
        system: systemMessage?.content ?? '',
        temperature: 0.1,
      },
      endpoint: CLAUDE_MESSAGES_URL,
      headers: {
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey,
      },
      provider: 'claude',
      timeoutMs,
    });

    return this.readStringPath(payload, ['content', 0, 'text']);
  }
}
