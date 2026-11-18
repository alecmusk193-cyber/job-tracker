import clsx from 'clsx';
import { CalendarClock, CalendarDays, ExternalLink, MapPin, Pencil, Send, Trash2 } from 'lucide-react';
import type { Job } from '../../types';
import { daysUntil, formatDate, formatDateTime } from '../../utils/date';
import { formatSalary, PRIORITY_STYLES } from '../../utils/status';

interface Props {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  /** Wishlist only: mark as applied today. */
  onMarkApplied?: (job: Job) => void;
  dragging?: boolean;
}

/** Compact card used inside Kanban columns. */
export default function JobCard({ job, onEdit, onDelete, onMarkApplied, dragging }: Props) {
  const wishlist = job.status === 'Wishlist';
  const planDays = job.plannedDate ? daysUntil(job.plannedDate) : null;
  const deadlineSoon = job.deadline && daysUntil(job.deadline) >= 0 && daysUntil(job.deadline) <= 7;
  const upcoming = job.interviewDate && new Date(job.interviewDate) >= new Date();

  return (
    <div
      className={clsx(
        'group rounded-xl border border-slate-200 bg-white p-3.5 transition-shadow dark:border-slate-700 dark:bg-slate-800',
        dragging ? 'rotate-1 shadow-xl ring-2 ring-brand-500' : 'shadow-sm hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{job.company}</p>
          <p className="truncate text-sm text-slate-600 dark:text-slate-300">{job.position}</p>
        </div>
        <div className="flex shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button className="btn-icon h-7 w-7" onClick={() => onEdit(job)} aria-label={`Edit ${job.company}`}>
            <Pencil size={14} />
          </button>
          <button className="btn-icon h-7 w-7 hover:text-rose-600" onClick={() => onDelete(job)} aria-label={`Delete ${job.company}`}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} /> {job.location}
          {job.city ? ` · ${job.city}` : ''}
        </span>
        {(job.salaryMin || job.salaryMax) && <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>}
      </div>

      {wishlist && (job.priority || job.plannedDate) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {job.priority && <span className={`rounded px-1.5 py-0.5 font-semibold ${PRIORITY_STYLES[job.priority]}`}>{job.priority}</span>}
          {job.plannedDate && (
            <span
              className={`inline-flex items-center gap-1 ${
                planDays !== null && planDays < 0 ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <CalendarDays size={12} /> Plan {formatDate(job.plannedDate, { month: 'short', day: 'numeric' })}
              {planDays !== null && planDays < 0 && ` (${-planDays}d overdue)`}
            </span>
          )}
        </div>
      )}

      {upcoming && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <CalendarClock size={12} /> {formatDateTime(job.interviewDate)}
        </p>
      )}

      {job.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.tags.slice(0, 4).map((t) => (
            <span key={t} className="chip">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <span>
          {wishlist ? 'Saved' : 'Applied'} {formatDate(job.dateApplied, { month: 'short', day: 'numeric' })}
        </span>
        <div className="flex items-center gap-2">
          {deadlineSoon && <span className="font-medium text-rose-600 dark:text-rose-400">Due in {daysUntil(job.deadline!)}d</span>}
          {job.url && (
            <a href={job.url} target="_blank" rel="noreferrer" className="hover:text-brand-600" aria-label="Open job posting">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
      {wishlist && onMarkApplied && (
        <button
          className="btn mt-3 w-full border border-[#008300]/30 bg-green-50 py-1.5 text-xs text-green-800 hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20"
          onClick={() => onMarkApplied(job)}
        >
          <Send size={13} /> Mark as applied
        </button>
      )}
    </div>
  );
}
