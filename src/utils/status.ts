import type { JobStatus } from '../types';

/**
 * Colour configuration per status. Tailwind needs full class names at build
 * time, so we keep them as literal strings here (no string concatenation).
 *
 * Hues come from a colour-blind-validated categorical palette (fixed order:
 * green, blue, orange, teal, amber, violet, pink), with separate steps for dark mode.
 */
export const STATUS_STYLES: Record<
  JobStatus,
  { badge: string; dot: string; column: string; hex: string; hexDark: string }
> = {
  Wishlist: {
    badge: 'bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300',
    dot: 'bg-[#008300] dark:bg-[#0ca30c]',
    column: 'border-t-[#008300]',
    hex: '#008300',
    hexDark: '#0ca30c',
  },
  Applied: {
    badge: 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-[#2a78d6] dark:bg-[#3987e5]',
    column: 'border-t-[#2a78d6]',
    hex: '#2a78d6',
    hexDark: '#3987e5',
  },
  'Phone Screen': {
    badge: 'bg-orange-100 text-orange-800 ring-orange-600/20 dark:bg-orange-500/15 dark:text-orange-300',
    dot: 'bg-[#eb6834] dark:bg-[#d95926]',
    column: 'border-t-[#eb6834]',
    hex: '#eb6834',
    hexDark: '#d95926',
  },
  Technical: {
    badge: 'bg-teal-100 text-teal-800 ring-teal-600/20 dark:bg-teal-500/15 dark:text-teal-300',
    dot: 'bg-[#1baf7a] dark:bg-[#199e70]',
    column: 'border-t-[#1baf7a]',
    hex: '#1baf7a',
    hexDark: '#199e70',
  },
  Onsite: {
    badge: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-[#eda100] dark:bg-[#c98500]',
    column: 'border-t-[#eda100]',
    hex: '#eda100',
    hexDark: '#c98500',
  },
  Offer: {
    badge: 'bg-violet-100 text-violet-800 ring-violet-600/20 dark:bg-violet-500/15 dark:text-violet-300',
    dot: 'bg-[#6250d6] dark:bg-[#9085e9]',
    column: 'border-t-[#6250d6]',
    hex: '#6250d6',
    hexDark: '#9085e9',
  },
  Rejected: {
    badge: 'bg-pink-100 text-pink-800 ring-pink-600/20 dark:bg-pink-500/15 dark:text-pink-300',
    dot: 'bg-[#e87ba4] dark:bg-[#d55181]',
    column: 'border-t-[#e87ba4]',
    hex: '#e87ba4',
    hexDark: '#d55181',
  },
};

export function formatSalary(min?: number, max?: number): string {
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `up to ${fmt(max)}`;
  return '—';
}

/** True once the application has actually been sent (i.e. not on the wishlist). */
export const isApplied = (status: JobStatus) => status !== 'Wishlist';

export const PRIORITY_STYLES = {
  High: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
} as const;

export const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 } as const;
