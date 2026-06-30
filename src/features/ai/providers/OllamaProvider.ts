import { BaseAdapter } from '../adapters/BaseAdapter';
import type { AIConfig } from '../config/AIConfig';
import { getDefaultModelId } from '../config/AIConfig';
import { AbstractAIProvider } from '../engine/AIProvider';
import type { AIRequest } from '../models/AIRequest';

/**
 * Ollama provider implementation for local model execution.
 */
export class OllamaProvider extends AbstractAIProvider {
  public constructor(
    private readonly config: AIConfig,
    private readonly adapter = new OllamaHttpAdapter(),
  ) {
    super({
      model: getDefaultModelId('ollama'),
      type: 'ollama',
    });
  }

  /**
   * Returns whether Ollama URL is configured.
   */
  public isAvailable(): boolean {
    return Boolean(this.config.ollamaUrl);
  }

  /**
   * Generates raw structured JSON text via Ollama.
   */
  protected async generateText(request: AIRequest): Promise<string> {
    return this.adapter.generateJsonText({
      endpoint: `${this.config.ollamaUrl.replace(/\/$/, '')}/api/chat`,
      model: this.model,
      prompt: request.prompt,
      timeoutMs: request.timeoutMs,
    });
  }
}

class OllamaHttpAdapter extends BaseAdapter {
  /**
   * Sends an Ollama chat request and extracts assistant content.
   */
  public async generateJsonText({
    endpoint,
    model,
    prompt,
    timeoutMs,
  }: {
    readonly endpoint: string;
    readonly model: string;
    readonly prompt: AIRequest['prompt'];
    readonly timeoutMs: number;
  }): Promise<string> {
    const payload = await this.postJson({
      body: {
        format: 'json',
        messages: prompt.messages,
        model,
        stream: false,
      },
      endpoint,
      headers: {},
      provider: 'ollama',
      timeoutMs,
    });

    return this.readStringPath(payload, ['message', 'content']);
  }
}
