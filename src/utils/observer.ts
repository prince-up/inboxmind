export interface ObserverHandle {
  disconnect(): void;
}

/**
 * Starts a mutation observer and returns a minimal lifecycle handle.
 */
export function observeMutations(
  target: Node,
  callback: MutationCallback,
  options: MutationObserverInit = {
    childList: true,
    subtree: true,
  },
): ObserverHandle {
  const observer = new MutationObserver(callback);
  observer.observe(target, options);

  return {
    disconnect: () => {
      observer.disconnect();
    },
  };
}
