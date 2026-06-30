import { logger, type Logger } from '~utils';

import { SidebarMount } from './SidebarMount';
import { createSidebarStore, type SidebarStoreApi } from './SidebarStore';
import { SIDEBAR_THEME } from './SidebarTheme';

export interface SidebarEngineDependencies {
  readonly document: Document;
  readonly resizeObserverFactory: (
    callback: ResizeObserverCallback,
  ) => ResizeObserver;
  readonly version: string;
  readonly window: Window;
}

/**
 * Coordinates sidebar mounting, keyboard shortcuts, responsive state, and
 * deterministic cleanup.
 */
export class SidebarEngine {
  private readonly mount: SidebarMount;
  private readonly store: SidebarStoreApi;
  private destroyed = false;
  private resizeObserver: ResizeObserver | null = null;
  private started = false;

  public constructor(
    private readonly dependencies: SidebarEngineDependencies,
    private readonly engineLogger: Logger = logger,
  ) {
    this.mount = new SidebarMount(dependencies.document);
    this.store = createSidebarStore();
  }

  /**
   * Starts the sidebar application. Repeated starts are ignored.
   */
  start(): void {
    if (this.destroyed) {
      throw new Error('A destroyed SidebarEngine cannot be restarted.');
    }

    if (this.started) {
      return;
    }

    this.started = true;
    this.mount.mount({
      store: this.store,
      version: this.dependencies.version,
    });
    this.dependencies.document.addEventListener(
      'keydown',
      this.handleKeyboardShortcut,
      true,
    );
    this.resizeObserver = this.dependencies.resizeObserverFactory(
      this.handleResize,
    );
    this.resizeObserver.observe(this.dependencies.document.documentElement);
    this.updateResponsiveState(
      this.dependencies.document.documentElement.clientWidth ||
        this.dependencies.window.innerWidth,
    );
    this.engineLogger.info('Sidebar Engine Started');
  }

  /**
   * Stops the sidebar and releases all DOM listeners and observers.
   */
  stop(): void {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.dependencies.document.removeEventListener(
      'keydown',
      this.handleKeyboardShortcut,
      true,
    );
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.mount.unmount();
    this.engineLogger.info('Sidebar Engine Stopped');
  }

  /**
   * Toggles sidebar visibility while the engine is active.
   */
  toggle(): void {
    if (!this.started) {
      return;
    }

    this.store.getState().toggle();
  }

  /**
   * Permanently tears down the sidebar engine.
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.stop();
    this.store.getState().close();
    this.destroyed = true;
  }

  /**
   * Handles the Ctrl+Shift+I sidebar shortcut and Escape dismissal.
   */
  private readonly handleKeyboardShortcut = (event: KeyboardEvent): void => {
    if (
      event.ctrlKey &&
      event.shiftKey &&
      !event.altKey &&
      event.code === 'KeyI'
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.toggle();
      return;
    }

    if (event.key === 'Escape' && this.store.getState().isOpen) {
      this.store.getState().close();
    }
  };

  /**
   * Reacts to viewport size changes without polling.
   */
  private readonly handleResize: ResizeObserverCallback = (entries) => {
    const rootEntry = entries.find(
      (entry) => entry.target === this.dependencies.document.documentElement,
    );
    const width =
      rootEntry?.contentRect.width ?? this.dependencies.window.innerWidth;
    this.updateResponsiveState(width);
  };

  /**
   * Synchronizes compact-layout state with the observed Gmail width.
   */
  private updateResponsiveState(width: number): void {
    this.store
      .getState()
      .setViewportCompact(width < SIDEBAR_THEME.compactViewportWidth);
  }
}

/**
 * Browser-scoped sidebar engine singleton used by the Gmail content script.
 */
export const sidebarEngine = new SidebarEngine({
  document,
  resizeObserverFactory: (callback) => new ResizeObserver(callback),
  version: chrome.runtime.getManifest().version,
  window,
});
