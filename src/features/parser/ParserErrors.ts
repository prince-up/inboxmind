import type { ParserErrorCode, ParserIssue } from './ParserTypes';

/**
 * Typed failure raised when Gmail DOM extraction cannot continue safely.
 */
export class ParserError extends Error {
  public constructor(
    public readonly code: ParserErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ParserError';
  }

  /**
   * Converts the error into a serializable parser issue.
   */
  toIssue(): ParserIssue {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

/**
 * Normalizes arbitrary failures into a safe parser issue.
 */
export function toParserIssue(error: unknown): ParserIssue {
  if (error instanceof ParserError) {
    return error.toIssue();
  }

  if (error instanceof Error) {
    return {
      code: 'EXTRACTION_FAILED',
      message: error.message,
    };
  }

  return {
    code: 'EXTRACTION_FAILED',
    message: 'Gmail extraction failed with a non-error value.',
  };
}
