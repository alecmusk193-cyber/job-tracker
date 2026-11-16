import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { auth, db } from '../../config/firebase';

interface State {
  error: Error | null;
}

/**
 * Catches render errors anywhere below it and shows what went wrong instead
 * of a blank page, with recovery actions (reload, clear the offline cache,
 * sign out).
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  private clearCache = async () => {
    try {
      if (db) {
        await terminate(db);
        await clearIndexedDbPersistence(db);
      }
    } catch (err) {
      console.error(err);
    }
    window.location.reload();
  };

  private signOut = async () => {
    try {
      await auth?.signOut();
    } finally {
      window.location.hash = '#/login';
      window.location.reload();
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="card w-full max-w-xl p-6 sm:p-8">
          <h1 className="text-xl font-semibold">Something went wrong 😕</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            The app hit an unexpected error. Your data in the cloud is safe. Try reloading; if it keeps happening, send this message to the
            developer:
          </p>
          <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-xs text-rose-700 dark:bg-slate-800 dark:text-rose-300">
            {error.name}: {error.message}
            {error.stack ? `\n\n${error.stack.split('\n').slice(1, 6).join('\n')}` : ''}
          </pre>
          <div className="mt-6 flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button className="btn-secondary" onClick={this.clearCache}>
              Clear offline cache & reload
            </button>
            {auth?.currentUser && (
              <button className="btn-ghost" onClick={this.signOut}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
