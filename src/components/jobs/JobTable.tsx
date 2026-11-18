import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Job, JobStatus } from '../../types';
import { JOB_STATUSES } from '../../types';
import { formatDate } from '../../utils/date';
import { formatSalary, STATUS_STYLES } from '../../utils/status';

type SortKey = 'company' | 'position' | 'status' | 'dateApplied' | 'deadline' | 'salaryMax';

interface Props {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}

/** Sortable table view. Status can be changed inline via a select. */
export default function JobTable({ jobs, onEdit, onDelete, onStatusChange }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'dateApplied', dir: -1 });

  const sorted = useMemo(() => {
    const val = (j: Job): string | number => {
      if (sort.key === 'status') return JOB_STATUSES.indexOf(j.status);
      if (sort.key === 'salaryMax') return j.salaryMax ?? j.salaryMin ?? 0;
      return (j[sort.key] ?? '').toString().toLowerCase();
    };
    return [...jobs].sort((a, b) => (val(a) > val(b) ? sort.dir : val(a) < val(b) ? -sort.dir : 0));
  }, [jobs, sort]);

  const toggle = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const Th = ({ k, children, className = '' }: { k: SortKey; children: string; className?: string }) => (
    <th className={`px-4 py-3 text-left ${className}`}>
      <button onClick={() => toggle(k)} className="inline-flex items-center gap-1 font-medium hover:text-slate-900 dark:hover:text-white">
        {children}
        {sort.key === k ? sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
      </button>
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <tr>
              <Th k="company">Company</Th>
              <Th k="position">Position</Th>
              <Th k="status">Status</Th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <Th k="salaryMax">Salary</Th>
              <Th k="dateApplied">Applied</Th>
              <Th k="deadline">Deadline</Th>
              <th className="px-4 py-3 text-left font-medium">Tags</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-1.5">
                    {j.company}
                    {j.url && (
                      <a href={j.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-brand-600" aria-label="Open job posting">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  {j.contact.name && <p className="text-xs font-normal text-slate-500">{j.contact.name}</p>}
                </td>
                <td className="px-4 py-3">{j.position}</td>
                <td className="px-4 py-3">
                  {/* Inline status select styled as a badge */}
                  <select
                    value={j.status}
                    onChange={(e) => onStatusChange(j.id, e.target.value as JobStatus)}
                    className={`badge cursor-pointer border-0 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-500 ${STATUS_STYLES[j.status].badge}`}
                    aria-label={`Status for ${j.company}`}
                  >
                    {JOB_STATUSES.map((s) => (
                      <option key={s} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {j.location}
                  {j.city && <span className="block text-xs text-slate-400">{j.city}</span>}
                </td>
                <td className="px-4 py-3 tabular-nums">{formatSalary(j.salaryMin, j.salaryMax)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {j.status === 'Wishlist' ? (
                    <span className="text-slate-500 dark:text-slate-400" title={`Saved ${formatDate(j.dateApplied)}`}>
                      {j.plannedDate ? `Plan ${formatDate(j.plannedDate)}` : 'Not yet'}
                    </span>
                  ) : (
                    formatDate(j.dateApplied)
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(j.deadline)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {j.tags.map((t) => (
                      <span key={t} className="chip">#{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button className="btn-icon h-8 w-8" onClick={() => onEdit(j)} aria-label={`Edit ${j.company}`}>
                      <Pencil size={14} />
                    </button>
                    <button className="btn-icon h-8 w-8 hover:text-rose-600" onClick={() => onDelete(j)} aria-label={`Delete ${j.company}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
