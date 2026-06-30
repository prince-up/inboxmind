import { GMAIL_ENGINE_SELECTORS } from './GmailSelectors';
import type { GmailComposeSnapshot, GmailRoute } from './GmailTypes';

/**
 * Performs read-only Gmail DOM and route detection.
 */
export class GmailDetector {
  private readonly composeIds = new WeakMap<Element, string>();
  private composeSequence = 0;

  public constructor(private readonly document: Document) {}

  /**
   * Returns whether the current document belongs to Gmail.
   */
  isLoaded(url: URL): boolean {
    return (
      url.hostname === 'mail.google.com' && url.pathname.startsWith('/mail/')
    );
  }

  /**
   * Returns whether Gmail's primary application surface is available.
   */
  isReady(): boolean {
    return (
      this.document.querySelector(GMAIL_ENGINE_SELECTORS.applicationRoot) !==
      null
    );
  }

  /**
   * Classifies the current Gmail route using both URL and rendered state.
   */
  getRoute(url: URL): GmailRoute {
    const hashSegments = this.getHashSegments(url);
    const conversationId = this.getConversationId(hashSegments);

    if (conversationId && this.hasRenderedConversation()) {
      return {
        kind: 'conversation',
        conversationId,
      };
    }

    if (hashSegments.length === 0 || hashSegments[0] === 'inbox') {
      return { kind: 'inbox' };
    }

    return { kind: 'other' };
  }

  /**
   * Creates a stable signature of the rendered messages in a conversation.
   */
  getThreadSignature(): string | null {
    const messages = Array.from(
      this.document.querySelectorAll(GMAIL_ENGINE_SELECTORS.message),
    );
    const messageIds = messages
      .map((message) => message.getAttribute('data-message-id'))
      .filter((messageId): messageId is string => Boolean(messageId));

    return messageIds.length > 0 ? messageIds.join('|') : null;
  }

  /**
   * Returns stable identities for every currently rendered compose window.
   */
  getComposeSnapshot(): GmailComposeSnapshot {
    const composeElements = Array.from(
      this.document.querySelectorAll(GMAIL_ENGINE_SELECTORS.composeWindow),
    ).filter(
      (element) =>
        element.isConnected && element.getAttribute('aria-hidden') !== 'true',
    );

    return {
      composeIds: new Set(
        composeElements.map((element) => this.getComposeId(element)),
      ),
    };
  }

  /**
   * Returns whether Gmail currently renders a conversation surface.
   */
  private hasRenderedConversation(): boolean {
    return (
      this.document.querySelector(GMAIL_ENGINE_SELECTORS.message) !== null ||
      this.document.querySelector(GMAIL_ENGINE_SELECTORS.subject) !== null
    );
  }

  /**
   * Normalizes the Gmail hash route into decoded path segments.
   */
  private getHashSegments(url: URL): readonly string[] {
    const hash = url.hash.replace(/^#\/?/, '');

    if (!hash) {
      return [];
    }

    return hash
      .split('/')
      .filter(Boolean)
      .map((segment) => this.decodeSegment(segment));
  }

  /**
   * Extracts a conversation identifier from a rendered thread route.
   */
  private getConversationId(hashSegments: readonly string[]): string | null {
    if (hashSegments.length < 2) {
      return null;
    }

    const candidate = hashSegments.at(-1);
    if (!candidate || /^p\d+$/i.test(candidate)) {
      return null;
    }

    return candidate;
  }

  /**
   * Decodes a URL segment while tolerating malformed external input.
   */
  private decodeSegment(segment: string): string {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  }

  /**
   * Resolves a Gmail-provided compose identity or assigns a session identity.
   */
  private getComposeId(element: Element): string {
    const nativeId =
      element.getAttribute('data-compose-id') ?? element.getAttribute('id');

    if (nativeId) {
      return nativeId;
    }

    const existingId = this.composeIds.get(element);
    if (existingId) {
      return existingId;
    }

    this.composeSequence += 1;
    const generatedId = `compose-${this.composeSequence}`;
    this.composeIds.set(element, generatedId);
    return generatedId;
  }
}
