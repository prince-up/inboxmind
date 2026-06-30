import type { ReactElement, ReactNode } from 'react';

import { AppProviders } from '~components';

import {
  SidebarStoreProvider,
  type SidebarStoreProviderProps,
} from './SidebarContext';

export interface SidebarProviderProps {
  readonly children?: ReactNode;
  readonly store: SidebarStoreProviderProps['store'];
}

/**
 * Composes shared infrastructure and sidebar-local state providers.
 */
export function SidebarProvider({
  children,
  store,
}: SidebarProviderProps): ReactElement {
  return (
    <AppProviders>
      <SidebarStoreProvider store={store}>{children}</SidebarStoreProvider>
    </AppProviders>
  );
}
