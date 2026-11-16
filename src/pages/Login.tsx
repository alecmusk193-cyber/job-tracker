import { motion } from 'framer-motion';
import { Briefcase, Cloud, LayoutDashboard, ShieldCheck, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import FullScreenLoader from '../components/common/FullScreenLoader';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: LayoutDashboard, text: 'Kanban board, interview prep & study plan' },
  { icon: Cloud, text: 'Real-time sync across all your devices' },
  { icon: WifiOff, text: 'Works offline — changes sync when you reconnect' },
  { icon: ShieldCheck, text: 'Your data is private to your Google account' },
];

/** Official multi-colour Google "G" mark. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;

  if (loading) return <FullScreenLoader />;
  // Already signed in (or just finished signing in) → go to the requested page / dashboard
  if (user) return <Navigate to={from && from !== '/login' ? from : '/'} replace />;

  const handleClick = async () => {
    setBusy(true);
    await signInWithGoogle();
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-violet-50 px-4 py-10 dark:from-slate-950 dark:via-slate-950 dark:to-brand-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        className="card w-full max-w-md p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Briefcase size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Job Tracker</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Land your next role</p>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-semibold">Welcome 👋</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to access your applications from any device.</p>

        <ul className="mt-6 space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <button
          onClick={handleClick}
          disabled={busy}
          className="btn mt-8 w-full border border-slate-300 bg-white py-2.5 text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          First sign-in? Data from the old offline version on this browser is imported automatically.
        </p>
      </motion.div>
    </div>
  );
}
