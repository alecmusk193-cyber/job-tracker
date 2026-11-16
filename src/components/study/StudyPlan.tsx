import { ExternalLink, Link2, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import type { StudyPlanApi } from '../../hooks/useStudyPlan';
import type { StudyTopic } from '../../types';
import { WEEKDAYS } from '../../utils/date';
import ProgressBar from './ProgressBar';

/** One topic of the weekly plan: tasks grouped by weekday + resource links. */
export default function StudyTopicCard({ topic, api }: { topic: StudyTopic; api: StudyPlanApi }) {
  const [taskText, setTaskText] = useState('');
  const [taskDay, setTaskDay] = useState(() => (new Date().getDay() + 6) % 7);
  const [res, setRes] = useState({ title: '', url: '' });
  const [showRes, setShowRes] = useState(false);

  const done = topic.tasks.filter((t) => t.done).length;
  const pct = topic.tasks.length ? (done / topic.tasks.length) * 100 : 0;

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    api.addTask(topic.id, { text: taskText.trim(), day: taskDay });
    setTaskText('');
  };

  const addResource = (e: FormEvent) => {
    e.preventDefault();
    if (!/^https?:\/\//.test(res.url)) return toast.error('URL must start with http(s)://');
    api.addResource(topic.id, { title: res.title.trim() || res.url, url: res.url });
    setRes({ title: '', url: '' });
    toast.success('Resource saved');
  };

  const tasksByDay = WEEKDAYS.map((_, d) => topic.tasks.filter((t) => t.day === d)).map((list, d) => ({ d, list }));

  return (
    <div className="card overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: topic.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{topic.name}</h3>
          <button
            className="btn-icon h-8 w-8 hover:text-rose-600"
            onClick={() => {
              api.deleteTopic(topic.id);
              toast.success(`Removed "${topic.name}"`);
            }}
            aria-label={`Delete topic ${topic.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
        <ProgressBar className="mt-2" value={pct} color={topic.color} />
        <p className="mt-1 text-xs text-slate-500">
          {done}/{topic.tasks.length} tasks done
        </p>

        <div className="mt-4 space-y-3">
          {tasksByDay
            .filter(({ list }) => list.length)
            .map(({ d, list }) => (
              <div key={d}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{WEEKDAYS[d]}</p>
                <ul className="mt-1 space-y-1">
                  {list.map((t) => (
                    <li key={t.id} className="group flex items-center gap-2 text-sm">
                      <input
                        id={`task-${t.id}`}
                        type="checkbox"
                        checked={t.done}
                        onChange={() => api.toggleTask(topic.id, t.id)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor={`task-${t.id}`} className={`flex-1 cursor-pointer ${t.done ? 'text-slate-400 line-through' : ''}`}>
                        {t.text}
                      </label>
                      <button
                        className="text-slate-400 opacity-100 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                        onClick={() => api.deleteTask(topic.id, t.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <form onSubmit={addTask} className="mt-4 flex gap-2">
          <select className="input w-20 shrink-0 px-2" value={taskDay} onChange={(e) => setTaskDay(Number(e.target.value))} aria-label="Day">
            {WEEKDAYS.map((w, i) => (
              <option key={w} value={i}>{w}</option>
            ))}
          </select>
          <input className="input" placeholder="Add task…" value={taskText} onChange={(e) => setTaskText(e.target.value)} aria-label="New task" />
          <button className="btn-secondary shrink-0 px-2.5" aria-label="Add task">
            <Plus size={16} />
          </button>
        </form>

        {/* Resources */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resources</p>
            <button className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400" onClick={() => setShowRes((s) => !s)}>
              {showRes ? 'Close' : '+ Add link'}
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {topic.resources.map((r) => (
              <li key={r.id} className="group flex items-center gap-2 text-sm">
                <Link2 size={13} className="shrink-0 text-slate-400" />
                <a href={r.url} target="_blank" rel="noreferrer" className="flex-1 truncate text-brand-600 hover:underline dark:text-brand-400">
                  {r.title}
                </a>
                <ExternalLink size={12} className="text-slate-400" />
                <button
                  className="text-slate-400 opacity-100 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100"
                  onClick={() => api.deleteResource(topic.id, r.id)}
                  aria-label="Delete resource"
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
            {topic.resources.length === 0 && !showRes && <li className="text-xs text-slate-400">No links yet.</li>}
          </ul>
          {showRes && (
            <form onSubmit={addResource} className="mt-2 space-y-2">
              <input className="input" placeholder="Title" value={res.title} onChange={(e) => setRes({ ...res, title: e.target.value })} />
              <div className="flex gap-2">
                <input className="input" placeholder="https://…" value={res.url} onChange={(e) => setRes({ ...res, url: e.target.value })} />
                <button className="btn-primary shrink-0">Save</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
