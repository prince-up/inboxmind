import type { MutationObserverFactory } from './GmailTypes';

/**
 * Owns the Gmail DOM MutationObserver lifecycle.
 */
export class GmailObserver {
  private observer: MutationObserver | null = null;

  public constructor(
    private readonly observerFactory: MutationObserverFactory,
  ) {}

  /**
   * Begins observing Gmail DOM changes. Repeated starts are ignored.
   */
  start(target: Node, callback: MutationCallback): void {
    if (this.observer) {
      return;
    }

    this.observer = this.observerFactory(callback);
    this.observer.observe(target, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'data-compose-id', 'data-message-id'],
      childList: true,
      subtree: true,
    });
  }

  /**
   * Disconnects the active observer and releases its callback.
   */
  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
