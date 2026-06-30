export type AIErrorCode =
  | 'AUTHENTICATION'
  | 'INVALID_JSON'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'VALIDATION_FAILED';

export class AIError extends Error {
  public constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly provider: string | null = null,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const isAIError = (error: Error): error is AIError =>
  error instanceof AIError;
