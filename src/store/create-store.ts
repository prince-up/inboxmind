import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

/**
 * Creates an isolated, framework-agnostic Zustand store.
 */
export function createInboxMindStore<TState extends object>(
  initializer: StateCreator<TState>,
): StoreApi<TState> {
  return createStore(initializer);
}
