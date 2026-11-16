import { useCallback, useSyncExternalStore } from 'react';
import { readValue, subscribe, writeValue, type DataKey } from '../utils/storage';

/**
 * Drop-in replacement for the old `useLocalStorage`: same `[value, setValue]`
 * API, but the value lives in Firestore (`users/{uid}/data/{key}`) and updates
 * in real time when it changes on another device.
 *
 * - Reads come from the shared in-memory cache fed by one `onSnapshot`
 *   listener per key (see `utils/storage.ts`), so many components using the
 *   same key cost a single Firestore listener.
 * - `setValue` accepts a value or an updater function, like React's setState.
 *   The UI updates instantly; the write syncs in the background (and is
 *   queued while offline).
 *
 * @param key      one of STORAGE_KEYS
 * @param initial  fallback shown before data is loaded. Pass a stable reference.
 */
export function useFirestore<T>(key: DataKey, initial: T) {
  const value = useSyncExternalStore(
    useCallback((cb: () => void) => subscribe(key, cb), [key]),
    () => readValue(key, initial),
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readValue(key, initial);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeValue(key, resolved);
    },
    // `initial` is expected to be a stable constant
    [key],
  );

  return [value, setValue] as const;
}
