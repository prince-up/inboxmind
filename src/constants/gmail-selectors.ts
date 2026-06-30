/**
 * Centralized Gmail DOM selectors. Keeping selectors isolated limits the impact
 * of upstream Gmail markup changes.
 */
export const GMAIL_SELECTORS = {
  applicationRoot: 'div[role="main"]',
  message: 'div[data-message-id]',
  messageBody: '.a3s.aiL',
  sender: '.gD[email]',
  subject: 'h2.hP',
  threadContainer: 'div[role="main"]',
} as const;
