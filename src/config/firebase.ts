/**
 * Firebase initialisation.
 *
 * The web config is read from Vite env variables (see `.env.example`).
 * These values are NOT secrets — they identify your Firebase project and are
 * shipped to every browser. Access to data is protected by Firestore
 * security rules (`firestore.rules`), which only let a signed-in user read
 * and write their own documents.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInWithCredential, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True when the minimum config needed to talk to Firebase is present. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

/** Set VITE_USE_FIREBASE_EMULATOR=true to use the local Auth + Firestore emulators. */
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  db = initializeFirestore(app, {
    // Built-in offline persistence (IndexedDB), shared between open tabs.
    // Reads are served from the local cache when offline and writes are
    // queued, then synced automatically when the connection comes back.
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    // Our objects contain optional fields; drop `undefined` instead of throwing.
    ignoreUndefinedProperties: true,
  });

  if (useEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);

    // Emulator-only helper for local testing / automation without the Google
    // popup: `await window.__jtEmulatorSignIn('me@example.com')`.
    // The Auth emulator accepts unsigned fake Google ID tokens. This block is
    // removed from production builds (the env flag is replaced at build time).
    const emulatorAuth = auth;
    (window as unknown as Record<string, unknown>).__jtEmulatorSignIn = (email: string) =>
      signInWithCredential(
        emulatorAuth,
        GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true, name: email.split('@')[0] })),
      );
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db };
