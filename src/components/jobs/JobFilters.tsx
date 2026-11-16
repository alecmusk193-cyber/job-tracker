import { Search, X } from 'lucide-react';
import type { JobStatus, WorkLocation } from '../../types';
import { JOB_STATUSES } from '../../types';

export interface Filters {
  search: string;
  status: JobStatus | 'All';
  location: WorkLocation | 'All';
  tag: string;
}

export const DEFAULT_FILTERS: Filters = { search: '', status: 'All', location: 'All', tag: '' };

/** Search box + filter selects shown above both Kanban and table views. */
export default function JobFilters({
  filters,
  onChange,
  allTags,
  showStatus,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  allTags: string[];
  showStatus: boolean;
}) {
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:min-w-[220px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search company, position, notes…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          aria-label="Search jobs"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:flex">
        {showStatus && (
          <select className="input sm:w-40" value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as Filters['status'] })} aria-label="Filter by status">
            <option value="All">All statuses</option>
            {JOB_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
        <select className="input sm:w-36" value={filters.location} onChange={(e) => onChange({ ...filters, location: e.target.value as Filters['location'] })} aria-label="Filter by work type">
          <option value="All">All types</option>
          <option>Remote</option>
          <option>Onsite</option>
          <option>Hybrid</option>
        </select>
        <select className="input sm:w-36" value={filters.tag} onChange={(e) => onChange({ ...filters, tag: e.target.value })} aria-label="Filter by tag">
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>
      </div>
      {dirty && (
        <button className="btn-ghost" onClick={() => onChange(DEFAULT_FILTERS)}>
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
