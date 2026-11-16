import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { STORAGE_PREFIX, subscribe, writeStorage } from '../utils/storage';

/**
 * Parsed-value cache keyed by storage key. useSyncExternalStore requires
 * getSnapshot to return the *same reference* while data is unchanged,
 * so we only re-parse when the raw string actually changes.
 */
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

function getSnapshot<T>(key: string, initial: T): T {
  const raw = readRaw(key);
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

/**
 * React state persisted in localStorage and shared between every component
 * (and browser tab) that uses the same key.
 *
 * @param key      storage key (prefixed automatically with "jt:")
 * @param initial  value used — and persisted — when nothing is stored yet.
 *                 Pass a stable reference (module constant) to avoid re-renders.
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const value = useSyncExternalStore(
    useCallback((cb) => subscribe(key, cb), [key]),
    () => getSnapshot(key, initial),
  );

  // Seed storage with the initial value on first run so sample data persists.
  useEffect(() => {
    if (readRaw(key) === null) writeStorage(key, initial);
  }, [key]);

  /** Same API as React's setState: accepts a value or an updater function. */
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = getSnapshot(key, initial);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      writeStorage(key, resolved);
    },
    [key],
  );

  return [value, setValue] as const;
}
