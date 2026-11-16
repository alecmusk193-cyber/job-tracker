import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { auth, googleProvider } from '../config/firebase';
import { setErrorHandler, startSync, stopSync } from '../utils/storage';

interface AuthState {
  user: User | null;
  /** True while we don't know yet whether someone is signed in. */
  loading: boolean;
  /** True once the signed-in user's data has been loaded from Firestore. */
  dataReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Human-readable messages for the most common sign-in errors. */
function authErrorMessage(code: string): string | null {
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null; // user just closed the popup — not an error
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised. Add it in Firebase console → Authentication → Settings → Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled. Enable it in Firebase console → Authentication → Sign-in method.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.';
    default:
      return `Sign-in failed (${code}).`;
  }
}

/**
 * Tracks the Firebase user and starts/stops Firestore sync accordingly.
 * Children only render the app once the user's data is loaded, so nothing
 * can overwrite real data with placeholders.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    setErrorHandler((message) => toast.error(message, { id: message }));
    if (!auth) return;

    // Surface errors from the redirect fallback flow
    getRedirectResult(auth).catch((err) => {
      const msg = authErrorMessage(err.code);
      if (msg) toast.error(msg);
    });

    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      setDataReady(false);
      if (u) {
        await startSync(u);
        if (!cancelled) setDataReady(true);
      } else {
        stopSync();
      }
    });
    return () => {
      cancelled = true;
      unsub();
      stopSync();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string }).code ?? 'unknown';
      // Some mobile browsers / in-app webviews block popups → fall back to a full-page redirect
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      const msg = authErrorMessage(code);
      if (msg) toast.error(msg);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    stopSync(); // detach listeners before the auth token disappears
    await fbSignOut(auth);
    toast.success('Signed out');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, dataReady, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
