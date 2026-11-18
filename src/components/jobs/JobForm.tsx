import { useState, type FormEvent } from 'react';
import type { Job, JobInput, JobStatus, Priority, WorkLocation } from '../../types';
import { JOB_STATUSES, PRIORITIES } from '../../types';
import { today } from '../../utils/date';

const EMPTY: JobInput = {
  company: '',
  position: '',
  location: 'Remote',
  city: '',
  url: '',
  salaryMin: undefined,
  salaryMax: undefined,
  status: 'Applied',
  dateApplied: today(),
  deadline: '',
  interviewDate: '',
  notes: '',
  tags: [],
  contact: { name: '', email: '' },
};

interface Props {
  initial?: Job | null;
  /** Status pre-selected for a new job (e.g. "Wishlist" from the "Save for later" button). */
  defaultStatus?: JobStatus;
  onSubmit: (data: JobInput) => void;
  onCancel: () => void;
}

/** Create / edit form for a job application. */
export default function JobForm({ initial, defaultStatus, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<JobInput>(() =>
    initial ? { ...EMPTY, ...initial } : { ...EMPTY, status: defaultStatus ?? EMPTY.status, priority: defaultStatus === 'Wishlist' ? 'Medium' : undefined },
  );
  const isWishlist = form.status === 'Wishlist';
  const [tagInput, setTagInput] = useState((initial?.tags ?? []).join(', '));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.position.trim()) e.position = 'Position is required';
    if (form.url && !/^https?:\/\//i.test(form.url)) e.url = 'URL must start with http:// or https://';
    if (form.contact.email && !/^\S+@\S+\.\S+$/.test(form.contact.email)) e.email = 'Invalid email';
    if (form.salaryMin && form.salaryMax && form.salaryMin > form.salaryMax) e.salary = 'Min must be ≤ max';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      company: form.company.trim(),
      position: form.position.trim(),
      // Tags: comma separated, lowercased, de-duplicated
      tags: Array.from(new Set(tagInput.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))),
      deadline: form.deadline || undefined,
      interviewDate: form.interviewDate || undefined,
      // Planning fields only matter while the job is on the wishlist
      plannedDate: form.status === 'Wishlist' ? form.plannedDate || undefined : undefined,
      priority: form.status === 'Wishlist' ? form.priority : undefined,
    });
  };

  const numberOrUndefined = (v: string) => (v === '' ? undefined : Number(v));
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-rose-600">{errors[k]}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="company">Company *</label>
          <input id="company" className="input" value={form.company} onChange={(e) => set('company', e.target.value)} autoFocus />
          {err('company')}
        </div>
        <div>
          <label className="label" htmlFor="position">Position *</label>
          <input id="position" className="input" value={form.position} onChange={(e) => set('position', e.target.value)} />
          {err('position')}
        </div>
        <div>
          <label className="label" htmlFor="location">Work type</label>
          <select id="location" className="input" value={form.location} onChange={(e) => set('location', e.target.value as WorkLocation)}>
            <option>Remote</option>
            <option>Onsite</option>
            <option>Hybrid</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input id="city" className="input" placeholder="e.g. Ho Chi Minh City" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="url">Job URL</label>
          <input id="url" className="input" placeholder="https://..." value={form.url} onChange={(e) => set('url', e.target.value)} />
          {err('url')}
        </div>
        <div>
          <label className="label" htmlFor="smin">Salary min (USD / year)</label>
          <input id="smin" type="number" min={0} step={1000} className="input" value={form.salaryMin ?? ''} onChange={(e) => set('salaryMin', numberOrUndefined(e.target.value))} />
          {err('salary')}
        </div>
        <div>
          <label className="label" htmlFor="smax">Salary max (USD / year)</label>
          <input id="smax" type="number" min={0} step={1000} className="input" value={form.salaryMax ?? ''} onChange={(e) => set('salaryMax', numberOrUndefined(e.target.value))} />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select
            id="status"
            className="input"
            value={form.status}
            onChange={(e) => {
              const status = e.target.value as JobStatus;
              setForm((f) => ({ ...f, status, priority: status === 'Wishlist' ? f.priority ?? 'Medium' : f.priority }));
            }}
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'Wishlist' ? 'Wishlist (planning to apply)' : s}
              </option>
            ))}
          </select>
        </div>
        {isWishlist && (
          <>
            <div>
              <label className="label" htmlFor="planned">Planned apply date</label>
              <input id="planned" type="date" className="input" value={form.plannedDate ?? ''} onChange={(e) => set('plannedDate', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="priority">Priority</label>
              <select id="priority" className="input" value={form.priority ?? 'Medium'} onChange={(e) => set('priority', e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div>
          <label className="label" htmlFor="applied">{isWishlist ? 'Date saved' : 'Date applied'}</label>
          <input id="applied" type="date" className="input" value={form.dateApplied} onChange={(e) => set('dateApplied', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="deadline">Deadline</label>
          <input id="deadline" type="date" className="input" value={form.deadline ?? ''} onChange={(e) => set('deadline', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="interview">Next interview</label>
          <input id="interview" type="datetime-local" className="input" value={form.interviewDate ?? ''} onChange={(e) => set('interviewDate', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="rname">Recruiter name</label>
          <input id="rname" className="input" value={form.contact.name} onChange={(e) => set('contact', { ...form.contact, name: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="remail">Recruiter email</label>
          <input id="remail" type="email" className="input" value={form.contact.email} onChange={(e) => set('contact', { ...form.contact, email: e.target.value })} />
          {err('email')}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" className="input" placeholder="react, remote, referral" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" rows={4} className="input" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : isWishlist ? 'Save to wishlist' : 'Add application'}
        </button>
      </div>
    </form>
  );
}
