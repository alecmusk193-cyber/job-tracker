import { BookOpen, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import DailyChecklist from '../components/study/DailyChecklist';
import ProgressBar from '../components/study/ProgressBar';
import StudyTopicCard from '../components/study/StudyPlan';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { addDays, formatDate, startOfWeek } from '../utils/date';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6', '#ef4444'];

export default function StudyPlanPage() {
  const api = useStudyPlan();
  const currentWeek = startOfWeek();
  const [week, setWeek] = useState(currentWeek);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', color: COLORS[0] });

  const weekTopics = api.topics.filter((t) => t.weekStart === week);
  const allTasks = weekTopics.flatMap((t) => t.tasks);
  const pct = allTasks.length ? (allTasks.filter((t) => t.done).length / allTasks.length) * 100 : 0;
  const isCurrent = week === currentWeek;
  const todayIdx = (new Date().getDay() + 6) % 7;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    api.addTopic({ name: form.name.trim(), color: form.color, weekStart: week });
    toast.success(`Added topic "${form.name.trim()}"`);
    setForm({ name: '', color: COLORS[(weekTopics.length + 1) % COLORS.length] });
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Study plan</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan topics per week and tick off daily tasks.</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add topic
        </button>
      </div>

      {/* Week navigator + overall progress */}
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <button className="btn-icon" onClick={() => setWeek(addDays(week, -7))} aria-label="Previous week">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-[180px] text-center">
            <p className="font-semibold">
              {formatDate(week, { month: 'short', day: 'numeric' })} – {formatDate(addDays(week, 6), { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-slate-500">{isCurrent ? 'This week' : week < currentWeek ? 'Past week' : 'Upcoming week'}</p>
          </div>
          <button className="btn-icon" onClick={() => setWeek(addDays(week, 7))} aria-label="Next week">
            <ChevronRight size={18} />
          </button>
          {!isCurrent && (
            <button className="btn-ghost text-xs" onClick={() => setWeek(currentWeek)}>
              Today
            </button>
          )}
        </div>
        <div className="flex-1">
          <p className="mb-1 text-xs text-slate-500">Week progress · {allTasks.length} tasks</p>
          <ProgressBar value={pct} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {weekTopics.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No topics this week"
              description="Add a topic (e.g. Graphs, System Design) and break it into daily tasks."
              action={
                <button className="btn-primary" onClick={() => setOpen(true)}>
                  <Plus size={16} /> Add topic
                </button>
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {weekTopics.map((t) => (
                <StudyTopicCard key={t.id} topic={t} api={api} />
              ))}
            </div>
          )}
        </div>
        <div>
          <DailyChecklist key={week} topics={weekTopics} api={api} initialDay={isCurrent ? todayIdx : 0} todayIdx={isCurrent ? todayIdx : undefined} />
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New study topic" size="md">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="topic-name">Topic</label>
            <input id="topic-name" className="input" placeholder="e.g. Dynamic Programming" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </div>
          <div>
            <span className="label">Color</span>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full ring-offset-2 dark:ring-offset-slate-900 ${form.color === c ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">Week of {formatDate(week)}</p>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary">Add topic</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
