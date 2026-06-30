import type { PlasmoCSConfig } from 'plasmo';

import {
  requestSidebarEmailSnapshot,
  SIDEBAR_EMAIL_SNAPSHOT_EVENT,
  type SidebarEmailSnapshot,
  type SidebarEmailSnapshotEventDetail,
} from '~features/sidebar/SidebarEmailBridge';
import { sidebarEngine } from '~features/sidebar/SidebarEngine';
import { sidebarStore } from '~features/sidebar/SidebarStore';

export const config: PlasmoCSConfig = {
  matches: ['https://mail.google.com/*'],
  run_at: 'document_idle',
};

let parserBridgeStarted = false;

/**
 * Restores the sidebar after Gmail returns from the back-forward cache.
 */
function handlePageShow(): void {
  sidebarEngine.start();
  startParserBridge();
  requestSidebarEmailSnapshot();
}

/**
 * Releases sidebar resources while Gmail is inactive or unloading.
 */
function handlePageHide(): void {
  stopParserBridge();
  sidebarEngine.stop();
}

/**
 * Starts listening for parser snapshots from the Gmail parser content script.
 */
function startParserBridge(): void {
  if (parserBridgeStarted) {
    return;
  }

  parserBridgeStarted = true;
  window.addEventListener(SIDEBAR_EMAIL_SNAPSHOT_EVENT, handleEmailSnapshot);
}

/**
 * Stops listening for parser snapshots.
 */
function stopParserBridge(): void {
  if (!parserBridgeStarted) {
    return;
  }

  parserBridgeStarted = false;
  window.removeEventListener(SIDEBAR_EMAIL_SNAPSHOT_EVENT, handleEmailSnapshot);
}

/**
 * Writes parsed email data into the shared sidebar store.
 */
function handleEmailSnapshot(event: Event): void {
  if (!(event instanceof CustomEvent)) {
    return;
  }

  const detail: unknown = event.detail;

  if (!isSidebarEmailSnapshotEventDetail(detail)) {
    return;
  }

  sidebarStore.getState().setParserData(detail);
}

/**
 * Validates parser bridge payloads before writing them into React state.
 */
function isSidebarEmailSnapshotEventDetail(
  value: unknown,
): value is SidebarEmailSnapshotEventDetail {
  if (!isRecord(value) || !('snapshot' in value)) {
    return false;
  }

  return (
    'currentConversation' in value &&
    (value.currentConversation === null ||
      isParsedConversationLike(value.currentConversation)) &&
    'currentEmail' in value &&
    (value.currentEmail === null || isParsedEmailLike(value.currentEmail)) &&
    (value.snapshot === null || isSidebarEmailSnapshot(value.snapshot))
  );
}

/**
 * Validates the email snapshot shape sent by the parser content script.
 */
function isSidebarEmailSnapshot(value: unknown): value is SidebarEmailSnapshot {
  return (
    isRecord(value) &&
    typeof value.bodyPreview === 'string' &&
    typeof value.conversationId === 'string' &&
    (typeof value.date === 'string' || value.date === null) &&
    Array.isArray(value.recipients) &&
    value.recipients.every((recipient) => typeof recipient === 'string') &&
    (typeof value.sender === 'string' || value.sender === null) &&
    typeof value.subject === 'string'
  );
}

/**
 * Validates the parsed conversation shape required by the sidebar store.
 */
function isParsedConversationLike(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.conversationId === 'string' &&
    Array.isArray(value.emails) &&
    typeof value.subject === 'string'
  );
}

/**
 * Validates the parsed email shape required by the sidebar store.
 */
function isParsedEmailLike(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.bodyPlain === 'string' &&
    typeof value.conversationId === 'string' &&
    Array.isArray(value.recipients) &&
    typeof value.subject === 'string'
  );
}

/**
 * Narrows arbitrary event payload data to an object record.
 */
function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

sidebarEngine.start();
startParserBridge();
requestSidebarEmailSnapshot();
window.addEventListener('pageshow', handlePageShow);
window.addEventListener('pagehide', handlePageHide);
