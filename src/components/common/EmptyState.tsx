import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Friendly placeholder when a list has no items. */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800">
        <Icon size={24} />
      </div>
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
