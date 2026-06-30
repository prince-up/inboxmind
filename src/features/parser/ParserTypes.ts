export interface ParsedAddress {
  readonly email: string;
  readonly name: string | null;
}

export interface ParsedAttachment {
  readonly id: string | null;
  readonly mimeType: string | null;
  readonly name: string;
  readonly sizeBytes: number | null;
  readonly sizeLabel: string | null;
}

export interface ParsedEmail {
  readonly attachments: readonly ParsedAttachment[];
  readonly bcc: readonly ParsedAddress[];
  readonly bodyHtml: string;
  readonly bodyPlain: string;
  readonly cc: readonly ParsedAddress[];
  readonly conversationId: string;
  readonly date: string | null;
  readonly id: string;
  readonly isDraft: boolean;
  readonly isImportant: boolean;
  readonly isStarred: boolean;
  readonly isUnread: boolean;
  readonly labels: readonly string[];
  readonly recipients: readonly ParsedAddress[];
  readonly sender: ParsedAddress | null;
  readonly subject: string;
  readonly threadId: string | null;
  readonly url: string;
}

export interface ParsedConversation {
  readonly conversationId: string;
  readonly emails: readonly ParsedEmail[];
  readonly subject: string;
  readonly threadId: string | null;
  readonly url: string;
}

export type ParserErrorCode =
  | 'CONVERSATION_NOT_FOUND'
  | 'EMAIL_NOT_FOUND'
  | 'EXTRACTION_FAILED'
  | 'INVALID_GMAIL_URL';

export interface ParserIssue {
  readonly code: ParserErrorCode;
  readonly message: string;
}

export type ParserResult<TData> =
  | {
      readonly data: TData;
      readonly issues: readonly ParserIssue[];
      readonly parsedAt: number;
      readonly success: true;
    }
  | {
      readonly data: null;
      readonly issues: readonly ParserIssue[];
      readonly parsedAt: number;
      readonly success: false;
    };

export type ParserResultListener = (
  result: ParserResult<ParsedConversation>,
) => void;

export type ParserUnsubscribe = () => void;

export interface ConversationMetadata {
  readonly conversationId: string;
  readonly labels: readonly string[];
  readonly subject: string;
  readonly threadId: string | null;
  readonly url: string;
}

export interface EmailMetadata {
  readonly date: string | null;
  readonly id: string;
  readonly isDraft: boolean;
  readonly isImportant: boolean;
  readonly isStarred: boolean;
  readonly isUnread: boolean;
  readonly labels: readonly string[];
}
