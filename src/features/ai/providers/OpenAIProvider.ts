import { OpenAIAdapter } from '../adapters/OpenAIAdapter';
import type { AIConfig } from '../config/AIConfig';
import { getDefaultModelId } from '../config/AIConfig';
import { AbstractAIProvider } from '../engine/AIProvider';
import type { AIRequest } from '../models/AIRequest';

/**
 * OpenAI provider implementation.
 */
export class OpenAIProvider extends AbstractAIProvider {
  private readonly adapter: OpenAIAdapter;

  public constructor(
    private readonly config: AIConfig,
    adapter = new OpenAIAdapter(),
  ) {
    super({
      model: getDefaultModelId('openai'),
      type: 'openai',
    });
    this.adapter = adapter;
  }

  /**
   * Returns whether OpenAI credentials are available.
   */
  public isAvailable(): boolean {
    return Boolean(this.config.openaiApiKey);
  }

  /**
   * Generates raw structured JSON text via OpenAI.
   */
  protected async generateText(request: AIRequest): Promise<string> {
    return this.adapter.generateJsonText({
      apiKey: this.config.openaiApiKey ?? '',
      model: this.model,
      prompt: request.prompt,
      timeoutMs: request.timeoutMs,
    });
  }
}
