/**
 * Device-local UI preferences (theme, last opened tab, board/table view).
 *
 * These intentionally stay in localStorage: they describe *this device*
 * (e.g. dark mode on the laptop, light on the phone), are needed before the
 * user signs in, and cost no Firestore reads. All real app data lives in
 * Firestore — see `utils/storage.ts`.
 */

export const PREF_PREFIX = 'jt:';

export const PREF_KEYS = {
  theme: 'theme',
  jobsView: 'jobsView',
  prepTab: 'prepTab',
  docsTab: 'docsTab',
} as const;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export function readPrefRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREF_PREFIX + key);
  } catch {
    return null; // storage blocked (private mode)
  }
}

export function writePref<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREF_PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  listeners.get(key)?.forEach((l) => l());
}

export function subscribePref(key: string, listener: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => listeners.get(key)?.delete(listener);
}

// Keep preferences in sync between tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith(PREF_PREFIX)) listeners.get(e.key.slice(PREF_PREFIX.length))?.forEach((l) => l());
  });
}

/** Read data saved by v1 of the app (localStorage-only) so it can be migrated. */
export function readLegacyData(key: string): unknown | undefined {
  const raw = readPrefRaw(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}
