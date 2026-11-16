import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type { Flashcard, FlashcardCategory } from '../../types';
import { FLASHCARD_CATEGORIES } from '../../types';
import Modal from '../common/Modal';

const STATUS_DOT = { new: 'bg-slate-400', learned: 'bg-emerald-500', review: 'bg-amber-500' };
const STATUS_TEXT = { new: 'New', learned: 'Learned', review: 'Needs review' };

const STAR_TEMPLATE = 'S (Situation): \nT (Task): \nA (Action): \nR (Result): ';

interface Props {
  cards: Flashcard[];
  onAdd: (c: Omit<Flashcard, 'id' | 'status'>) => void;
  onUpdate: (id: string, patch: Partial<Flashcard>) => void;
  onDelete: (id: string) => void;
}

/** Browse, create, edit and delete flashcards. */
export default function FlashcardManager({ cards, onAdd, onUpdate, onDelete }: Props) {
  const [category, setCategory] = useState<FlashcardCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: 'Behavioral' as FlashcardCategory, question: '', answer: '', company: '' });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cards.filter(
      (c) => (category === 'All' || c.category === category) && (!q || (c.question + c.answer + (c.company ?? '')).toLowerCase().includes(q)),
    );
  }, [cards, category, search]);

  const openNew = () => {
    setEditing(null);
    const cat = category === 'All' ? 'Behavioral' : category;
    setForm({ category: cat, question: '', answer: cat === 'Behavioral' ? STAR_TEMPLATE : '', company: '' });
    setOpen(true);
  };

  const openEdit = (c: Flashcard) => {
    setEditing(c);
    setForm({ category: c.category, question: c.question, answer: c.answer, company: c.company ?? '' });
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.question.trim()) return toast.error('Question is required');
    const payload = { ...form, question: form.question.trim(), company: form.company.trim() || undefined };
    if (editing) {
      onUpdate(editing.id, payload);
      toast.success('Flashcard updated');
    } else {
      onAdd(payload);
      toast.success('Flashcard added');
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search flashcards" />
        </div>
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> New card
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...FLASHCARD_CATEGORIES] as const).map((c) => {
          const count = c === 'All' ? cards.length : cards.filter((x) => x.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
              }`}
            >
              {c} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <div key={c.id} className="card group flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="chip">
                {c.category}
                {c.company ? ` · ${c.company}` : ''}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[c.status]}`} /> {STATUS_TEXT[c.status]}
              </span>
            </div>
            <p className="mt-3 font-medium">{c.question}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-slate-500 dark:text-slate-400">{c.answer}</p>
            <div className="mt-auto flex justify-end pt-3">
              <button className="btn-icon h-8 w-8" onClick={() => openEdit(c)} aria-label="Edit flashcard">
                <Pencil size={14} />
              </button>
              <button
                className="btn-icon h-8 w-8 hover:text-rose-600"
                onClick={() => {
                  onDelete(c.id);
                  toast.success('Flashcard deleted');
                }}
                aria-label="Delete flashcard"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full py-10 text-center text-sm text-slate-500">No flashcards found.</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit flashcard' : 'New flashcard'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="fc-cat">Category</label>
              <select
                id="fc-cat"
                className="input"
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value as FlashcardCategory;
                  // Pre-fill the STAR skeleton for behavioral questions
                  setForm((f) => ({ ...f, category: cat, answer: cat === 'Behavioral' && !f.answer ? STAR_TEMPLATE : f.answer }));
                }}
              >
                {FLASHCARD_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="fc-company">Company (optional)</label>
              <input id="fc-company" className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="fc-q">Question</label>
            <input id="fc-q" className="input" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} autoFocus />
          </div>
          <div>
            <label className="label" htmlFor="fc-a">Answer {form.category === 'Behavioral' && '(STAR method)'}</label>
            <textarea id="fc-a" rows={7} className="input font-mono text-[13px]" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary">{editing ? 'Save' : 'Add card'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
