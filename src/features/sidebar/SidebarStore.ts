import { createStore, type StoreApi } from 'zustand/vanilla';

export type SidebarThemeMode = 'dark' | 'light';

export interface SidebarStoreState {
  readonly isLoading: boolean;
  readonly isOpen: boolean;
  readonly isViewportCompact: boolean;
  readonly selectedEmailId: string | null;
  readonly theme: SidebarThemeMode;
  readonly close: () => void;
  readonly open: () => void;
  readonly setLoading: (isLoading: boolean) => void;
  readonly setSelectedEmail: (selectedEmailId: string | null) => void;
  readonly setTheme: (theme: SidebarThemeMode) => void;
  readonly setViewportCompact: (isViewportCompact: boolean) => void;
  readonly toggle: () => void;
}

export type SidebarStoreApi = StoreApi<SidebarStoreState>;

/**
 * Creates an isolated state container for one sidebar application instance.
 */
export function createSidebarStore(): SidebarStoreApi {
  return createStore<SidebarStoreState>()((set) => ({
    isLoading: false,
    isOpen: true,
    isViewportCompact: false,
    selectedEmailId: null,
    theme: 'dark',
    close: () => {
      set({ isOpen: false });
    },
    open: () => {
      set({ isOpen: true });
    },
    setLoading: (isLoading) => {
      set({ isLoading });
    },
    setSelectedEmail: (selectedEmailId) => {
      set({ selectedEmailId });
    },
    setTheme: (theme) => {
      set({ theme });
    },
    setViewportCompact: (isViewportCompact) => {
      set({ isViewportCompact });
    },
    toggle: () => {
      set((state) => ({ isOpen: !state.isOpen }));
    },
  }));
}
