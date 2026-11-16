import { Copy, CopyPlus, Download, FileText, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDocuments } from '../../hooks/useDocuments';
import type { DocumentType } from '../../types';
import { downloadFile } from '../../utils/csv';
import { timeAgo } from '../../utils/date';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';

/**
 * Two-pane editor: version list on the left, plain-text editor on the right.
 * Content autosaves to localStorage (debounced).
 */
export default function ResumeEditor({ type }: { type: DocumentType }) {
  const { docs, addDoc, updateDoc, deleteDoc } = useDocuments();
  const list = docs.filter((d) => d.type === type);
  const [selectedId, setSelectedId] = useState<string | null>(list[0]?.id ?? null);
  const selected = list.find((d) => d.id === selectedId) ?? list[0];
  const [draft, setDraft] = useState({ title: selected?.title ?? '', content: selected?.content ?? '' });
  const [confirm, setConfirm] = useState(false);

  // Load the selected document into the local draft
  useEffect(() => {
    setDraft({ title: selected?.title ?? '', content: selected?.content ?? '' });
  }, [selected?.id]);

  // Debounced autosave
  useEffect(() => {
    if (!selected || (draft.title === selected.title && draft.content === selected.content)) return;
    const t = window.setTimeout(() => updateDoc(selected.id, draft), 500);
    return () => window.clearTimeout(t);
  }, [draft, selected, updateDoc]);

  const label = type === 'resume' ? 'Resume' : 'Cover letter';
  const words = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;

  const create = () => {
    const d = addDoc(type, `${label} — new version`);
    setSelectedId(d.id);
    toast.success(`New ${label.toLowerCase()} created`);
  };

  const duplicate = () => {
    if (!selected) return;
    const d = addDoc(type, `${draft.title} (copy)`, draft.content);
    setSelectedId(d.id);
    toast.success('Saved as a new version');
  };

  if (list.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={`No ${label.toLowerCase()}s yet`}
        description="Paste your text-based version here to keep track of iterations."
        action={
          <button className="btn-primary" onClick={create}>
            <Plus size={16} /> New {label.toLowerCase()}
          </button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        <button className="btn-primary w-full" onClick={create}>
          <Plus size={16} /> New version
        </button>
        <ul className="space-y-1">
          {list.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => setSelectedId(d.id)}
                className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                  d.id === selected?.id ? 'bg-brand-50 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:ring-brand-500/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <p className="truncate text-sm font-medium">{d.title}</p>
                <p className="text-xs text-slate-500">Edited {timeAgo(d.updatedAt)}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {selected && (
        <div className="card flex flex-col p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="input text-base font-semibold"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              aria-label="Document title"
            />
            <div className="flex shrink-0 gap-1">
              <button
                className="btn-icon"
                title="Copy to clipboard"
                onClick={async () => {
                  await navigator.clipboard.writeText(draft.content);
                  toast.success('Copied to clipboard');
                }}
              >
                <Copy size={16} />
              </button>
              <button className="btn-icon" title="Save as new version" onClick={duplicate}>
                <CopyPlus size={16} />
              </button>
              <button className="btn-icon" title="Download .txt" onClick={() => downloadFile(draft.content, `${draft.title || 'document'}.txt`, 'text/plain;charset=utf-8')}>
                <Download size={16} />
              </button>
              <button className="btn-icon hover:text-rose-600" title="Delete" onClick={() => setConfirm(true)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <textarea
            className="input mt-3 min-h-[420px] flex-1 resize-y font-mono text-[13px] leading-relaxed"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            aria-label="Document content"
            placeholder={type === 'cover-letter' ? 'Use {{company}}, {{position}}, {{recruiter}}… placeholders' : 'Paste your resume text…'}
          />
          <p className="mt-2 text-xs text-slate-500">
            {words} words · {draft.content.length} characters · autosaved
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        title={`Delete ${label.toLowerCase()}?`}
        message={`"${selected?.title}" will be permanently deleted.`}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (selected) {
            deleteDoc(selected.id);
            setSelectedId(null);
            toast.success('Deleted');
          }
          setConfirm(false);
        }}
      />
    </div>
  );
}
