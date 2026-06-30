import { createStore, type StoreApi } from 'zustand/vanilla';

import type { ParsedConversation, ParsedEmail } from '~features/parser';

import type {
  SidebarEmailSnapshot,
  SidebarEmailSnapshotEventDetail,
} from './SidebarEmailBridge';

export type SidebarThemeMode = 'dark' | 'light';

export interface SidebarStoreState {
  readonly currentConversation: ParsedConversation | null;
  readonly currentEmail: ParsedEmail | null;
  readonly emailSnapshot: SidebarEmailSnapshot | null;
  readonly isLoading: boolean;
  readonly isOpen: boolean;
  readonly isViewportCompact: boolean;
  readonly selectedEmailId: string | null;
  readonly theme: SidebarThemeMode;
  readonly close: () => void;
  readonly open: () => void;
  readonly setEmailSnapshot: (
    emailSnapshot: SidebarEmailSnapshot | null,
  ) => void;
  readonly setParserData: (data: SidebarEmailSnapshotEventDetail) => void;
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
    currentConversation: null,
    currentEmail: null,
    emailSnapshot: null,
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
    setEmailSnapshot: (emailSnapshot) => {
      set({
        emailSnapshot,
        selectedEmailId: emailSnapshot?.conversationId ?? null,
      });
    },
    setParserData: (data) => {
      set({
        currentConversation: data.currentConversation,
        currentEmail: data.currentEmail,
        emailSnapshot: data.snapshot,
        selectedEmailId: data.snapshot?.conversationId ?? null,
      });
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

export const sidebarStore = createSidebarStore();
