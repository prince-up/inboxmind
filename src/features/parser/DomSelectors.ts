/**
 * Gmail extraction selectors ordered from stable semantic attributes to
 * narrowly scoped Gmail fallbacks.
 */
export const PARSER_SELECTORS = {
  applicationRoot: 'div[role="main"]',
  attachment:
    '[data-attachment-id], [download_url], [data-tooltip][data-extension]',
  attachmentName: '[data-attachment-name], [aria-label], [data-tooltip]',
  bccContainer: '[data-recipient-type="bcc"], [aria-label^="Bcc"], .bcc',
  body: '[data-message-id] .a3s, .a3s[dir], [data-message-body], [role="listitem"] [dir="ltr"]',
  ccContainer: '[data-recipient-type="cc"], [aria-label^="Cc"], .cc',
  conversation: 'div[role="main"]',
  date: 'time[datetime], [data-date], [data-tooltip*="20"], [title*="20"]',
  draft: '[data-draft-id], [aria-label*="Draft"], [data-tooltip*="Draft"]',
  expandedMessage:
    '[data-message-id][aria-expanded="true"], [data-message-id] [aria-expanded="true"]',
  important:
    '[data-is-important="true"], [aria-pressed="true"][aria-label*="important" i]',
  label: '[data-label-name], [data-label], [aria-label^="Label:"]',
  message: '[data-message-id], [data-legacy-message-id], [data-draft-id]',
  recipient:
    '[email], [data-email], [data-hovercard-id*="@"], [data-recipient-email]',
  recipientDetails:
    '[data-recipient-type], [aria-label^="to "], [aria-label^="cc "], [aria-label^="bcc "]',
  sender:
    '[data-sender-email], .gD[email], [email][data-hovercard-id], [data-hovercard-id*="@"]',
  starred:
    '[data-is-starred="true"], [aria-pressed="true"][aria-label*="star" i]',
  subject: 'h2[data-thread-perm-id], h2.hP, [data-thread-subject]',
  unread: '[data-is-unread="true"], [aria-label="Unread" i]',
} as const;

export const PARSER_ATTRIBUTES = {
  attachmentId: ['data-attachment-id', 'data-id'],
  attachmentName: [
    'data-attachment-name',
    'download',
    'data-tooltip',
    'aria-label',
  ],
  attachmentSize: ['data-size', 'data-attachment-size'],
  email: [
    'email',
    'data-email',
    'data-recipient-email',
    'data-sender-email',
    'data-hovercard-id',
  ],
  messageId: ['data-message-id', 'data-legacy-message-id', 'data-draft-id'],
  name: ['name', 'data-name', 'data-sender-name'],
  threadId: ['data-thread-perm-id', 'data-thread-id'],
} as const;
