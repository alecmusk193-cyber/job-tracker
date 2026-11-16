import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';
import type { Job } from '../../types';
import { JOB_STATUSES } from '../../types';
import { addDays, parseDate, startOfWeek, toISODate } from '../../utils/date';
import { STATUS_STYLES } from '../../utils/status';

/** Theme-aware neutral colours for axes, grid and tooltip. */
function useChartTheme() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return {
    dark,
    grid: dark ? '#1e293b' : '#e2e8f0',
    axis: dark ? '#94a3b8' : '#64748b',
    text: dark ? '#e2e8f0' : '#0f172a',
    cursor: dark ? 'rgba(148,163,184,0.12)' : 'rgba(100,116,139,0.08)',
    tooltip: {
      background: dark ? '#0f172a' : '#ffffff',
      border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 8,
      fontSize: 12,
      color: dark ? '#e2e8f0' : '#0f172a',
    },
  };
}

/**
 * Pipeline chart: one horizontal bar per status (magnitude), colour-coded by
 * status identity, with the count printed at the end of each bar.
 */
export function StatusChart({ jobs }: { jobs: Job[] }) {
  const t = useChartTheme();
  const data = JOB_STATUSES.map((status) => ({
    status,
    count: jobs.filter((j) => j.status === status).length,
    fill: t.dark ? STATUS_STYLES[status].hexDark : STATUS_STYLES[status].hex,
  }));

  return (
    <div className="card p-5">
      <h3 className="font-semibold">Pipeline by status</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Number of applications in each stage</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }} barCategoryGap={6}>
            <CartesianGrid horizontal={false} stroke={t.grid} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: t.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="status"
              width={96}
              tick={{ fill: t.axis, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: t.cursor }}
              contentStyle={t.tooltip}
              labelStyle={{ color: t.text, fontWeight: 600 }}
              formatter={(v: number) => [v, 'Applications']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((d) => (
                <Cell key={d.status} fill={d.fill} />
              ))}
              <LabelList dataKey="count" position="right" fill={t.text} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Applications sent per week for the last 8 weeks (single series → no legend). */
export function ActivityChart({ jobs }: { jobs: Job[] }) {
  const t = useChartTheme();
  const color = t.dark ? '#3987e5' : '#2a78d6';
  const firstWeek = addDays(startOfWeek(), -7 * 7);
  const data = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(firstWeek, i * 7);
    const end = addDays(start, 7);
    return {
      week: parseDate(start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: jobs.filter((j) => j.dateApplied >= start && j.dateApplied < end).length,
    };
  });

  return (
    <div className="card p-5">
      <h3 className="font-semibold">Applications per week</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Last 8 weeks · through {toISODate(new Date())}</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={t.grid} />
            <XAxis dataKey="week" tick={{ fill: t.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: t.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ stroke: t.axis, strokeDasharray: '3 3' }}
              contentStyle={t.tooltip}
              labelStyle={{ color: t.text, fontWeight: 600 }}
              formatter={(v: number) => [v, 'Applications']}
              labelFormatter={(l) => `Week of ${l}`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2}
              fill="url(#appsFill)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: t.tooltip.background }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
