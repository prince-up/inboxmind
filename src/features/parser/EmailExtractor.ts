import type { AttachmentExtractor } from './AttachmentExtractor';
import { PARSER_SELECTORS } from './DomSelectors';
import type { MetadataExtractor } from './MetadataExtractor';
import type { ConversationMetadata, ParsedEmail } from './ParserTypes';
import type { RecipientExtractor } from './RecipientExtractor';

/**
 * Composes focused extractors into one normalized email model.
 */
export class EmailExtractor {
  public constructor(
    private readonly attachments: AttachmentExtractor,
    private readonly metadata: MetadataExtractor,
    private readonly recipients: RecipientExtractor,
  ) {}

  /**
   * Extracts a single Gmail message without querying outside its node.
   */
  extract(
    message: Element,
    conversation: ConversationMetadata,
    index: number,
  ): ParsedEmail {
    const recipientData = this.recipients.extract(message);
    const emailMetadata = this.metadata.extractEmail(message, index);
    const body = message.querySelector(PARSER_SELECTORS.body);

    return {
      attachments: this.attachments.extract(message),
      bcc: recipientData.bcc,
      bodyHtml: body?.innerHTML.trim() ?? '',
      bodyPlain: this.extractPlainText(body),
      cc: recipientData.cc,
      conversationId: conversation.conversationId,
      date: emailMetadata.date,
      id: emailMetadata.id,
      isDraft: emailMetadata.isDraft,
      isImportant: emailMetadata.isImportant,
      isStarred: emailMetadata.isStarred,
      isUnread: emailMetadata.isUnread,
      labels: [...new Set([...conversation.labels, ...emailMetadata.labels])],
      recipients: recipientData.recipients,
      sender: recipientData.sender,
      subject: conversation.subject,
      threadId: conversation.threadId,
      url: conversation.url,
    };
  }

  /**
   * Produces readable plain text while preserving meaningful line breaks.
   */
  private extractPlainText(body: Element | null): string {
    if (!body) {
      return '';
    }

    const text =
      body instanceof HTMLElement ? body.innerText : body.textContent ?? '';

    return text
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
