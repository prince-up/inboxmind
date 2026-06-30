import type { ReactElement } from 'react';

/**
 * Accessible loading indicator for asynchronous sidebar surfaces.
 */
export function Loading(): ReactElement {
  return (
    <div
      aria-label="InboxMind is loading"
      aria-live="polite"
      className="im-loading"
      role="status"
    >
      <span className="im-loading__ring" />
      <span>Loading</span>
    </div>
  );
}
