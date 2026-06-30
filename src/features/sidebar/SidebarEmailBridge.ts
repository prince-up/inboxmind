import type {
  ParsedAddress,
  ParsedConversation,
  ParsedEmail,
  ParserResult,
} from '~features/parser';

export const SIDEBAR_EMAIL_SNAPSHOT_EVENT = 'inboxmind:sidebar-email-snapshot';

export const SIDEBAR_EMAIL_SNAPSHOT_REQUEST_EVENT =
  'inboxmind:sidebar-email-snapshot-request';

export interface SidebarEmailSnapshot {
  readonly bodyPreview: string;
  readonly conversationId: string;
  readonly date: string | null;
  readonly recipients: readonly string[];
  readonly sender: string | null;
  readonly subject: string;
}

export interface SidebarEmailSnapshotEventDetail {
  readonly currentConversation: ParsedConversation | null;
  readonly currentEmail: ParsedEmail | null;
  readonly snapshot: SidebarEmailSnapshot | null;
}

const BODY_PREVIEW_MAX_LENGTH = 360;

/**
 * Converts parser output into the sidebar's display-safe email snapshot.
 */
export function createSidebarEmailSnapshot(
  result: ParserResult<ParsedConversation>,
): SidebarEmailSnapshot | null {
  if (!result.success || result.data.emails.length === 0) {
    return null;
  }

  const currentEmail = result.data.emails.at(-1);

  if (!currentEmail) {
    return null;
  }

  return {
    bodyPreview: normalizePreview(currentEmail.bodyPlain),
    conversationId: result.data.conversationId,
    date: currentEmail.date,
    recipients: currentEmail.recipients.map(formatAddress),
    sender: currentEmail.sender ? formatAddress(currentEmail.sender) : null,
    subject: result.data.subject || currentEmail.subject,
  };
}

/**
 * Converts parser output into the complete sidebar state update payload.
 */
export function createSidebarEmailSnapshotEventDetail(
  result: ParserResult<ParsedConversation>,
): SidebarEmailSnapshotEventDetail {
  if (!result.success) {
    return {
      currentConversation: null,
      currentEmail: null,
      snapshot: null,
    };
  }

  const currentEmail = result.data.emails.at(-1) ?? null;

  return {
    currentConversation: result.data,
    currentEmail,
    snapshot: createSidebarEmailSnapshot(result),
  };
}

/**
 * Emits a parsed email snapshot for the sidebar content script.
 */
export function dispatchSidebarEmailSnapshot(
  detail: SidebarEmailSnapshotEventDetail,
): void {
  window.dispatchEvent(
    new CustomEvent<SidebarEmailSnapshotEventDetail>(
      SIDEBAR_EMAIL_SNAPSHOT_EVENT,
      {
        detail,
      },
    ),
  );
}

/**
 * Requests the latest parsed email snapshot from the parser content script.
 */
export function requestSidebarEmailSnapshot(): void {
  window.dispatchEvent(new CustomEvent(SIDEBAR_EMAIL_SNAPSHOT_REQUEST_EVENT));
}

/**
 * Formats a parsed email address for compact sidebar display.
 */
function formatAddress(address: ParsedAddress): string {
  return address.name ? `${address.name} <${address.email}>` : address.email;
}

/**
 * Normalizes body text into a bounded single-preview string.
 */
function normalizePreview(body: string): string {
  const normalized = body.replace(/\s+/g, ' ').trim();

  if (normalized.length <= BODY_PREVIEW_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, BODY_PREVIEW_MAX_LENGTH - 1)}…`;
}
