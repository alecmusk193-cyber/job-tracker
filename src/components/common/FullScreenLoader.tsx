import { Briefcase } from 'lucide-react';

/** Centered spinner used while auth state / user data is loading. */
export default function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 dark:border-slate-800 dark:border-t-brand-400" />
        <Briefcase size={20} className="text-brand-600 dark:text-brand-400" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
