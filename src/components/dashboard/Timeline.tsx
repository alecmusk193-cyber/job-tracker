import { motion } from 'framer-motion';
import { ArrowRightLeft, History, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Activity, ActivityType } from '../../types';
import { timeAgo } from '../../utils/date';
import EmptyState from '../common/EmptyState';

const ICONS: Record<ActivityType, { icon: typeof Plus; cls: string }> = {
  created: { icon: Plus, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  status: { icon: ArrowRightLeft, cls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  updated: { icon: Pencil, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  deleted: { icon: Trash2, cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
};

/** Vertical timeline of the most recent activity. */
export default function Timeline({ activities, limit = 8 }: { activities: Activity[]; limit?: number }) {
  const items = activities.slice(0, limit);
  return (
    <div className="card p-5">
      <h3 className="font-semibold">Recent activity</h3>
      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={History} title="No activity yet" />
        </div>
      ) : (
        <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {items.map((a, i) => {
            const { icon: Icon, cls } = ICONS[a.type];
            return (
              <motion.li
                key={a.id}
                className="relative flex gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${cls}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 pt-1">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(a.timestamp)}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
