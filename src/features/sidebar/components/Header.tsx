import type { ReactElement } from 'react';

import { Button } from './Button';

export interface HeaderProps {
  readonly onCollapse: () => void;
  readonly version: string;
}

/**
 * Sidebar identity, live connection status, version, and collapse control.
 */
export function Header({ onCollapse, version }: HeaderProps): ReactElement {
  return (
    <header className="im-header">
      <div className="im-brand">
        <div aria-hidden="true" className="im-brand__mark">
          IM
        </div>
        <div>
          <h1>InboxMind AI</h1>
          <div className="im-status">
            <span aria-hidden="true" className="im-status__indicator" />
            <span>Connected</span>
            <span aria-hidden="true">·</span>
            <span>v{version}</span>
          </div>
        </div>
      </div>
      <Button
        ariaLabel="Collapse InboxMind sidebar"
        onClick={onCollapse}
        variant="ghost"
      >
        <span aria-hidden="true" className="im-icon">
          →
        </span>
      </Button>
    </header>
  );
}
