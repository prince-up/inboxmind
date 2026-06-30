import animationsCss from 'data-text:~features/sidebar/styles/animations.css';
import sidebarCss from 'data-text:~features/sidebar/styles/sidebar.css';
import themeCss from 'data-text:~features/sidebar/styles/theme.css';
import { createElement, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { SidebarProvider } from './SidebarProvider';
import { SidebarRoot } from './SidebarRoot';
import type { SidebarStoreApi } from './SidebarStore';
import { SIDEBAR_THEME } from './SidebarTheme';

export interface SidebarMountOptions {
  readonly store: SidebarStoreApi;
  readonly version: string;
}

/**
 * Owns the host element, Shadow DOM, constructable stylesheets, and React root.
 */
export class SidebarMount {
  private host: HTMLDivElement | null = null;
  private reactRoot: Root | null = null;

  public constructor(private readonly document: Document) {}

  /**
   * Mounts the isolated React application. Repeated mounts are ignored.
   */
  mount({ store, version }: SidebarMountOptions): void {
    if (this.reactRoot) {
      return;
    }

    const existingHost = this.document.getElementById(SIDEBAR_THEME.hostId);
    existingHost?.remove();

    const host = this.document.createElement('div');
    host.id = SIDEBAR_THEME.hostId;
    const shadowRoot = host.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [
      this.createStyleSheet(themeCss),
      this.createStyleSheet(animationsCss),
      this.createStyleSheet(sidebarCss),
    ];

    const applicationRoot = this.document.createElement('div');
    applicationRoot.id = 'inboxmind-sidebar-application';
    shadowRoot.append(applicationRoot);
    this.document.documentElement.append(host);

    const reactRoot = createRoot(applicationRoot);
    reactRoot.render(
      createElement(
        StrictMode,
        null,
        createElement(
          SidebarProvider,
          { store },
          createElement(SidebarRoot, { version }),
        ),
      ),
    );

    this.host = host;
    this.reactRoot = reactRoot;
  }

  /**
   * Unmounts React and removes the complete shadow host from Gmail.
   */
  unmount(): void {
    this.reactRoot?.unmount();
    this.host?.remove();
    this.reactRoot = null;
    this.host = null;
  }

  /**
   * Creates a constructable stylesheet from a dedicated CSS asset.
   */
  private createStyleSheet(cssText: string): CSSStyleSheet {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);
    return styleSheet;
  }
}
