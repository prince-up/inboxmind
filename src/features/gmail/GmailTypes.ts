/**
 * Canonical Gmail engine event names.
 */
export const GMAIL_EVENTS = {
  composeClosed: 'gmail:compose-closed',
  composeOpened: 'gmail:compose-opened',
  conversationChanged: 'gmail:conversation-changed',
  conversationOpened: 'gmail:conversation-opened',
  inboxLoaded: 'gmail:inbox-loaded',
  loaded: 'gmail:loaded',
  ready: 'gmail:ready',
  threadChanged: 'gmail:thread-changed',
  urlChanged: 'gmail:url-changed',
} as const;

export type GmailEventName = (typeof GMAIL_EVENTS)[keyof typeof GMAIL_EVENTS];

/**
 * Shared metadata included with every Gmail engine event.
 */
export interface GmailEventContext {
  readonly timestamp: number;
  readonly url: string;
}

export type GmailLoadedEvent = GmailEventContext;

export type GmailReadyEvent = GmailEventContext;

export interface GmailUrlChangedEvent extends GmailEventContext {
  readonly previousUrl: string;
}

export interface GmailConversationOpenedEvent extends GmailEventContext {
  readonly conversationId: string;
}

export interface GmailConversationChangedEvent extends GmailEventContext {
  readonly conversationId: string;
  readonly previousConversationId: string;
}

export interface GmailThreadChangedEvent extends GmailEventContext {
  readonly conversationId: string;
  readonly previousSignature: string;
  readonly signature: string;
}

export type GmailInboxLoadedEvent = GmailEventContext;

export interface GmailComposeOpenedEvent extends GmailEventContext {
  readonly composeId: string;
}

export interface GmailComposeClosedEvent extends GmailEventContext {
  readonly composeId: string;
}

/**
 * Payload map used by the strongly typed Gmail event bus.
 */
export interface GmailEventMap {
  [GMAIL_EVENTS.composeClosed]: GmailComposeClosedEvent;
  [GMAIL_EVENTS.composeOpened]: GmailComposeOpenedEvent;
  [GMAIL_EVENTS.conversationChanged]: GmailConversationChangedEvent;
  [GMAIL_EVENTS.conversationOpened]: GmailConversationOpenedEvent;
  [GMAIL_EVENTS.inboxLoaded]: GmailInboxLoadedEvent;
  [GMAIL_EVENTS.loaded]: GmailLoadedEvent;
  [GMAIL_EVENTS.ready]: GmailReadyEvent;
  [GMAIL_EVENTS.threadChanged]: GmailThreadChangedEvent;
  [GMAIL_EVENTS.urlChanged]: GmailUrlChangedEvent;
}

export type GmailEventListener<TEventName extends GmailEventName> = (
  event: GmailEventMap[TEventName],
) => void;

export type GmailUnsubscribe = () => void;

export type GmailRoute =
  | {
      readonly kind: 'conversation';
      readonly conversationId: string;
    }
  | {
      readonly kind: 'inbox';
    }
  | {
      readonly kind: 'other';
    };

export interface GmailComposeSnapshot {
  readonly composeIds: ReadonlySet<string>;
}

export type MutationObserverFactory = (
  callback: MutationCallback,
) => MutationObserver;

/**
 * Browser dependencies required by the Gmail engine.
 */
export interface GmailEngineDependencies {
  readonly document: Document;
  readonly window: Window;
  readonly mutationObserverFactory: MutationObserverFactory;
}
