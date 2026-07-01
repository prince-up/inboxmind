import { PARSER_SELECTORS } from './DomSelectors';
import type { EmailExtractor } from './EmailExtractor';
import type { MetadataExtractor } from './MetadataExtractor';
import { ParserError } from './ParserErrors';
import type { ParsedConversation, ParsedEmail } from './ParserTypes';

/**
 * Extracts complete Gmail conversations while caching the connected root.
 */
export class ConversationExtractor {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  invalidate(): void {}

  /**
   * Reuses a connected conversation root to avoid repeated global queries.
   */
  private getConversation(): Element {
    // Gmail may cache old views in the DOM with display: none.
    // Query all matching elements and find the one that is currently visible.
    const conversations = Array.from(this.document.querySelectorAll(
      PARSER_SELECTORS.conversation,
    ));
    
    // An element is usually visible if it has an offsetParent or if it's the only one.
    // However, in extension context, getComputedStyle is safer for checking display.
    const activeConversation = conversations.find((el) => {
      const style = this.document.defaultView?.getComputedStyle(el);
      return style?.display !== 'none';
    }) ?? conversations[0];

    if (!activeConversation) {
      throw new ParserError(
        'CONVERSATION_NOT_FOUND',
        'No Gmail conversation is currently rendered.',
      );
    }
    
    return activeConversation;
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
