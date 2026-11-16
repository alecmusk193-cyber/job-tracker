import { useRef } from 'react';
import toast from 'react-hot-toast';
import { downloadFile } from '../utils/csv';
import { today } from '../utils/date';
import { exportAll, importAll } from '../utils/storage';

/**
 * Export every localStorage key to a JSON file, or restore from one.
 * Returns a hidden <input type="file"> element that must be rendered.
 */
export function useBackup() {
  const inputRef = useRef<HTMLInputElement>(null);

  const exportJSON = () => {
    downloadFile(JSON.stringify(exportAll(), null, 2), `job-tracker-backup-${today()}.json`, 'application/json');
    toast.success('Backup downloaded');
  };

  const openImport = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const n = importAll(parsed);
      toast.success(`Restored ${n} data sets from backup`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    }
  };

  const fileInput = (
    <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
  );

  return { exportJSON, openImport, fileInput };
}
