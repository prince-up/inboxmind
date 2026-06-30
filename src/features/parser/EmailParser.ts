import {
  GMAIL_EVENTS,
  gmailEngine,
  type GmailEngine,
  type GmailUnsubscribe,
} from '~features/gmail';
import { logger, type Logger } from '~utils';

import { AttachmentExtractor } from './AttachmentExtractor';
import { ConversationExtractor } from './ConversationExtractor';
import { PARSER_SELECTORS } from './DomSelectors';
import { EmailExtractor } from './EmailExtractor';
import { MetadataExtractor } from './MetadataExtractor';
import { toParserIssue } from './ParserErrors';
import type {
  ParsedConversation,
  ParsedEmail,
  ParserResult,
  ParserResultListener,
  ParserUnsubscribe,
} from './ParserTypes';
import { RecipientExtractor } from './RecipientExtractor';

const PARSE_THROTTLE_MS = 150;

export interface EmailParserDependencies {
  readonly clearTimeout: (timerId: number) => void;
  readonly document: Document;
  readonly gmailEngine: GmailEngine;
  readonly mutationObserverFactory: (
    callback: MutationCallback,
  ) => MutationObserver;
  readonly now: () => number;
  readonly setTimeout: (callback: () => void, delay: number) => number;
  readonly url: () => string;
}

/**
 * Public Gmail extraction facade with automatic, throttled change delivery.
 */
export class EmailParser {
  private readonly conversationExtractor: ConversationExtractor;
  private readonly listeners = new Set<ParserResultListener>();
  private readonly gmailUnsubscribes: GmailUnsubscribe[] = [];
  private mutationObserver: MutationObserver | null = null;
  private parseTimer: number | null = null;
  private started = false;

  public constructor(
    private readonly dependencies: EmailParserDependencies,
    private readonly parserLogger: Logger = logger,
  ) {
    const metadata = new MetadataExtractor(
      dependencies.document,
      dependencies.url,
    );
    const emailExtractor = new EmailExtractor(
      new AttachmentExtractor(),
      metadata,
      new RecipientExtractor(),
    );
    this.conversationExtractor = new ConversationExtractor(
      dependencies.document,
      emailExtractor,
      metadata,
    );
  }

  /**
   * Starts Gmail event integration and relevant DOM observation.
   */
  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.gmailUnsubscribes.push(
      this.dependencies.gmailEngine.subscribe(
        GMAIL_EVENTS.conversationOpened,
        this.handleConversationChanged,
      ),
      this.dependencies.gmailEngine.subscribe(
        GMAIL_EVENTS.conversationChanged,
        this.handleConversationChanged,
      ),
      this.dependencies.gmailEngine.subscribe(
        GMAIL_EVENTS.threadChanged,
        this.handleConversationChanged,
      ),
    );
    this.mutationObserver = this.dependencies.mutationObserverFactory(
      this.handleMutations,
    );
    this.mutationObserver.observe(this.dependencies.document.documentElement, {
      attributes: true,
      attributeFilter: [
        'aria-expanded',
        'data-attachment-id',
        'data-message-id',
        'data-thread-perm-id',
      ],
      childList: true,
      subtree: true,
    });
    this.scheduleParse();
  }

  /**
   * Stops automatic parsing while preserving subscribers.
   */
  stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.gmailUnsubscribes.splice(0).forEach((unsubscribe) => {
      unsubscribe();
    });
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.cancelScheduledParse();
    this.conversationExtractor.invalidate();
  }

  /**
   * Parses every currently rendered email in the active conversation.
   */
  parseCurrentConversation(): ParserResult<ParsedConversation> {
    try {
      const data = this.conversationExtractor.extract();
      const result: ParserResult<ParsedConversation> = {
        data,
        issues: [],
        parsedAt: this.dependencies.now(),
        success: true,
      };
      this.parserLogger.info('Gmail Conversation Parsed', {
        emailCount: data.emails.length,
      });
      return result;
    } catch (error) {
      const issue = toParserIssue(error);
      this.parserLogger.warn('Gmail Conversation Parsing Failed', {
        code: issue.code,
      });
      return {
        data: null,
        issues: [issue],
        parsedAt: this.dependencies.now(),
        success: false,
      };
    }
  }

  /**
   * Parses the expanded or most recently rendered email.
   */
  parseCurrentEmail(): ParserResult<ParsedEmail> {
    try {
      return {
        data: this.conversationExtractor.extractCurrentEmail(),
        issues: [],
        parsedAt: this.dependencies.now(),
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        issues: [toParserIssue(error)],
        parsedAt: this.dependencies.now(),
        success: false,
      };
    }
  }

  /**
   * Subscribes to automatically parsed conversation results.
   */
  subscribe(listener: ParserResultListener): ParserUnsubscribe {
    this.listeners.add(listener);
    return () => {
      this.unsubscribe(listener);
    };
  }

  /**
   * Removes an automatic parsing listener.
   */
  unsubscribe(listener: ParserResultListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Permanently releases observers, Gmail subscriptions, and listeners.
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
  }

  /**
   * Invalidates cached nodes and schedules parsing after Gmail changes.
   */
  private readonly handleConversationChanged = (): void => {
    this.conversationExtractor.invalidate();
    this.scheduleParse();
  };

  /**
   * Schedules parsing only for mutations inside relevant Gmail surfaces.
   */
  private readonly handleMutations: MutationCallback = (mutations) => {
    if (mutations.some((mutation) => this.isRelevantMutation(mutation))) {
      this.scheduleParse();
    }
  };

  /**
   * Determines whether a mutation can affect extracted email data.
   */
  private isRelevantMutation(mutation: MutationRecord): boolean {
    const target =
      mutation.target instanceof Element
        ? mutation.target
        : mutation.target.parentElement;
    if (
      target?.closest(PARSER_SELECTORS.conversation) &&
      (target.matches(PARSER_SELECTORS.message) ||
        target.closest(PARSER_SELECTORS.message) !== null)
    ) {
      return true;
    }

    return Array.from(mutation.addedNodes).some(
      (node) =>
        node instanceof Element &&
        (node.matches(PARSER_SELECTORS.message) ||
          node.querySelector(PARSER_SELECTORS.message) !== null),
    );
  }

  /**
   * Coalesces rapid Gmail mutations into one extraction pass.
   */
  private scheduleParse(): void {
    this.cancelScheduledParse();
    this.parseTimer = this.dependencies.setTimeout(() => {
      this.parseTimer = null;

      if (!this.started) {
        return;
      }

      const result = this.parseCurrentConversation();
      for (const listener of [...this.listeners]) {
        listener(result);
      }
    }, PARSE_THROTTLE_MS);
  }

  /**
   * Cancels a pending extraction pass.
   */
  private cancelScheduledParse(): void {
    if (this.parseTimer !== null) {
      this.dependencies.clearTimeout(this.parseTimer);
      this.parseTimer = null;
    }
  }
}

/**
 * Browser-scoped parser connected to the shared Gmail engine instance.
 */
export function createEmailParser(gmailEngine: GmailEngine): EmailParser {
  return new EmailParser({
    clearTimeout: (timerId) => {
      window.clearTimeout(timerId);
    },
    document,
    gmailEngine,
    mutationObserverFactory: (callback) => new MutationObserver(callback),
    now: Date.now,
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    url: () => window.location.href,
  });
}

/**
 * Shared parser instance bound to the Gmail engine used by the content script.
 */
export const emailParser = createEmailParser(gmailEngine);
