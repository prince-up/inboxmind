/**
 * Versioned storage keys prevent collisions with other extensions and allow
 * future data migrations without ambiguous key ownership.
 */
export const STORAGE_KEYS = {
  emailMemory: 'inboxmind:v1:email-memory',
  reminders: 'inboxmind:v1:reminders',
  settings: 'inboxmind:v1:settings',
  sidebar: 'inboxmind:v1:sidebar',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
