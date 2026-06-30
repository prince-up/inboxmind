import { AnimatePresence, motion } from 'framer-motion';
import {
  useEffect,
  useRef,
  type ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { Sidebar } from './components/Sidebar';
import { SIDEBAR_TRANSITION, SIDEBAR_VARIANTS } from './SidebarAnimations';
import { useSidebarStore } from './SidebarContext';

export interface SidebarRootProps {
  readonly version: string;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Resolves focus correctly inside the sidebar's Shadow DOM boundary.
 */
function getActiveElement(panel: HTMLElement | null): Element | null {
  const rootNode = panel?.getRootNode();
  return rootNode instanceof ShadowRoot
    ? rootNode.activeElement
    : document.activeElement;
}

/**
 * Owns visibility animation, dialog semantics, focus containment, and Escape.
 */
export function SidebarRoot({ version }: SidebarRootProps): ReactElement {
  const close = useSidebarStore((state) => state.close);
  const isOpen = useSidebarStore((state) => state.isOpen);
  const isViewportCompact = useSidebarStore((state) => state.isViewportCompact);
  const theme = useSidebarStore((state) => state.theme);
  const panelRef = useRef<HTMLElement>(null);
  const isVisible = isOpen && !isViewportCompact;

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const firstFocusable =
      panelRef.current?.querySelector<HTMLElement>(focusableSelector);
    firstFocusable?.focus();

    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isVisible]);

  /**
   * Keeps keyboard focus inside the modal sidebar and closes it with Escape.
   */
  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      panelRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (
      event.shiftKey &&
      getActiveElement(panelRef.current) === firstElement &&
      lastElement
    ) {
      event.preventDefault();
      lastElement.focus();
    } else if (
      !event.shiftKey &&
      getActiveElement(panelRef.current) === lastElement &&
      firstElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <div className={`im-shell im-theme-${theme}`}>
      <AnimatePresence>
        {isVisible ? (
          <motion.aside
            animate="open"
            aria-describedby="inboxmind-sidebar-content"
            aria-label="InboxMind AI email copilot"
            aria-modal="true"
            className="im-panel"
            exit="closed"
            initial="closed"
            key="sidebar"
            onKeyDown={handleKeyDown}
            ref={panelRef}
            role="dialog"
            tabIndex={-1}
            transition={SIDEBAR_TRANSITION}
            variants={SIDEBAR_VARIANTS}
          >
            <Sidebar version={version} />
          </motion.aside>
        ) : null}
      </AnimatePresence>
      <div aria-live="polite" className="im-screen-reader-status">
        {isViewportCompact
          ? 'InboxMind sidebar hidden because the Gmail window is too narrow.'
          : ''}
      </div>
    </div>
  );
}
