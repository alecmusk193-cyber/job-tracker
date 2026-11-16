import { useState, type FormEvent } from 'react';
import type { Job, JobInput, JobStatus, WorkLocation } from '../../types';
import { JOB_STATUSES } from '../../types';
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
  onSubmit: (data: JobInput) => void;
  onCancel: () => void;
}

/** Create / edit form for a job application. */
export default function JobForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<JobInput>(() => (initial ? { ...EMPTY, ...initial } : EMPTY));
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
          <select id="status" className="input" value={form.status} onChange={(e) => set('status', e.target.value as JobStatus)}>
            {JOB_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="applied">Date applied</label>
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
          {initial ? 'Save changes' : 'Add application'}
        </button>
      </div>
    </form>
  );
}
