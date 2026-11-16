import { CalendarCheck } from 'lucide-react';
import { useState } from 'react';
import type { StudyPlanApi } from '../../hooks/useStudyPlan';
import type { StudyTopic } from '../../types';
import { WEEKDAYS } from '../../utils/date';
import ProgressBar from './ProgressBar';

/**
 * Tasks of one weekday across every topic of the selected week.
 * Defaults to today; the weekday pills switch to another day.
 */
export default function DailyChecklist({
  topics,
  api,
  initialDay,
  todayIdx,
}: {
  topics: StudyTopic[];
  api: StudyPlanApi;
  initialDay: number;
  todayIdx?: number;
}) {
  const [day, setDay] = useState(initialDay);
  const items = topics.flatMap((topic) => topic.tasks.filter((t) => t.day === day).map((task) => ({ topic, task })));
  const done = items.filter((i) => i.task.done).length;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <CalendarCheck size={18} className="text-brand-600" />
        <h3 className="font-semibold">Daily checklist · {day === todayIdx ? 'Today' : WEEKDAYS[day]}</h3>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w, i) => {
          const count = topics.reduce((n, t) => n + t.tasks.filter((k) => k.day === i).length, 0);
          return (
            <button
              key={w}
              onClick={() => setDay(i)}
              className={`rounded-md py-1 text-xs font-medium transition-colors ${
                day === i ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              } ${i === todayIdx && day !== i ? 'ring-1 ring-brand-400' : ''}`}
              aria-pressed={day === i}
              title={`${count} task(s)`}
            >
              {w[0]}
              <span className="block text-[10px] opacity-70">{count}</span>
            </button>
          );
        })}
      </div>
      <ProgressBar className="mt-3" value={items.length ? (done / items.length) * 100 : 0} />
      <ul className="mt-4 space-y-2">
        {items.map(({ topic, task }) => (
          <li key={task.id} className="flex items-start gap-2.5 text-sm">
            <input
              id={`daily-${task.id}`}
              type="checkbox"
              checked={task.done}
              onChange={() => api.toggleTask(topic.id, task.id)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor={`daily-${task.id}`} className="flex-1 cursor-pointer">
              <span className={task.done ? 'text-slate-400 line-through' : ''}>{task.text}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: topic.color }} />
                {topic.name}
              </span>
            </label>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-slate-500">Nothing planned for this day. Enjoy a break or add a task ☕</li>}
      </ul>
    </div>
  );
}
