import { ZodError } from 'zod';

import { AIError } from '../errors/AIErrors';
import type { StructuredOutputSchema } from './StructuredOutput';

/**
 * Converts provider text responses into validated structured objects.
 */
export class AIResponseParser {
  /**
   * Parses and validates a provider response against the expected schema.
   */
  public parse<TData>(
    rawResponse: string,
    schema: StructuredOutputSchema<TData>,
  ): TData {
    try {
      const parsedJson: unknown = JSON.parse(
        this.extractJsonObject(rawResponse),
      );
      return schema.parse(parsedJson);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AIError('INVALID_JSON', 'AI provider returned invalid JSON.');
      }

      if (error instanceof ZodError) {
        throw new AIError(
          'VALIDATION_FAILED',
          'AI provider returned JSON that does not match the expected schema.',
        );
      }

      if (error instanceof AIError) {
        throw error;
      }

      throw new AIError(
        'INVALID_JSON',
        'AI provider response could not be parsed.',
      );
    }
  }

  /**
   * Extracts the first complete JSON object from a response.
   */
  private extractJsonObject(response: string): string {
    const trimmedResponse = response.trim();

    if (trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) {
      return trimmedResponse;
    }

    const startIndex = trimmedResponse.indexOf('{');
    const endIndex = trimmedResponse.lastIndexOf('}');

    if (startIndex < 0 || endIndex <= startIndex) {
      throw new AIError(
        'INVALID_JSON',
        'AI provider response did not include JSON.',
      );
    }

    return trimmedResponse.slice(startIndex, endIndex + 1);
  }
}
