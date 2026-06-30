import type { ParsedAddress, ParsedConversation } from '~features/parser';

import type { AIPrompt } from '../models/AIRequest';
import { buildActionPrompt } from '../prompts/ActionPrompt';
import { buildMetadataPrompt } from '../prompts/MetadataPrompt';
import {
  buildSummaryPrompt,
  type PromptConversationContext,
  type PromptEmailContext,
} from '../prompts/SummaryPrompt';

const MAX_EMAIL_BODY_CHARS = 12_000;

/**
 * Builds deterministic structured prompts from parser output.
 */
export class PromptBuilder {
  /**
   * Builds a prompt for email summarization.
   */
  public buildSummary(conversation: ParsedConversation): AIPrompt {
    return buildSummaryPrompt(this.toPromptContext(conversation));
  }

  /**
   * Builds a prompt for action detection.
   */
  public buildActions(conversation: ParsedConversation): AIPrompt {
    return buildActionPrompt(this.toPromptContext(conversation));
  }

  /**
   * Builds a prompt for metadata extraction.
   */
  public buildMetadata(conversation: ParsedConversation): AIPrompt {
    return buildMetadataPrompt(this.toPromptContext(conversation));
  }

  /**
   * Converts parsed Gmail conversation data into provider-safe prompt context.
   */
  private toPromptContext(
    conversation: ParsedConversation,
  ): PromptConversationContext {
    return {
      conversationId: conversation.conversationId,
      emails: conversation.emails.map((email): PromptEmailContext => {
        const sender = this.formatAddress(email.sender);

        return {
          attachments: email.attachments.map((attachment) => attachment.name),
          body: email.bodyPlain.slice(0, MAX_EMAIL_BODY_CHARS),
          date: email.date,
          from: sender,
          subject: email.subject,
          to: email.recipients.map((recipient) =>
            this.formatAddress(recipient),
          ),
        };
      }),
      subject: conversation.subject,
      url: conversation.url,
    };
  }

  /**
   * Formats an email address for prompt context without exposing DOM details.
   */
  private formatAddress(address: ParsedAddress | null): string {
    if (!address) {
      return '';
    }

    return address.name ? `${address.name} <${address.email}>` : address.email;
  }
}
