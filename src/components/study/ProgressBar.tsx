import { motion } from 'framer-motion';

/** Animated horizontal progress bar (0–100). */
export default function ProgressBar({
  value,
  color = '#4f46e5',
  showLabel = true,
  className = '',
}: {
  value: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && <span className="w-10 text-right text-xs font-semibold tabular-nums">{pct}%</span>}
    </div>
  );
}
