import { logger, type Logger } from '~utils';

import { GmailDetector } from './GmailDetector';
import { GmailEventBus } from './GmailEvents';
import { GmailNavigation } from './GmailNavigation';
import { GmailObserver } from './GmailObserver';
import {
  GMAIL_EVENTS,
  type GmailEngineDependencies,
  type GmailEventListener,
  type GmailEventMap,
  type GmailEventName,
  type GmailRoute,
  type GmailUnsubscribe,
} from './GmailTypes';

/**
 * Coordinates Gmail lifecycle detection, SPA navigation, and typed events.
 */
export class GmailEngine {
  private readonly detector: GmailDetector;
  private readonly events = new GmailEventBus();
  private readonly navigation: GmailNavigation;
  private readonly observer: GmailObserver;
  private destroyed = false;
  private started = false;
  private ready = false;
  private evaluationQueued = false;
  private previousRoute: GmailRoute = { kind: 'other' };
  private previousConversationId: string | null = null;
  private previousThreadSignature: string | null = null;
  private composeIds: ReadonlySet<string> = new Set();

  public constructor(
    private readonly dependencies: GmailEngineDependencies,
    private readonly engineLogger: Logger = logger,
  ) {
    this.detector = new GmailDetector(dependencies.document);
    this.navigation = new GmailNavigation(dependencies.window);
    this.observer = new GmailObserver(dependencies.mutationObserverFactory);
  }

  /**
   * Starts the Gmail engine. Repeated calls are safe and have no effect.
   */
  start(): void {
    if (this.destroyed) {
      throw new Error('A destroyed GmailEngine cannot be restarted.');
    }

    if (this.started) {
      return;
    }

    this.started = true;
    this.navigation.start(this.handleNavigation);
    this.observer.start(
      this.dependencies.document.documentElement,
      this.handleMutations,
    );

    const url = new URL(this.dependencies.window.location.href);
    if (this.detector.isLoaded(url)) {
      this.events.emit(GMAIL_EVENTS.loaded, this.createContext(url.href));
    }

    this.evaluate(url);
    this.engineLogger.info('Engine Started');
  }

  /**
   * Stops observation and releases browser listeners without removing
   * subscribers. The same instance can be started again.
   */
  stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.navigation.stop();
    this.observer.stop();
    this.resetDetectionState();
    this.engineLogger.info('Engine Stopped');
  }

  /**
   * Registers a typed Gmail lifecycle event listener.
   */
  subscribe<TEventName extends GmailEventName>(
    eventName: TEventName,
    listener: GmailEventListener<TEventName>,
  ): GmailUnsubscribe {
    this.assertNotDestroyed();
    return this.events.subscribe(eventName, listener);
  }

  /**
   * Removes a typed Gmail lifecycle event listener.
   */
  unsubscribe<TEventName extends GmailEventName>(
    eventName: TEventName,
    listener: GmailEventListener<TEventName>,
  ): void {
    this.events.unsubscribe(eventName, listener);
  }

  /**
   * Permanently stops the engine and releases all event subscribers.
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.stop();
    this.events.removeAll();
    this.destroyed = true;
  }

  /**
   * Handles URL transitions emitted by Gmail navigation.
   */
  private readonly handleNavigation = (
    currentUrl: string,
    previousUrl: string,
  ): void => {
    this.events.emit(GMAIL_EVENTS.urlChanged, {
      ...this.createContext(currentUrl),
      previousUrl,
    });
    this.engineLogger.info('Navigation Changed', {
      currentUrl,
      previousUrl,
    });
  };

  /**
   * Coalesces mutation bursts into one state evaluation per microtask.
   */
  private readonly handleMutations: MutationCallback = () => {
    if (this.evaluationQueued) {
      return;
    }

    this.evaluationQueued = true;
    queueMicrotask(() => {
      this.evaluationQueued = false;

      if (!this.started) {
        return;
      }

      this.evaluate(new URL(this.dependencies.window.location.href));
    });
  };

  /**
   * Evaluates current Gmail state and emits lifecycle transitions.
   */
  private evaluate(url: URL): void {
    if (!this.ready && this.detector.isReady()) {
      this.ready = true;
      this.events.emit(GMAIL_EVENTS.ready, this.createContext(url.href));
    }

    if (!this.ready) {
      return;
    }

    const route = this.detector.getRoute(url);
    this.evaluateRoute(route, url.href);
    this.evaluateComposeWindows(url.href);
    this.previousRoute = route;
  }

  /**
   * Emits inbox, conversation, and thread transitions.
   */
  private evaluateRoute(route: GmailRoute, url: string): void {
    if (route.kind === 'inbox' && this.previousRoute.kind !== 'inbox') {
      this.events.emit(GMAIL_EVENTS.inboxLoaded, this.createContext(url));
    }

    if (route.kind !== 'conversation') {
      this.previousConversationId = null;
      this.previousThreadSignature = null;
      return;
    }

    const signature = this.detector.getThreadSignature();

    if (!this.previousConversationId) {
      this.events.emit(GMAIL_EVENTS.conversationOpened, {
        ...this.createContext(url),
        conversationId: route.conversationId,
      });
    } else if (this.previousConversationId !== route.conversationId) {
      this.events.emit(GMAIL_EVENTS.conversationChanged, {
        ...this.createContext(url),
        conversationId: route.conversationId,
        previousConversationId: this.previousConversationId,
      });
      this.engineLogger.info('Conversation Changed', {
        conversationId: route.conversationId,
        previousConversationId: this.previousConversationId,
      });
    } else if (
      signature &&
      this.previousThreadSignature &&
      signature !== this.previousThreadSignature
    ) {
      this.events.emit(GMAIL_EVENTS.threadChanged, {
        ...this.createContext(url),
        conversationId: route.conversationId,
        previousSignature: this.previousThreadSignature,
        signature,
      });
    }

    this.previousConversationId = route.conversationId;
    this.previousThreadSignature = signature;
  }

  /**
   * Emits compose open and close transitions.
   */
  private evaluateComposeWindows(url: string): void {
    const snapshot = this.detector.getComposeSnapshot();

    for (const composeId of snapshot.composeIds) {
      if (!this.composeIds.has(composeId)) {
        this.events.emit(GMAIL_EVENTS.composeOpened, {
          ...this.createContext(url),
          composeId,
        });
        this.engineLogger.info('Compose Opened', { composeId });
      }
    }

    for (const composeId of this.composeIds) {
      if (!snapshot.composeIds.has(composeId)) {
        this.events.emit(GMAIL_EVENTS.composeClosed, {
          ...this.createContext(url),
          composeId,
        });
        this.engineLogger.info('Compose Closed', { composeId });
      }
    }

    this.composeIds = snapshot.composeIds;
  }

  /**
   * Creates common event metadata.
   */
  private createContext(url: string): GmailEventMap['gmail:loaded'] {
    return {
      timestamp: Date.now(),
      url,
    };
  }

  /**
   * Clears transient detection state while preserving subscriptions.
   */
  private resetDetectionState(): void {
    this.ready = false;
    this.evaluationQueued = false;
    this.previousRoute = { kind: 'other' };
    this.previousConversationId = null;
    this.previousThreadSignature = null;
    this.composeIds = new Set();
  }

  /**
   * Prevents new subscriptions after permanent teardown.
   */
  private assertNotDestroyed(): void {
    if (this.destroyed) {
      throw new Error('A destroyed GmailEngine cannot accept subscribers.');
    }
  }
}

/**
 * Browser-scoped Gmail engine singleton used by the content script.
 */
export const gmailEngine = new GmailEngine({
  document,
  mutationObserverFactory: (callback) => new MutationObserver(callback),
  window,
});
