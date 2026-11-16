import { Pause, Play, RotateCcw, Shuffle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { Flashcard } from '../../types';

const PRESETS = [
  { label: 'Quick answer', minutes: 2 },
  { label: 'Behavioral', minutes: 30 },
  { label: 'Coding', minutes: 45 },
  { label: 'System design', minutes: 60 },
];

/** Short beep via Web Audio API (no audio asset needed). */
function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    /* audio not available */
  }
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/**
 * Countdown timer for mock interviews with a circular progress ring and an
 * optional random question drawn from the flashcard deck.
 */
export default function Timer({ cards }: { cards: Flashcard[] }) {
  const [total, setTotal] = useState(30 * 60);
  const [left, setLeft] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [custom, setCustom] = useState('');
  const [question, setQuestion] = useState<Flashcard | null>(null);
  const endAt = useRef<number>(0);

  // Use an absolute end timestamp so the timer stays accurate if the tab sleeps
  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        beep();
        toast.success("Time's up! ⏰");
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  // Show remaining time in the browser tab title
  useEffect(() => {
    const prev = document.title;
    if (running) document.title = `${fmt(left)} · Mock interview`;
    return () => {
      document.title = prev;
    };
  }, [left, running]);

  const setDuration = (minutes: number) => {
    setRunning(false);
    setTotal(minutes * 60);
    setLeft(minutes * 60);
  };

  const pickQuestion = () => {
    if (!cards.length) return;
    setQuestion(cards[Math.floor(Math.random() * cards.length)]);
  };

  const R = 110;
  const C = 2 * Math.PI * R;
  const progress = total ? left / total : 0;
  const warn = left <= 60 && left > 0;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
      <div className="card flex flex-col items-center p-6">
        <div className="relative">
          <svg width="260" height="260" viewBox="0 0 260 260" className="-rotate-90" aria-hidden>
            <circle cx="130" cy="130" r={R} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
            <circle
              cx="130"
              cy="130"
              r={R}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              className={`transition-[stroke-dashoffset] duration-300 ${warn ? 'stroke-rose-500' : 'stroke-brand-600'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-semibold tabular-nums ${warn ? 'text-rose-600' : ''}`} role="timer" aria-live="off">
              {fmt(left)}
            </span>
            <span className="mt-1 text-xs uppercase tracking-wide text-slate-500">{running ? 'In progress' : left === 0 ? 'Done' : 'Ready'}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="btn-primary w-28" onClick={() => setRunning((r) => !r)} disabled={left === 0}>
            {running ? <Pause size={16} /> : <Play size={16} />} {running ? 'Pause' : 'Start'}
          </button>
          <button className="btn-secondary" onClick={() => setDuration(total / 60)}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setDuration(p.minutes)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                total === p.minutes * 60
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              {p.label}
              <span className="block text-slate-500">{p.minutes} min</span>
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const m = Number(custom);
            if (m > 0 && m <= 240) setDuration(m);
            setCustom('');
          }}
        >
          <input className="input" type="number" min={1} max={240} placeholder="Custom minutes" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <button className="btn-secondary shrink-0">Set</button>
        </form>
      </div>

      <div className="card flex flex-col p-6">
        <h3 className="font-semibold">Mock question</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Draw a random question from your flashcards and answer it out loud.</p>
        <div className="mt-4 flex flex-1 flex-col justify-center rounded-xl bg-slate-50 p-5 dark:bg-slate-800/50">
          {question ? (
            <>
              <span className="chip self-start">{question.category}</span>
              <p className="mt-3 text-lg font-medium">{question.question}</p>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-brand-600 dark:text-brand-400">Show reference answer</summary>
                <p className="mt-2 whitespace-pre-line text-slate-600 dark:text-slate-300">{question.answer}</p>
              </details>
            </>
          ) : (
            <p className="text-center text-sm text-slate-400">No question drawn yet.</p>
          )}
        </div>
        <button
          className="btn-secondary mt-4"
          onClick={() => {
            pickQuestion();
            if (!running && left > 0) setRunning(true);
          }}
          disabled={!cards.length}
        >
          <Shuffle size={16} /> Draw question & start
        </button>
      </div>
    </div>
  );
}
