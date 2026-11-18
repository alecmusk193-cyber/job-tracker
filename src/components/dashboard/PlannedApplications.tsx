import { Bookmark, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useJobs } from '../../hooks/useJobs';
import type { Job } from '../../types';
import { daysUntil, formatDate } from '../../utils/date';
import { PRIORITY_RANK, PRIORITY_STYLES } from '../../utils/status';
import EmptyState from '../common/EmptyState';

/** Sort wishlist: planned date (soonest / overdue first), then priority, then deadline. */
export function sortWishlist(jobs: Job[]): Job[] {
  const key = (j: Job) => j.plannedDate ?? j.deadline ?? '9999-12-31';
  return jobs
    .filter((j) => j.status === 'Wishlist')
    .sort(
      (a, b) =>
        key(a).localeCompare(key(b)) || PRIORITY_RANK[a.priority ?? 'Medium'] - PRIORITY_RANK[b.priority ?? 'Medium'],
    );
}

/** Human label for a planned date relative to today. */
function planLabel(date?: string): { text: string; cls: string } | null {
  if (!date) return null;
  const d = daysUntil(date);
  if (d < 0) return { text: `${-d}d overdue`, cls: 'text-rose-600 dark:text-rose-400' };
  if (d === 0) return { text: 'today', cls: 'text-amber-600 dark:text-amber-400' };
  if (d === 1) return { text: 'tomorrow', cls: 'text-amber-600 dark:text-amber-400' };
  return { text: `in ${d}d · ${formatDate(date, { month: 'short', day: 'numeric' })}`, cls: 'text-slate-500 dark:text-slate-400' };
}

/** Dashboard card: jobs you plan to apply to ("dự tính apply"), with a one-click "Applied" action. */
export default function PlannedApplications({ jobs, limit = 5 }: { jobs: Job[]; limit?: number }) {
  const { markApplied } = useJobs();
  const list = sortWishlist(jobs);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Bookmark size={16} className="text-[#008300] dark:text-[#0ca30c]" /> Planned applications
          {list.length > 0 && <span className="chip">{list.length}</span>}
        </h3>
        <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          View all →
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Bookmark} title="Wishlist is empty" description="Save jobs you plan to apply for with status “Wishlist”." />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {list.slice(0, limit).map((j) => {
            const plan = planLabel(j.plannedDate);
            const deadlineSoon = j.deadline && daysUntil(j.deadline) >= 0 && daysUntil(j.deadline) <= 7;
            return (
              <li key={j.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-medium">
                    {j.company}
                    {j.priority && <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[j.priority]}`}>{j.priority}</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {j.position}
                    {plan && (
                      <>
                        {' · '}
                        <span className={plan.cls}>Plan {plan.text}</span>
                      </>
                    )}
                    {deadlineSoon && <span className="text-rose-600 dark:text-rose-400"> · closes in {daysUntil(j.deadline!)}d</span>}
                  </p>
                </div>
                <button
                  className="btn-secondary shrink-0 px-2.5 py-1.5 text-xs"
                  onClick={() => {
                    markApplied(j.id);
                    toast.success(`Applied to ${j.company} 🚀`);
                  }}
                >
                  <Send size={13} /> Applied
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {list.length > limit && <p className="mt-2 text-xs text-slate-500">+{list.length - limit} more in the Job Tracker</p>}
    </div>
  );
}
