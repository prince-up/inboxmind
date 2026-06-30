import type { ReactElement } from 'react';

export interface EmptyStateProps {
  readonly description: string;
}

/**
 * Communicates an intentionally empty feature state without fabricated data.
 */
export function EmptyState({ description }: EmptyStateProps): ReactElement {
  return (
    <div className="im-empty" role="status">
      <span aria-hidden="true" className="im-empty__dot" />
      <span>{description}</span>
    </div>
  );
}
