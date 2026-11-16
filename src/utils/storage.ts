/**
 * Firestore-backed data store.
 *
 * Layout: every data set is ONE document  users/{uid}/data/{key}  shaped
 * `{ value: <the array / object>, updatedAt }`. One document per key keeps
 * reads cheap (7 documents per session + 1 read per remote change) — far
 * below the Spark plan's 50K reads/day.
 *
 * How it works
 * - `startSync(user)` (called on sign-in) attaches one `onSnapshot` listener
 *   per key. Every change — local or from another device — lands in an
 *   in-memory cache and notifies subscribed React components.
 * - `readValue` / `writeValue` are synchronous for the UI: writes update the
 *   cache immediately (optimistic) and are sent to Firestore in the
 *   background. Offline, Firestore's persistent cache (IndexedDB) queues the
 *   writes and serves reads, then syncs when the connection returns.
 * - A brand-new account is seeded with data migrated from the old
 *   localStorage version of the app, or with the demo data.
 */
import type { User } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, writeBatch, type Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_DATA } from '../data/defaults';
import { readLegacyData } from './localPrefs';

/** Every data set synced to Firestore. */
export const STORAGE_KEYS = {
  jobs: 'jobs',
  activities: 'activities',
  flashcards: 'flashcards',
  checklist: 'checklist',
  study: 'study',
  documents: 'documents',
  profile: 'profile',
} as const;

export type DataKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export const DATA_KEYS = Object.values(STORAGE_KEYS) as DataKey[];

interface Entry {
  value: unknown;
  hasValue: boolean; // false until the first snapshot (or default) arrives
  ready: boolean; // true once we know the real server/cache state
  pending: boolean; // local writes not yet acknowledged by the server
  fromCache: boolean;
}

type Listener = () => void;

let currentUid: string | null = null;
let unsubscribers: Unsubscribe[] = [];
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<Listener>>();
const statusListeners = new Set<Listener>();
let errorHandler: (message: string) => void = (m) => console.error(m);

const emptyEntry = (): Entry => ({ value: undefined, hasValue: false, ready: false, pending: false, fromCache: true });

function entry(key: string): Entry {
  if (!entries.has(key)) entries.set(key, emptyEntry());
  return entries.get(key)!;
}

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
  statusListeners.forEach((l) => l());
}

function docRef(key: string) {
  if (!db || !currentUid) throw new Error('Not signed in');
  return doc(db, 'users', currentUid, 'data', key);
}

/** Show write/permission errors to the user (wired to toasts in AuthProvider). */
export function setErrorHandler(fn: (message: string) => void) {
  errorHandler = fn;
}

// ---------------------------------------------------------------- sync lifecycle

/**
 * Attach realtime listeners for every key. Resolves once each key has
 * real data (or after `timeoutMs`, e.g. first launch while offline), so the
 * UI never edits placeholder data that could overwrite the user's real data.
 */
export function startSync(user: User, timeoutMs = 6000): Promise<void> {
  stopSync();
  currentUid = user.uid;

  return new Promise((resolve) => {
    let resolved = false;
    let timer = 0;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        window.clearTimeout(timer);
        resolve();
      }
    };
    const checkAllReady = () => DATA_KEYS.every((k) => entry(k).ready) && finish();
    timer = window.setTimeout(() => {
      DATA_KEYS.forEach((k) => {
        const e = entry(k);
        if (!e.hasValue) Object.assign(e, { value: seedValue(k, user), hasValue: true });
        e.ready = true;
        notify(k);
      });
      finish();
    }, timeoutMs);

    DATA_KEYS.forEach((key) => {
      const unsub = onSnapshot(
        docRef(key),
        { includeMetadataChanges: true }, // so we also see "pending → synced"
        (snap) => {
          const e = entry(key);
          e.pending = snap.metadata.hasPendingWrites;
          e.fromCache = snap.metadata.fromCache;

          if (snap.exists() && snap.data().value !== undefined) {
            e.value = snap.data().value;
            e.hasValue = true;
            e.ready = true;
          } else if (!snap.metadata.fromCache) {
            // Confirmed by the server: no (usable) data for `key` yet → seed it.
            const initial = seedValue(key, user);
            e.value = initial;
            e.hasValue = true;
            e.ready = true;
            setDoc(docRef(key), { value: initial, updatedAt: serverTimestamp() }).catch(handleError);
          }
          // else: not in the local cache and the server hasn't answered yet → keep waiting

          notify(key);
          checkAllReady();
        },
        (err) => {
          handleError(err);
          entry(key).ready = true;
          checkAllReady();
        },
      );
      unsubscribers.push(unsub);
    });
  });
}

/** Detach listeners and forget the cached data (on sign-out / user switch). */
export function stopSync() {
  unsubscribers.forEach((u) => u());
  unsubscribers = [];
  currentUid = null;
  entries.clear();
  DATA_KEYS.forEach(notify);
}

/** First value for a new account: old localStorage data if any, else demo data. */
function seedValue(key: DataKey, user: User): unknown {
  const legacy = readLegacyData(key);
  if (legacy !== undefined) return legacy;
  if (key === 'profile') return { name: user.displayName ?? '', email: user.email ?? '' };
  return DEFAULT_DATA[key];
}

function handleError(err: unknown) {
  const code = (err as { code?: string })?.code;
  const message =
    code === 'permission-denied'
      ? 'Firestore denied access — check your security rules.'
      : code === 'resource-exhausted'
        ? 'Firestore quota exceeded for today.'
        : `Sync error: ${(err as Error)?.message ?? String(err)}`;
  errorHandler(message);
}

// ---------------------------------------------------------------- read / write

export function subscribe(key: string, listener: Listener): () => void {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  return () => listeners.get(key)?.delete(listener);
}

/**
 * Current value for `key`, or `fallback` while nothing is loaded.
 * Stable reference between changes. If the stored value has the wrong shape
 * (e.g. a document edited by hand in the console), the fallback is returned
 * instead so the UI never crashes on unexpected data.
 */
export function readValue<T>(key: string, fallback: T): T {
  const e = entries.get(key);
  if (!e?.hasValue) return fallback;
  const v = e.value;
  if (Array.isArray(fallback) && !Array.isArray(v)) return fallback;
  if (fallback !== null && typeof fallback === 'object' && !Array.isArray(fallback) && (v === null || typeof v !== 'object' || Array.isArray(v))) {
    return fallback;
  }
  return v as T;
}

/** Optimistically update the cache and persist to Firestore in the background. */
export function writeValue<T>(key: string, value: T): void {
  if (!currentUid) return;
  Object.assign(entry(key), { value, hasValue: true, pending: true });
  notify(key);
  // Not awaited: offline, the promise only resolves once the write reaches the server.
  setDoc(docRef(key), { value, updatedAt: serverTimestamp() }).catch(handleError);
}

// ---------------------------------------------------------------- sync status (header indicator)

export type SyncStatus = 'offline' | 'syncing' | 'synced';

export function getSyncStatus(): SyncStatus {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
  const all = DATA_KEYS.map((k) => entries.get(k));
  if (all.some((e) => e?.pending)) return 'syncing';
  return 'synced';
}

export function subscribeStatus(listener: Listener): () => void {
  statusListeners.add(listener);
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    statusListeners.delete(listener);
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

// ---------------------------------------------------------------- backup helpers

/** Collect every data set into one JSON-serialisable object. */
export function exportAll() {
  const data: Record<string, unknown> = {};
  DATA_KEYS.forEach((k) => {
    const e = entries.get(k);
    if (e?.hasValue) data[k] = e.value;
  });
  return { version: 1 as const, exportedAt: new Date().toISOString(), data };
}

/** Write several keys at once (atomic batch). */
function writeMany(values: Partial<Record<DataKey, unknown>>) {
  if (!db || !currentUid) throw new Error('Not signed in');
  const batch = writeBatch(db);
  Object.entries(values).forEach(([k, v]) => {
    Object.assign(entry(k), { value: v, hasValue: true, pending: true });
    batch.set(docRef(k), { value: v, updatedAt: serverTimestamp() });
    notify(k);
  });
  batch.commit().catch(handleError);
}

/**
 * Restore keys from a backup file (also accepts backups made by the old
 * localStorage version). Unknown keys — e.g. "theme" — are ignored.
 */
export function importAll(backup: unknown): number {
  if (!backup || typeof backup !== 'object' || !('data' in backup)) {
    throw new Error('Invalid backup file');
  }
  const data = (backup as { data: Record<string, unknown> }).data;
  const allowed = new Set<string>(DATA_KEYS);
  const values: Partial<Record<DataKey, unknown>> = {};
  Object.entries(data).forEach(([k, v]) => {
    if (allowed.has(k) && v !== null && v !== undefined) values[k as DataKey] = v;
  });
  writeMany(values);
  return Object.keys(values).length;
}

/** Replace everything (except the profile) with the demo data. */
export function restoreSampleData() {
  const rest: Partial<Record<DataKey, unknown>> = { ...DEFAULT_DATA };
  delete rest.profile;
  writeMany(rest);
}

/** Empty every list (fresh start). */
export function clearAllData() {
  writeMany({ jobs: [], activities: [], flashcards: [], study: [], documents: [] });
}

/** Approximate size of the user's data (Firestore limit: 1 MiB per document). */
export function dataSize(): { total: number; largest: { key: string; bytes: number } } {
  let total = 0;
  let largest = { key: '', bytes: 0 };
  DATA_KEYS.forEach((k) => {
    const e = entries.get(k);
    if (!e?.hasValue) return;
    const bytes = new Blob([JSON.stringify(e.value)]).size;
    total += bytes;
    if (bytes > largest.bytes) largest = { key: k, bytes };
  });
  return { total, largest };
}
