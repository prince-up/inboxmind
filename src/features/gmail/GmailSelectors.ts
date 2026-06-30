import { GMAIL_SELECTORS } from '~constants';

/**
 * Selectors required by Gmail lifecycle detection. Product extraction
 * selectors remain outside the Gmail engine.
 */
export const GMAIL_ENGINE_SELECTORS = {
  applicationRoot: GMAIL_SELECTORS.applicationRoot,
  composeWindow: '.M9',
  message: GMAIL_SELECTORS.message,
  subject: GMAIL_SELECTORS.subject,
} as const;
