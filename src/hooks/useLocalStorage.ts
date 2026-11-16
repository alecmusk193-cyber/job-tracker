import { useCallback, useSyncExternalStore } from 'react';
import { readPrefRaw, subscribePref, writePref } from '../utils/localPrefs';

/**
 * Small device-local preference (theme, selected tab…), persisted in
 * localStorage. For user data use `useFirestore`, which has the same API.
 */
const cache = new Map<string, { raw: string | null; value: unknown }>();

function getSnapshot<T>(key: string, initial: T): T {
  const raw = readPrefRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value: T = initial;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initial;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const value = useSyncExternalStore(
    useCallback((cb) => subscribePref(key, cb), [key]),
    () => getSnapshot(key, initial),
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot(key, initial);
      writePref(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next);
    },
    // `initial` is expected to be a stable constant
    [key],
  );

  return [value, setValue] as const;
}
