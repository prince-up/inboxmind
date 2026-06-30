/**
 * Serializable email address identity.
 */
export interface EmailAddress {
  readonly address: string;
  readonly name?: string;
}

/**
 * Provider-neutral email representation used across InboxMind features.
 */
export interface Email {
  readonly id: string;
  readonly threadId: string;
  readonly subject: string;
  readonly sender: EmailAddress;
  readonly recipients: readonly EmailAddress[];
  readonly sentAt: string;
  readonly bodyText: string;
}
