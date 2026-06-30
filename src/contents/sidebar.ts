import type { PlasmoCSConfig } from 'plasmo';

import { sidebarEngine } from '~features/sidebar';

export const config: PlasmoCSConfig = {
  matches: ['https://mail.google.com/*'],
  run_at: 'document_idle',
};

/**
 * Restores the sidebar after Gmail returns from the back-forward cache.
 */
function handlePageShow(): void {
  sidebarEngine.start();
}

/**
 * Releases sidebar resources while Gmail is inactive or unloading.
 */
function handlePageHide(): void {
  sidebarEngine.stop();
}

sidebarEngine.start();
window.addEventListener('pageshow', handlePageShow);
window.addEventListener('pagehide', handlePageHide);
