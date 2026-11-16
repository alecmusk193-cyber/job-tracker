/**
 * Tiny localStorage wrapper with a pub/sub layer so that every component
 * using the same key stays in sync (including across browser tabs).
 */

export const STORAGE_PREFIX = 'jt:';

/** All keys the app persists. Used by backup export/import. */
export const STORAGE_KEYS = {
  jobs: 'jobs',
  activities: 'activities',
  flashcards: 'flashcards',
  checklist: 'checklist',
  study: 'study',
  documents: 'documents',
  profile: 'profile',
  theme: 'theme',
} as const;

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

const fullKey = (key: string) => STORAGE_PREFIX + key;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    // Storage blocked (private mode) or corrupted JSON → use fallback
    return fallback;
  }
}

export function hasStorage(key: string): boolean {
  try {
    return window.localStorage.getItem(fullKey(key)) !== null;
  } catch {
    return false;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
  } catch (err) {
    console.error('Failed to write localStorage', err);
  }
  notify(key);
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch {
    /* ignore */
  }
  notify(key);
}

export function subscribe(key: string, listener: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => listeners.get(key)?.delete(listener);
}

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

// Sync between tabs: the "storage" event only fires in *other* tabs.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith(STORAGE_PREFIX)) notify(e.key.slice(STORAGE_PREFIX.length));
  });
}

// ---------- Backup helpers ----------

/** Collect every app key into a single JSON-serialisable object. */
export function exportAll() {
  const data: Record<string, unknown> = {};
  Object.values(STORAGE_KEYS).forEach((k) => {
    if (hasStorage(k)) data[k] = readStorage(k, null);
  });
  return { version: 1 as const, exportedAt: new Date().toISOString(), data };
}

/** Restore keys from a backup. Unknown keys are ignored for safety. */
export function importAll(backup: unknown): number {
  if (!backup || typeof backup !== 'object' || !('data' in backup)) {
    throw new Error('Invalid backup file');
  }
  const data = (backup as { data: Record<string, unknown> }).data;
  const allowed = new Set<string>(Object.values(STORAGE_KEYS));
  let count = 0;
  Object.entries(data).forEach(([k, v]) => {
    if (allowed.has(k)) {
      writeStorage(k, v);
      count++;
    }
  });
  return count;
}

/** Remove every key (used by "Reset" — sample data is re-seeded on reload). */
export function clearAll() {
  Object.values(STORAGE_KEYS).forEach((k) => {
    if (k !== 'theme') removeStorage(k);
  });
}
