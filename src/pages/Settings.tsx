import { Database, Download, Eraser, RefreshCcw, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useBackup } from '../hooks/useBackup';
import { useDocuments } from '../hooks/useDocuments';
import { useFlashcards } from '../hooks/useFlashcards';
import { useJobs } from '../hooks/useJobs';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { clearAll, STORAGE_KEYS, STORAGE_PREFIX, writeStorage } from '../utils/storage';

/** Approximate bytes used by this app in localStorage. */
function storageSize(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(STORAGE_PREFIX)) total += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2;
    }
  } catch {
    /* ignore */
  }
  return total;
}

export default function Settings() {
  const { exportJSON, openImport, fileInput } = useBackup();
  const { jobs } = useJobs();
  const { cards } = useFlashcards();
  const { topics } = useStudyPlan();
  const { docs } = useDocuments();
  const [action, setAction] = useState<'reset' | 'empty' | null>(null);

  const stats = [
    ['Job applications', jobs.length],
    ['Flashcards', cards.length],
    ['Study topics', topics.length],
    ['Documents', docs.length],
  ] as const;

  const confirm = () => {
    if (action === 'reset') {
      clearAll(); // components fall back to the bundled sample data
      toast.success('Sample data restored');
    } else if (action === 'empty') {
      [STORAGE_KEYS.jobs, STORAGE_KEYS.activities, STORAGE_KEYS.flashcards, STORAGE_KEYS.study, STORAGE_KEYS.documents].forEach((k) =>
        writeStorage(k, []),
      );
      toast.success('All data cleared — fresh start!');
    }
    setAction(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Backup & settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">All data lives in your browser’s localStorage — nothing is sent to a server.</p>
      </div>

      <section className="card p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <Database size={16} /> Your data
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([label, n]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="text-2xl font-semibold tabular-nums">{n}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">≈ {(storageSize() / 1024).toFixed(1)} KB used (browsers allow ~5 MB).</p>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Backup</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Download everything as a JSON file, or restore from a previous backup (this overwrites current data).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={exportJSON}>
            <Download size={16} /> Export JSON
          </button>
          <button className="btn-secondary" onClick={openImport}>
            <Upload size={16} /> Import JSON
          </button>
          {fileInput}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Appearance</h3>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Light / dark mode</p>
          <ThemeToggle />
        </div>
      </section>

      <section className="card border-rose-200 p-5 dark:border-rose-500/30">
        <h3 className="font-semibold text-rose-600 dark:text-rose-400">Danger zone</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => setAction('reset')}>
            <RefreshCcw size={16} /> Restore sample data
          </button>
          <button className="btn-danger" onClick={() => setAction('empty')}>
            <Eraser size={16} /> Clear all data
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={!!action}
        title={action === 'reset' ? 'Restore sample data?' : 'Clear all data?'}
        message={
          action === 'reset'
            ? 'Your current data will be replaced by the demo data. Export a backup first if you want to keep it.'
            : 'Every job, flashcard, study topic and document will be deleted. Export a backup first if you want to keep it.'
        }
        confirmLabel={action === 'reset' ? 'Restore' : 'Clear everything'}
        onCancel={() => setAction(null)}
        onConfirm={confirm}
      />
    </div>
  );
}
