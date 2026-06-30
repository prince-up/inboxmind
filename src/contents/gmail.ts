import type { PlasmoCSConfig } from 'plasmo';

import { gmailEngine } from '~features/gmail';
import { emailParser } from '~features/parser';

export const config: PlasmoCSConfig = {
  matches: ['https://mail.google.com/*'],
  run_at: 'document_start',
};

/**
 * Resumes Gmail observation when the document becomes active.
 */
function handlePageShow(): void {
  emailParser.start();
  gmailEngine.start();
}

/**
 * Suspends Gmail observation when the document enters the page cache or exits.
 */
function handlePageHide(): void {
  emailParser.stop();
  gmailEngine.stop();
}

emailParser.start();
gmailEngine.start();
window.addEventListener('pageshow', handlePageShow);
window.addEventListener('pagehide', handlePageHide);
