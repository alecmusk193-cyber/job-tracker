import clsx from 'clsx';
import { CalendarClock, ExternalLink, MapPin, Pencil, Trash2 } from 'lucide-react';
import type { Job } from '../../types';
import { daysUntil, formatDate, formatDateTime } from '../../utils/date';
import { formatSalary } from '../../utils/status';

interface Props {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  dragging?: boolean;
}

/** Compact card used inside Kanban columns. */
export default function JobCard({ job, onEdit, onDelete, dragging }: Props) {
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
        <span>Applied {formatDate(job.dateApplied, { month: 'short', day: 'numeric' })}</span>
        <div className="flex items-center gap-2">
          {deadlineSoon && <span className="font-medium text-rose-600 dark:text-rose-400">Due in {daysUntil(job.deadline!)}d</span>}
          {job.url && (
            <a href={job.url} target="_blank" rel="noreferrer" className="hover:text-brand-600" aria-label="Open job posting">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
