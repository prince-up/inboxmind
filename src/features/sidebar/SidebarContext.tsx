import {
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand';

import type { SidebarStoreApi, SidebarStoreState } from './SidebarStore';

const SidebarStoreContext = createContext<SidebarStoreApi | null>(null);

export interface SidebarStoreProviderProps {
  readonly children: ReactNode;
  readonly store: SidebarStoreApi;
}

/**
 * Makes a sidebar store available to the isolated React application.
 */
export function SidebarStoreProvider({
  children,
  store,
}: SidebarStoreProviderProps): ReactElement {
  return (
    <SidebarStoreContext.Provider value={store}>
      {children}
    </SidebarStoreContext.Provider>
  );
}

/**
 * Selects reactive state from the nearest sidebar store.
 */
export function useSidebarStore<TSelection>(
  selector: (state: SidebarStoreState) => TSelection,
): TSelection {
  const store = useContext(SidebarStoreContext);

  if (!store) {
    throw new Error(
      'useSidebarStore must be used inside SidebarStoreProvider.',
    );
  }

  return useStore(store, selector);
}
