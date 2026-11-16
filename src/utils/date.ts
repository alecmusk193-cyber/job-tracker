/** Date helpers that work on local time and "YYYY-MM-DD" strings. */

const pad = (n: number) => String(n).padStart(2, '0');

/** Format a Date as YYYY-MM-DD in local time. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function today(): string {
  return toISODate(new Date());
}

/** Return a YYYY-MM-DD string offset by `days` from today. */
export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Return a datetime-local compatible string ("YYYY-MM-DDTHH:mm") offset from now. */
export function dateTimeFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${toISODate(d)}T${pad(hour)}:${pad(minute)}`;
}

/** Monday of the week containing `d`. */
export function startOfWeek(d: Date = new Date()): string {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - day);
  return toISODate(copy);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Parse "YYYY-MM-DD" or ISO timestamps to a Date (local time for date-only strings). */
export function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

export function formatDate(value?: string, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return '—';
  return parseDate(value).toLocaleDateString(undefined, opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  return parseDate(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Whole days between today and `value` (negative = past). */
export function daysUntil(value: string): number {
  const target = parseDate(value);
  const now = new Date();
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86_400_000);
}

/** Human friendly "2 hours ago" style label. */
export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  const units: [number, string][] = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
    [2592000, 'month'],
  ];
  let label = '';
  for (let i = units.length - 1; i >= 0; i--) {
    const [secs, name] = units[i];
    if (diff >= secs) {
      const n = Math.floor(diff / secs);
      label = `${n} ${name}${n > 1 ? 's' : ''} ago`;
      break;
    }
  }
  return label;
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
