import { AIError } from '../errors/AIErrors';
import type { AIProviderType } from '../types/AIProviderType';

export interface AdapterRequest {
  readonly body: Readonly<Record<string, unknown>>;
  readonly endpoint: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly provider: AIProviderType;
  readonly timeoutMs: number;
}

/**
 * Shared HTTP adapter for browser-safe provider requests.
 */
export class BaseAdapter {
  /**
   * Sends a JSON POST request and returns the provider JSON payload.
   */
  protected async postJson(request: AdapterRequest): Promise<unknown> {
    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, request.timeoutMs);

    try {
      const response = await fetch(request.endpoint, {
        body: JSON.stringify(request.body),
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        method: 'POST',
        signal: abortController.signal,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw this.toHttpError(response.status, request.provider, responseText);
      }

      return JSON.parse(responseText);
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AIError(
          'TIMEOUT',
          'AI provider request timed out.',
          request.provider,
        );
      }

      if (error instanceof SyntaxError) {
        throw new AIError(
          'INVALID_JSON',
          'AI provider returned an invalid transport response.',
          request.provider,
        );
      }

      throw new AIError(
        'PROVIDER_UNAVAILABLE',
        'AI provider request failed.',
        request.provider,
      );
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  /**
   * Reads a string from a nested provider response path.
   */
  protected readStringPath(
    value: unknown,
    path: readonly (number | string)[],
  ): string {
    let cursor = value;

    for (const segment of path) {
      if (typeof segment === 'number') {
        if (!Array.isArray(cursor)) {
          return '';
        }

        cursor = cursor[segment];
        continue;
      }

      if (!this.isRecord(cursor)) {
        return '';
      }

      cursor = cursor[segment];
    }

    return typeof cursor === 'string' ? cursor : '';
  }

  /**
   * Narrows arbitrary JSON to an object record.
   */
  protected isRecord(
    value: unknown,
  ): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Maps provider HTTP status codes to typed AI errors.
   */
  private toHttpError(
    status: number,
    provider: AIProviderType,
    responseText: string,
  ): AIError {
    if (status === 401 || status === 403) {
      return new AIError('AUTHENTICATION', responseText, provider);
    }

    if (status === 429) {
      return new AIError('RATE_LIMITED', responseText, provider);
    }

    return new AIError('PROVIDER_UNAVAILABLE', responseText, provider);
  }
}
