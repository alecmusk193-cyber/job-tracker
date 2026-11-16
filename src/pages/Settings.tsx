import { Cloud, Database, Download, Eraser, RefreshCcw, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useBackup } from '../hooks/useBackup';
import { useDocuments } from '../hooks/useDocuments';
import { useFlashcards } from '../hooks/useFlashcards';
import { useJobs } from '../hooks/useJobs';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { clearAllData, dataSize, restoreSampleData } from '../utils/storage';

export default function Settings() {
  const { exportJSON, openImport, fileInput } = useBackup();
  const { jobs } = useJobs();
  const { cards } = useFlashcards();
  const { topics } = useStudyPlan();
  const { docs } = useDocuments();
  const { user } = useAuth();
  const size = dataSize();
  const [action, setAction] = useState<'reset' | 'empty' | null>(null);

  const stats = [
    ['Job applications', jobs.length],
    ['Flashcards', cards.length],
    ['Study topics', topics.length],
    ['Documents', docs.length],
  ] as const;

  const confirm = () => {
    if (action === 'reset') {
      restoreSampleData();
      toast.success('Sample data restored');
    } else if (action === 'empty') {
      clearAllData();
      toast.success('All data cleared — fresh start!');
    }
    setAction(null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Backup & settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your data is stored in Firebase Firestore and syncs in real time across every device you sign in on.</p>
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
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Cloud size={14} /> Synced as <span className="font-medium">{user?.email}</span> · ≈ {(size.total / 1024).toFixed(1)} KB
          {size.largest.bytes > 700 * 1024 && (
            <span className="text-amber-600"> · “{size.largest.key}” is close to Firestore’s 1 MB document limit</span>
          )}
        </p>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold">Backup</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Download everything as a JSON file, or restore from a previous backup — including backups from the old offline version. Importing overwrites the matching data on all your devices.
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
