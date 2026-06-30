export type GmailNavigationListener = (
  currentUrl: string,
  previousUrl: string,
) => void;

/**
 * Tracks Gmail SPA navigation through browser events and History API writes.
 */
export class GmailNavigation {
  private currentUrl: string;
  private listener: GmailNavigationListener | null = null;
  private originalPushState: History['pushState'] | null = null;
  private originalReplaceState: History['replaceState'] | null = null;
  private pushStateWrapper: History['pushState'] | null = null;
  private replaceStateWrapper: History['replaceState'] | null = null;

  public constructor(private readonly browserWindow: Window) {
    this.currentUrl = browserWindow.location.href;
  }

  /**
   * Starts URL observation. Repeated starts are ignored.
   */
  start(listener: GmailNavigationListener): void {
    if (this.listener) {
      return;
    }

    this.listener = listener;
    this.currentUrl = this.browserWindow.location.href;
    this.browserWindow.addEventListener(
      'hashchange',
      this.handleBrowserNavigation,
    );
    this.browserWindow.addEventListener(
      'popstate',
      this.handleBrowserNavigation,
    );
    this.interceptHistory();
  }

  /**
   * Stops URL observation and restores the original History API methods.
   */
  stop(): void {
    if (!this.listener) {
      return;
    }

    this.browserWindow.removeEventListener(
      'hashchange',
      this.handleBrowserNavigation,
    );
    this.browserWindow.removeEventListener(
      'popstate',
      this.handleBrowserNavigation,
    );
    this.restoreHistory();
    this.listener = null;
  }

  /**
   * Installs reversible wrappers around History API navigation.
   */
  private interceptHistory(): void {
    const history = this.browserWindow.history;
    // Stored unbound so stop() can restore the exact function identity.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originalPushState = history.pushState;
    // Stored unbound so stop() can restore the exact function identity.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.originalReplaceState = history.replaceState;

    this.pushStateWrapper = (data, unused, url) => {
      this.originalPushState?.call(history, data, unused, url);
      this.notifyIfChanged();
    };
    this.replaceStateWrapper = (data, unused, url) => {
      this.originalReplaceState?.call(history, data, unused, url);
      this.notifyIfChanged();
    };

    history.pushState = this.pushStateWrapper;
    history.replaceState = this.replaceStateWrapper;
  }

  /**
   * Restores History API methods only when this instance still owns them.
   */
  private restoreHistory(): void {
    const history = this.browserWindow.history;

    if (
      this.pushStateWrapper &&
      history.pushState === this.pushStateWrapper &&
      this.originalPushState
    ) {
      history.pushState = this.originalPushState;
    }

    if (
      this.replaceStateWrapper &&
      history.replaceState === this.replaceStateWrapper &&
      this.originalReplaceState
    ) {
      history.replaceState = this.originalReplaceState;
    }

    this.originalPushState = null;
    this.originalReplaceState = null;
    this.pushStateWrapper = null;
    this.replaceStateWrapper = null;
  }

  /**
   * Handles native browser navigation signals.
   */
  private readonly handleBrowserNavigation = (): void => {
    this.notifyIfChanged();
  };

  /**
   * Emits only genuine URL transitions.
   */
  private notifyIfChanged(): void {
    const nextUrl = this.browserWindow.location.href;
    if (nextUrl === this.currentUrl) {
      return;
    }

    const previousUrl = this.currentUrl;
    this.currentUrl = nextUrl;
    this.listener?.(nextUrl, previousUrl);
  }
}
