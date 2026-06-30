import type { ReactElement } from 'react';

import { Card } from './Card';
import { EmptyState } from './EmptyState';

export interface SectionProps {
  readonly description: string;
  readonly index: number;
  readonly title: string;
}

/**
 * Standard sidebar section with a heading and honest empty state.
 */
export function Section({
  description,
  index,
  title,
}: SectionProps): ReactElement {
  return (
    <Card index={index}>
      <div className="im-section__heading">
        <h2>{title}</h2>
      </div>
      <EmptyState description={description} />
    </Card>
  );
}
