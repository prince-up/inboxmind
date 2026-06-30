import { PARSER_ATTRIBUTES, PARSER_SELECTORS } from './DomSelectors';
import { ParserError } from './ParserErrors';
import type { ConversationMetadata, EmailMetadata } from './ParserTypes';

/**
 * Extracts conversation and message metadata from Gmail DOM and URL state.
 */
export class MetadataExtractor {
  public constructor(
    private readonly document: Document,
    private readonly getCurrentUrl: () => string,
  ) {}

  /**
   * Extracts metadata shared by every message in the current conversation.
   */
  extractConversation(conversation: Element): ConversationMetadata {
    const url = this.getUrl();
    const subjectElement =
      conversation.querySelector(PARSER_SELECTORS.subject) ??
      this.document.querySelector(PARSER_SELECTORS.subject);
    const subject =
      subjectElement?.getAttribute('data-thread-subject') ??
      subjectElement?.textContent?.trim() ??
      '';
    const threadId =
      this.firstAttribute(subjectElement, PARSER_ATTRIBUTES.threadId) ??
      this.firstAttribute(conversation, PARSER_ATTRIBUTES.threadId);

    return {
      conversationId: this.extractConversationId(url),
      labels: this.extractLabels(conversation),
      subject,
      threadId,
      url: url.href,
    };
  }

  /**
   * Extracts metadata belonging to one rendered email.
   */
  extractEmail(message: Element, index: number): EmailMetadata {
    const dateElement = message.querySelector(PARSER_SELECTORS.date);
    const date =
      dateElement?.getAttribute('datetime') ??
      dateElement?.getAttribute('data-date') ??
      dateElement?.getAttribute('title') ??
      dateElement?.getAttribute('data-tooltip') ??
      dateElement?.textContent?.trim() ??
      null;

    return {
      date,
      id:
        this.firstAttribute(message, PARSER_ATTRIBUTES.messageId) ??
        `gmail-message-${index + 1}`,
      isDraft:
        message.matches(PARSER_SELECTORS.draft) ||
        message.querySelector(PARSER_SELECTORS.draft) !== null,
      isImportant:
        message.matches(PARSER_SELECTORS.important) ||
        message.querySelector(PARSER_SELECTORS.important) !== null,
      isStarred:
        message.matches(PARSER_SELECTORS.starred) ||
        message.querySelector(PARSER_SELECTORS.starred) !== null,
      isUnread:
        message.matches(PARSER_SELECTORS.unread) ||
        message.querySelector(PARSER_SELECTORS.unread) !== null,
      labels: this.extractLabels(message),
    };
  }

  /**
   * Parses and validates the active Gmail URL.
   */
  private getUrl(): URL {
    try {
      const url = new URL(this.getCurrentUrl());
      if (url.hostname !== 'mail.google.com') {
        throw new ParserError(
          'INVALID_GMAIL_URL',
          'The active page is not a Gmail URL.',
        );
      }
      return url;
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }

      throw new ParserError(
        'INVALID_GMAIL_URL',
        'The active Gmail URL could not be parsed.',
        { cause: error },
      );
    }
  }

  /**
   * Extracts the route-level Gmail conversation identifier.
   */
  private extractConversationId(url: URL): string {
    const segments = url.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const routeId = segments.at(-1);

    if (!routeId || /^p\d+$/i.test(routeId)) {
      throw new ParserError(
        'CONVERSATION_NOT_FOUND',
        'The active Gmail route does not identify a conversation.',
      );
    }

    try {
      return decodeURIComponent(routeId);
    } catch {
      return routeId;
    }
  }

  /**
   * Extracts unique labels from semantic Gmail attributes.
   */
  private extractLabels(message: Element): readonly string[] {
    const labels = Array.from(message.querySelectorAll(PARSER_SELECTORS.label))
      .map(
        (element) =>
          element.getAttribute('data-label-name') ??
          element.getAttribute('data-label') ??
          element.getAttribute('aria-label')?.replace(/^Label:\s*/i, '') ??
          element.textContent?.trim() ??
          '',
      )
      .filter(Boolean);

    return [...new Set(labels)];
  }

  /**
   * Returns the first non-empty attribute value from an element.
   */
  private firstAttribute(
    element: Element | null,
    attributes: readonly string[],
  ): string | null {
    if (!element) {
      return null;
    }

    return (
      attributes
        .map((attribute) => element.getAttribute(attribute))
        .find((value): value is string => Boolean(value?.trim())) ?? null
    );
  }
}
