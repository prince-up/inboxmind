import { PARSER_SELECTORS } from './DomSelectors';
import type { EmailExtractor } from './EmailExtractor';
import type { MetadataExtractor } from './MetadataExtractor';
import { ParserError } from './ParserErrors';
import type { ParsedConversation, ParsedEmail } from './ParserTypes';

/**
 * Extracts complete Gmail conversations while caching the connected root.
 */
export class ConversationExtractor {
  private cachedConversation: Element | null = null;

  public constructor(
    private readonly document: Document,
    private readonly emailExtractor: EmailExtractor,
    private readonly metadataExtractor: MetadataExtractor,
  ) {}

  /**
   * Extracts every currently rendered message in document order.
   */
  extract(): ParsedConversation {
    const conversation = this.getConversation();
    const metadata = this.metadataExtractor.extractConversation(conversation);
    const messageNodes = this.getMessageNodes(conversation);

    if (messageNodes.length === 0) {
      throw new ParserError(
        'EMAIL_NOT_FOUND',
        'No rendered email was found in the current Gmail conversation.',
      );
    }

    return {
      ...metadata,
      emails: messageNodes.map((message, index) =>
        this.emailExtractor.extract(message, metadata, index),
      ),
    };
  }

  /**
   * Extracts the active or most recently rendered email.
   */
  extractCurrentEmail(): ParsedEmail {
    const conversation = this.getConversation();
    const metadata = this.metadataExtractor.extractConversation(conversation);
    const messageNodes = this.getMessageNodes(conversation);

    if (messageNodes.length === 0) {
      throw new ParserError(
        'EMAIL_NOT_FOUND',
        'No current email was found in the Gmail conversation.',
      );
    }

    const expandedNode = messageNodes.find(
      (message) =>
        message.matches(PARSER_SELECTORS.expandedMessage) ||
        message.querySelector(PARSER_SELECTORS.expandedMessage) !== null,
    );
    const selectedNode = expandedNode ?? messageNodes.at(-1);

    if (!selectedNode) {
      throw new ParserError(
        'EMAIL_NOT_FOUND',
        'No current email node could be selected.',
      );
    }

    return this.emailExtractor.extract(
      selectedNode,
      metadata,
      messageNodes.indexOf(selectedNode),
    );
  }

  /**
   * Invalidates cached DOM references after Gmail navigation.
   */
  invalidate(): void {
    this.cachedConversation = null;
  }

  /**
   * Reuses a connected conversation root to avoid repeated global queries.
   */
  private getConversation(): Element {
    if (this.cachedConversation?.isConnected) {
      return this.cachedConversation;
    }

    const conversation = this.document.querySelector(
      PARSER_SELECTORS.conversation,
    );
    if (!conversation) {
      throw new ParserError(
        'CONVERSATION_NOT_FOUND',
        'No Gmail conversation is currently rendered.',
      );
    }

    this.cachedConversation = conversation;
    return conversation;
  }

  /**
   * Queries message nodes once and removes nested selector duplicates.
   */
  private getMessageNodes(conversation: Element): readonly Element[] {
    const candidates = Array.from(
      conversation.querySelectorAll(PARSER_SELECTORS.message),
    );

    return candidates.filter(
      (candidate) =>
        candidate.parentElement?.closest(PARSER_SELECTORS.message) === null,
    );
  }
}
