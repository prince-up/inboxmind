export type SidebarView = 'home' | 'memory' | 'reminders' | 'settings';

/**
 * Shared UI state contract for the Gmail sidebar.
 */
export interface SidebarState {
  readonly isOpen: boolean;
  readonly activeView: SidebarView;
  readonly activeEmailId: string | null;
}
