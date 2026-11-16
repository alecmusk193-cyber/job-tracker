import { AnimatePresence, motion } from 'framer-motion';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { checklistSuggestions, defaultChecklist } from '../../data/checklistTemplates';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { ChecklistItem } from '../../types';
import { uid } from '../../utils/id';
import { STORAGE_KEYS } from '../../utils/storage';
import ProgressBar from '../study/ProgressBar';

/** Pre-interview checklist with progress and quick-add suggestions. */
export default function Checklist() {
  const [items, setItems] = useLocalStorage<ChecklistItem[]>(STORAGE_KEYS.checklist, defaultChecklist);
  const [text, setText] = useState('');

  const done = items.filter((i) => i.done).length;
  const add = (value: string) => {
    if (!value.trim()) return;
    setItems((prev) => [...prev, { id: uid(), text: value.trim(), done: false }]);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    add(text);
    setText('');
  };

  const toggle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
    if (done + 1 === items.length && !items.find((i) => i.id === id)?.done) toast.success("All set — you've got this! 💪");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Before the interview</h3>
          <button
            className="btn-ghost text-xs"
            onClick={() => {
              setItems((prev) => prev.map((i) => ({ ...i, done: false })));
              toast('Checklist reset for next interview');
            }}
          >
            <RotateCcw size={14} /> Uncheck all
          </button>
        </div>
        <ProgressBar className="mt-3" value={items.length ? (done / items.length) * 100 : 0} />

        <ul className="mt-4 space-y-1">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggle(item.id)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  id={`chk-${item.id}`}
                />
                <label htmlFor={`chk-${item.id}`} className={`flex-1 cursor-pointer text-sm ${item.done ? 'text-slate-400 line-through' : ''}`}>
                  {item.text}
                </label>
                <button
                  onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                  className="btn-icon h-7 w-7 opacity-100 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                  aria-label="Remove item"
                >
                  <Trash2 size={14} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input className="input" placeholder="Add a checklist item…" value={text} onChange={(e) => setText(e.target.value)} aria-label="New checklist item" />
          <button className="btn-primary shrink-0" aria-label="Add item">
            <Plus size={16} />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {checklistSuggestions
            .filter((s) => !items.some((i) => i.text === s))
            .map((s) => (
              <button key={s} onClick={() => add(s)} className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700">
                + {s}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
