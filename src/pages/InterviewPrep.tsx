import { motion } from 'framer-motion';
import { Brain, Layers, ListChecks, Timer as TimerIcon } from 'lucide-react';
import Checklist from '../components/prep/Checklist';
import FlashcardManager from '../components/prep/FlashcardManager';
import QuizMode from '../components/prep/QuizMode';
import Timer from '../components/prep/Timer';
import { useFlashcards } from '../hooks/useFlashcards';
import { useLocalStorage } from '../hooks/useLocalStorage';

const TABS = [
  { id: 'cards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Review', icon: Brain },
  { id: 'checklist', label: 'Checklist', icon: ListChecks },
  { id: 'timer', label: 'Mock timer', icon: TimerIcon },
] as const;

type Tab = (typeof TABS)[number]['id'];

export default function InterviewPrep() {
  const { cards, addCard, updateCard, deleteCard, markCard } = useFlashcards();
  const [tab, setTab] = useLocalStorage<Tab>('prepTab', 'cards');

  const learned = cards.filter((c) => c.status === 'learned').length;
  const review = cards.filter((c) => c.status === 'review').length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Interview prep</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {cards.length} cards · {learned} learned · {review} need review
          </p>
        </div>
      </div>

      {/* Tabs with animated underline */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`relative inline-flex shrink-0 items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              tab === id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={16} /> {label}
            {tab === id && <motion.span layoutId="prep-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600 dark:bg-brand-400" />}
          </button>
        ))}
      </div>

      {tab === 'cards' && <FlashcardManager cards={cards} onAdd={addCard} onUpdate={updateCard} onDelete={deleteCard} />}
      {tab === 'quiz' && <QuizMode cards={cards} onMark={markCard} />}
      {tab === 'checklist' && <Checklist />}
      {tab === 'timer' && <Timer cards={cards} />}
    </div>
  );
}
