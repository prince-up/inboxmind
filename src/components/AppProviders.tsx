import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren, ReactElement } from 'react';

import { queryClient } from '~lib/react-query';

/**
 * Provides application-wide infrastructure to every InboxMind React surface.
 */
export function AppProviders({ children }: PropsWithChildren): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
