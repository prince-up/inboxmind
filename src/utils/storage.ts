import type { StorageKey } from '~constants';

/**
 * Reads and narrows a value from extension-local storage.
 */
export async function getStoredValue<TValue>(
  key: StorageKey,
  isValue: (value: unknown) => value is TValue,
): Promise<TValue | null> {
  const result = (await chrome.storage.local.get(key)) as unknown as Record<
    string,
    unknown
  >;
  const value = result[key];

  return isValue(value) ? value : null;
}

/**
 * Writes a serializable value to extension-local storage.
 */
export async function setStoredValue<TValue>(
  key: StorageKey,
  value: TValue,
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

/**
 * Removes a value from extension-local storage.
 */
export async function removeStoredValue(key: StorageKey): Promise<void> {
  await chrome.storage.local.remove(key);
}
