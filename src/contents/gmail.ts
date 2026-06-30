import type { PlasmoCSConfig } from 'plasmo';

import { gmailEngine } from '~features/gmail';
import { emailParser, type ParserUnsubscribe } from '~features/parser';
import {
  createSidebarEmailSnapshotEventDetail,
  dispatchSidebarEmailSnapshot,
  SIDEBAR_EMAIL_SNAPSHOT_REQUEST_EVENT,
} from '~features/sidebar/SidebarEmailBridge';

export const config: PlasmoCSConfig = {
  matches: ['https://mail.google.com/*'],
  run_at: 'document_start',
};

let parserUnsubscribe: ParserUnsubscribe | null = null;

/**
 * Resumes Gmail observation when the document becomes active.
 */
function handlePageShow(): void {
  startParserIntegration();
  emailParser.start();
  gmailEngine.start();
}

/**
 * Suspends Gmail observation when the document enters the page cache or exits.
 */
function handlePageHide(): void {
  stopParserIntegration();
  emailParser.stop();
  gmailEngine.stop();
}

/**
 * Subscribes to parser results and forwards them to the sidebar bundle.
 */
function startParserIntegration(): void {
  if (parserUnsubscribe) {
    return;
  }

  parserUnsubscribe = emailParser.subscribe((result) => {
    dispatchSidebarEmailSnapshot(createSidebarEmailSnapshotEventDetail(result));
  });
  window.addEventListener(
    SIDEBAR_EMAIL_SNAPSHOT_REQUEST_EVENT,
    handleSnapshotRequest,
  );
}

/**
 * Removes parser-to-sidebar integration listeners.
 */
function stopParserIntegration(): void {
  parserUnsubscribe?.();
  parserUnsubscribe = null;
  window.removeEventListener(
    SIDEBAR_EMAIL_SNAPSHOT_REQUEST_EVENT,
    handleSnapshotRequest,
  );
}

/**
 * Sends the current parsed conversation when the sidebar starts after parsing.
 */
function handleSnapshotRequest(): void {
  dispatchSidebarEmailSnapshot(
    createSidebarEmailSnapshotEventDetail(
      emailParser.parseCurrentConversation(),
    ),
  );
}

startParserIntegration();
emailParser.start();
gmailEngine.start();
window.addEventListener('pageshow', handlePageShow);
window.addEventListener('pagehide', handlePageHide);
