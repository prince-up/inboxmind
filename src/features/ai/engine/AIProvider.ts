import { AIError } from '../errors/AIErrors';
import type { AIRequest } from '../models/AIRequest';
import type { AIHealth, AIResponse } from '../models/AIResponse';
import { AIResponseParser } from '../parser/AIResponseParser';
import type { StructuredOutputSchema } from '../parser/StructuredOutput';
import type { AIProviderType } from '../types/AIProviderType';

export interface AIProvider {
  readonly type: AIProviderType;

  /**
   * Initializes provider resources.
   */
  initialize(): Promise<void>;

  /**
   * Returns whether the provider has the configuration required to run.
   */
  isAvailable(): boolean;

  /**
   * Generates a validated structured response.
   */
  generate<TData>(
    request: AIRequest,
    schema: StructuredOutputSchema<TData>,
  ): Promise<AIResponse<TData>>;

  /**
   * Streams validated structured responses.
   */
  stream<TData>(
    request: AIRequest,
    schema: StructuredOutputSchema<TData>,
  ): AsyncIterable<AIResponse<TData>>;

  /**
   * Reports provider availability and latency.
   */
  health(): Promise<AIHealth>;

  /**
   * Releases provider resources.
   */
  destroy(): Promise<void>;
}

export interface AbstractAIProviderOptions {
  readonly model: string;
  readonly parser?: AIResponseParser;
  readonly type: AIProviderType;
}

/**
 * Shared lifecycle implementation for JSON-producing AI providers.
 */
export abstract class AbstractAIProvider implements AIProvider {
  public readonly type: AIProviderType;

  protected readonly model: string;

  private readonly parser: AIResponseParser;

  private initialized = false;

  protected constructor(options: AbstractAIProviderOptions) {
    this.type = options.type;
    this.model = options.model;
    this.parser = options.parser ?? new AIResponseParser();
  }

  /**
   * Initializes provider resources.
   */
  public initialize(): Promise<void> {
    this.initialized = true;
    return Promise.resolve();
  }

  /**
   * Generates a validated structured response.
   */
  public async generate<TData>(
    request: AIRequest,
    schema: StructuredOutputSchema<TData>,
  ): Promise<AIResponse<TData>> {
    this.assertReady();
    const rawResponse = await this.generateText(request);

    return {
      data: this.parser.parse(rawResponse, schema),
      model: this.model,
      provider: this.type,
      receivedAt: Date.now(),
      usage: null,
    };
  }

  /**
   * Streams validated structured responses.
   */
  public async *stream<TData>(
    request: AIRequest,
    schema: StructuredOutputSchema<TData>,
  ): AsyncIterable<AIResponse<TData>> {
    yield await this.generate(request, schema);
  }

  /**
   * Reports provider availability and local lifecycle state.
   */
  public health(): Promise<AIHealth> {
    const startedAt = performance.now();
    const available = this.isAvailable();

    return Promise.resolve({
      available,
      checkedAt: Date.now(),
      latencyMs: Math.round(performance.now() - startedAt),
      provider: this.type,
      reason: available ? null : 'Provider configuration is incomplete.',
    });
  }

  /**
   * Releases provider resources.
   */
  public destroy(): Promise<void> {
    this.initialized = false;
    return Promise.resolve();
  }

  /**
   * Returns whether provider configuration is sufficient to run.
   */
  public abstract isAvailable(): boolean;

  /**
   * Generates raw JSON text through the concrete provider transport.
   */
  protected abstract generateText(request: AIRequest): Promise<string>;

  /**
   * Ensures the provider can accept a request.
   */
  private assertReady(): void {
    if (!this.initialized) {
      throw new AIError(
        'PROVIDER_UNAVAILABLE',
        'AI provider has not been initialized.',
        this.type,
      );
    }

    if (!this.isAvailable()) {
      throw new AIError(
        'PROVIDER_UNAVAILABLE',
        'AI provider configuration is incomplete.',
        this.type,
      );
    }
  }
}
