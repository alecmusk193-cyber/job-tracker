import { Bookmark, Briefcase, Columns3, FileDown, List, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import JobFilters, { DEFAULT_FILTERS, type Filters } from '../components/jobs/JobFilters';
import JobForm from '../components/jobs/JobForm';
import JobTable from '../components/jobs/JobTable';
import KanbanBoard from '../components/jobs/KanbanBoard';
import { useJobs } from '../hooks/useJobs';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PREF_KEYS } from '../utils/localPrefs';
import type { Job, JobInput, JobStatus } from '../types';
import { downloadFile, jobsToCSV } from '../utils/csv';
import { today } from '../utils/date';

type View = 'kanban' | 'table';

export default function Jobs() {
  const { jobs, addJob, updateJob, moveJob, markApplied, deleteJob } = useJobs();
  const [view, setView] = useLocalStorage<View>(PREF_KEYS.jobsView, 'kanban');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [editing, setEditing] = useState<Job | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JobStatus>('Applied');
  const [toDelete, setToDelete] = useState<Job | null>(null);
  const [params, setParams] = useSearchParams();

  // Dashboard "Add application" button links here with ?new=1
  useEffect(() => {
    if (params.get('new')) {
      setEditing(null);
      setFormOpen(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const allTags = useMemo(() => Array.from(new Set(jobs.flatMap((j) => j.tags))).sort(), [jobs]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (view === 'table' && filters.status !== 'All' && j.status !== filters.status) return false;
      if (filters.location !== 'All' && j.location !== filters.location) return false;
      if (filters.tag && !j.tags.includes(filters.tag)) return false;
      if (!q) return true;
      return [j.company, j.position, j.notes, j.city, j.contact.name, ...j.tags].some((v) => v?.toLowerCase().includes(q));
    });
  }, [jobs, filters, view]);

  const openNew = (status: JobStatus = 'Applied') => {
    setEditing(null);
    setNewStatus(status);
    setFormOpen(true);
  };

  const handleMarkApplied = (job: Job) => {
    markApplied(job.id);
    toast.success(`Applied to ${job.company} 🚀`);
  };
  const openEdit = (job: Job) => {
    setEditing(job);
    setFormOpen(true);
  };

  const handleSubmit = (data: JobInput) => {
    if (editing) {
      updateJob(editing.id, data);
      toast.success(`Updated ${data.company}`);
    } else {
      addJob(data);
      toast.success(data.status === 'Wishlist' ? `Saved ${data.company} to wishlist` : `Added ${data.company}`);
    }
    setFormOpen(false);
  };

  const handleMove = (id: string, status: JobStatus, beforeId?: string) => {
    const job = jobs.find((j) => j.id === id);
    moveJob(id, status, beforeId);
    if (job && job.status !== status) {
      if (status === 'Offer') toast.success(`${job.company}: Offer! 🎉`);
      else if (job.status === 'Wishlist' && status === 'Applied') toast.success(`Applied to ${job.company} 🚀`);
      else toast(`${job.company} → ${status}`);
    }
  };

  const handleStatusChange = (id: string, status: JobStatus) => {
    const job = jobs.find((j) => j.id === id);
    updateJob(id, { status });
    if (job) toast.success(`${job.company} → ${status}`);
  };

  const exportCSV = () => {
    downloadFile(jobsToCSV(filtered), `job-applications-${today()}.csv`, 'text/csv;charset=utf-8');
    toast.success(`Exported ${filtered.length} jobs to CSV`);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Applications</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} of {jobs.length} shown · {view === 'kanban' ? 'drag cards between columns to update status' : 'click a header to sort'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher */}
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700" role="tablist">
            {(
              [
                ['kanban', Columns3, 'Board'],
                ['table', List, 'Table'],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          <button className="btn-secondary" onClick={exportCSV} disabled={!filtered.length}>
            <FileDown size={16} /> CSV
          </button>
          <button className="btn-secondary" onClick={() => openNew('Wishlist')} title="Save a job you plan to apply for">
            <Bookmark size={16} /> Wishlist
          </button>
          <button className="btn-primary" onClick={() => openNew()}>
            <Plus size={16} /> Add job
          </button>
        </div>
      </div>

      <JobFilters filters={filters} onChange={setFilters} allTags={allTags} showStatus={view === 'table'} />

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start tracking your job search by adding your first application."
          action={
            <button className="btn-primary" onClick={() => openNew()}>
              <Plus size={16} /> Add your first job
            </button>
          }
        />
      ) : view === 'kanban' ? (
        <KanbanBoard jobs={filtered} onMove={handleMove} onEdit={openEdit} onDelete={setToDelete} onMarkApplied={handleMarkApplied} />
      ) : filtered.length ? (
        <JobTable jobs={filtered} onEdit={openEdit} onDelete={setToDelete} onStatusChange={handleStatusChange} />
      ) : (
        <EmptyState icon={Briefcase} title="No matches" description="Try changing your search or filters." />
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? `Edit ${editing.company}` : newStatus === 'Wishlist' ? 'Save to wishlist' : 'New application'}>
        <JobForm key={editing?.id ?? `new-${newStatus}`} initial={editing} defaultStatus={newStatus} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete application?"
        message={toDelete ? `"${toDelete.position}" at ${toDelete.company} will be permanently removed.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteJob(toDelete.id);
            toast.success(`Deleted ${toDelete.company}`);
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}
