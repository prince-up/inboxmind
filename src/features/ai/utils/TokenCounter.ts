const AVERAGE_CHARS_PER_TOKEN = 4;

/**
 * Provides deterministic token estimates without binding the app to a provider SDK.
 */
export class TokenCounter {
  /**
   * Estimates token count from text using a conservative character ratio.
   */
  public estimate(text: string): number {
    return Math.ceil(text.trim().length / AVERAGE_CHARS_PER_TOKEN);
  }
}
