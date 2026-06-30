import { GeminiAdapter } from '../adapters/GeminiAdapter';
import type { AIConfig } from '../config/AIConfig';
import { getDefaultModelId } from '../config/AIConfig';
import { AbstractAIProvider } from '../engine/AIProvider';
import type { AIRequest } from '../models/AIRequest';

/**
 * Gemini provider implementation.
 */
export class GeminiProvider extends AbstractAIProvider {
  private readonly adapter: GeminiAdapter;

  public constructor(
    private readonly config: AIConfig,
    adapter = new GeminiAdapter(),
  ) {
    super({
      model: getDefaultModelId('gemini'),
      type: 'gemini',
    });
    this.adapter = adapter;
  }

  /**
   * Returns whether Gemini credentials are available.
   */
  public isAvailable(): boolean {
    return Boolean(this.config.geminiApiKey);
  }

  /**
   * Generates raw structured JSON text via Gemini.
   */
  protected async generateText(request: AIRequest): Promise<string> {
    return this.adapter.generateJsonText({
      apiKey: this.config.geminiApiKey ?? '',
      model: this.model,
      prompt: request.prompt,
      timeoutMs: request.timeoutMs,
    });
  }
}
