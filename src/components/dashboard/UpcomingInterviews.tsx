import { CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import { daysUntil, formatDate, formatDateTime } from '../../utils/date';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

/** Next scheduled interviews + approaching deadlines, soonest first. */
export default function UpcomingInterviews({ jobs }: { jobs: Job[] }) {
  const now = new Date();
  const interviews = jobs
    .filter((j) => j.interviewDate && new Date(j.interviewDate) >= now)
    .sort((a, b) => a.interviewDate!.localeCompare(b.interviewDate!));

  const deadlines = jobs
    .filter((j) => j.deadline && daysUntil(j.deadline) >= 0 && daysUntil(j.deadline) <= 14 && j.status !== 'Rejected')
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Upcoming interviews</h3>
        <Link to="/prep" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          Prepare →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {interviews.length === 0 && (
          <EmptyState icon={CalendarClock} title="No interviews scheduled" description="Add an interview date to a job to see it here." />
        )}
        {interviews.map((j) => {
          const d = daysUntil(j.interviewDate!);
          return (
            <div key={j.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                <span className="text-lg font-bold leading-none">{d}</span>
                <span className="text-[10px] uppercase">{d === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{j.company}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {j.position} · {formatDateTime(j.interviewDate)}
                </p>
              </div>
              <div className="hidden sm:block">
                <StatusBadge status={j.status} />
              </div>
            </div>
          );
        })}
      </div>

      {deadlines.length > 0 && (
        <>
          <h4 className="mt-6 text-sm font-semibold text-slate-500 dark:text-slate-400">Deadlines in the next 2 weeks</h4>
          <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
            {deadlines.map((j) => (
              <li key={j.id} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate">
                  <span className="font-medium">{j.company}</span> — {j.position}
                </span>
                <span className="ml-2 shrink-0 text-slate-500 dark:text-slate-400">{formatDate(j.deadline, { month: 'short', day: 'numeric' })}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
