import { Copy, Download, Save, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PLACEHOLDERS } from '../../data/sampleDocuments';
import { useDocuments, useProfile } from '../../hooks/useDocuments';
import { useJobs } from '../../hooks/useJobs';
import { downloadFile } from '../../utils/csv';
import { fillTemplate } from '../../utils/template';

/**
 * Pick a cover-letter template + a job → placeholders are filled automatically.
 * The result can be copied, downloaded or saved as a new cover-letter version.
 */
export default function CoverLetterTemplate() {
  const { docs, addDoc } = useDocuments();
  const { jobs } = useJobs();
  const [profile, setProfile] = useProfile();
  const templates = docs.filter((d) => d.type === 'cover-letter');
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [jobId, setJobId] = useState(jobs.find((j) => j.status !== 'Rejected')?.id ?? '');

  const template = templates.find((t) => t.id === templateId) ?? templates[0];
  const job = jobs.find((j) => j.id === jobId);
  const output = useMemo(() => (template ? fillTemplate(template.content, job, profile) : ''), [template, job, profile]);
  const missing = Array.from(new Set(output.match(/\{\{\s*\w+\s*\}\}/g) ?? []));

  if (!template) {
    return <p className="text-sm text-slate-500">Create a cover letter in the “Cover letters” tab first — it will be used as a template.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <div className="card space-y-4 p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <Wand2 size={16} className="text-brand-600" /> Generate
          </h3>
          <div>
            <label className="label" htmlFor="tpl">Template</label>
            <select id="tpl" className="input" value={template.id} onChange={(e) => setTemplateId(e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="tpl-job">Job</label>
            <select id="tpl-job" className="input" value={jobId} onChange={(e) => setJobId(e.target.value)}>
              <option value="">— none —</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.position}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="my-name">Your name</label>
            <input id="my-name" className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="my-email">Your email</label>
            <input id="my-email" className="input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
        </div>

        <div className="card p-5">
          <h4 className="text-sm font-semibold">Available placeholders</h4>
          <ul className="mt-2 space-y-1 text-xs">
            {PLACEHOLDERS.map((p) => (
              <li key={p.key} className="flex justify-between gap-2">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-brand-700 dark:bg-slate-800 dark:text-brand-300">{p.key}</code>
                <span className="text-slate-500">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card flex flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Preview</h3>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(output);
                toast.success('Copied to clipboard');
              }}
            >
              <Copy size={16} /> Copy
            </button>
            <button className="btn-secondary" onClick={() => downloadFile(output, `cover-letter-${job?.company ?? 'draft'}.txt`, 'text/plain;charset=utf-8')}>
              <Download size={16} /> .txt
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                addDoc('cover-letter', `Cover letter — ${job?.company ?? 'Draft'}`, output);
                toast.success('Saved as a new cover letter');
              }}
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
        {missing.length > 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Unfilled placeholders: {missing.join(', ')} — select a job or fill your profile.
          </p>
        )}
        <div className="mt-4 flex-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 font-serif text-[15px] leading-relaxed dark:border-slate-800 dark:bg-slate-950">
          {output}
        </div>
      </div>
    </div>
  );
}
