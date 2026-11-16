import { motion } from 'framer-motion';
import { Briefcase, CalendarClock, Send, Trophy } from 'lucide-react';
import type { Job } from '../../types';
import { JOB_STATUSES } from '../../types';
import { STATUS_STYLES } from '../../utils/status';

/** KPI tiles + a per-status count row. */
export default function StatsCards({ jobs }: { jobs: Job[] }) {
  const counts = Object.fromEntries(JOB_STATUSES.map((s) => [s, jobs.filter((j) => j.status === s).length]));
  const active = jobs.filter((j) => !['Offer', 'Rejected'].includes(j.status)).length;
  const responded = jobs.filter((j) => j.status !== 'Applied').length;
  const responseRate = jobs.length ? Math.round((responded / jobs.length) * 100) : 0;
  const upcoming = jobs.filter((j) => j.interviewDate && new Date(j.interviewDate) >= new Date()).length;

  const kpis = [
    { label: 'Total applications', value: jobs.length, icon: Briefcase, hint: `${active} active` },
    { label: 'Response rate', value: `${responseRate}%`, icon: Send, hint: `${responded} replied` },
    { label: 'Upcoming interviews', value: upcoming, icon: CalendarClock, hint: 'scheduled' },
    { label: 'Offers', value: counts.Offer, icon: Trophy, hint: counts.Offer ? 'congrats! 🎉' : 'keep going' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, hint }, i) => (
          <motion.div
            key={label}
            className="card p-4 sm:p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">{label}</p>
              <Icon size={18} className="text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {JOB_STATUSES.map((s) => (
          <div key={s} className="card flex items-center gap-3 px-4 py-3">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_STYLES[s].dot}`} />
            <span className="flex-1 truncate text-sm text-slate-600 dark:text-slate-300">{s}</span>
            <span className="text-lg font-semibold tabular-nums">{counts[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
