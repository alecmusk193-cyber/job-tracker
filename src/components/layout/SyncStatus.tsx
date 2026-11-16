import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { getSyncStatus, subscribeStatus } from '../../utils/storage';

const STATES = {
  synced: { icon: Cloud, label: 'Synced', cls: 'text-emerald-600 dark:text-emerald-400' },
  syncing: { icon: RefreshCw, label: 'Syncing…', cls: 'text-amber-600 dark:text-amber-400' },
  offline: { icon: CloudOff, label: 'Offline — changes saved locally', cls: 'text-slate-500' },
};

/** Small cloud icon in the header showing Firestore sync state. */
export default function SyncStatus() {
  const status = useSyncExternalStore(subscribeStatus, getSyncStatus);
  const { icon: Icon, label, cls } = STATES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cls}`} title={label} role="status">
      <Icon size={16} className={status === 'syncing' ? 'animate-spin' : ''} />
      <span className="hidden md:inline">{status === 'offline' ? 'Offline' : label}</span>
    </span>
  );
}
