import type { JobStatus } from '../types';

/**
 * Colour configuration per status. Tailwind needs full class names at build
 * time, so we keep them as literal strings here (no string concatenation).
 *
 * Hues come from a colour-blind-validated categorical palette (fixed order:
 * blue, orange, teal, amber, violet, pink), with separate steps for dark mode.
 */
export const STATUS_STYLES: Record<
  JobStatus,
  { badge: string; dot: string; column: string; hex: string; hexDark: string }
> = {
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
