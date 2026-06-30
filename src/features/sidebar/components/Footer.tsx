import type { ReactElement } from 'react';

import { Button } from './Button';

export interface FooterProps {
  readonly isSettingsOpen: boolean;
  readonly onSettingsToggle: () => void;
}

/**
 * Sidebar footer with a functional settings control.
 */
export function Footer({
  isSettingsOpen,
  onSettingsToggle,
}: FooterProps): ReactElement {
  return (
    <footer className="im-footer">
      <Button
        ariaLabel={
          isSettingsOpen
            ? 'Close InboxMind settings'
            : 'Open InboxMind settings'
        }
        onClick={onSettingsToggle}
        variant="ghost"
      >
        <span aria-hidden="true" className="im-icon">
          ⚙
        </span>
        <span>Settings</span>
      </Button>
      <span className="im-footer__shortcut">Ctrl Shift I</span>
    </footer>
  );
}
