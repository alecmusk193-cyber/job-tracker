import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, RotateCcw, Shuffle, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { Flashcard, FlashcardCategory, FlashcardStatus } from '../../types';
import { FLASHCARD_CATEGORIES } from '../../types';
import ProgressBar from '../study/ProgressBar';
import FlashCard from './FlashCard';

type Scope = 'all' | 'unlearned' | 'review';

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Review session: shuffled deck filtered by category / status.
 * Keyboard: Space = flip, ←/→ = navigate, 1 = learned, 2 = needs review.
 */
export default function QuizMode({ cards, onMark }: { cards: Flashcard[]; onMark: (id: string, s: FlashcardStatus) => void }) {
  const [category, setCategory] = useState<FlashcardCategory | 'All'>('All');
  const [scope, setScope] = useState<Scope>('unlearned');
  const [order, setOrder] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const pool = useMemo(
    () =>
      cards.filter(
        (c) =>
          (category === 'All' || c.category === category) &&
          (scope === 'all' || (scope === 'review' ? c.status === 'review' : c.status !== 'learned')),
      ),
    [cards, category, scope],
  );

  // Keep the latest pool in a ref so "Shuffle" always uses fresh statuses
  const poolRef = useRef(pool);
  poolRef.current = pool;

  // (Re)build a shuffled deck whenever the filter changes
  const reshuffle = useCallback(() => {
    setOrder(shuffle(poolRef.current.map((c) => c.id)));
    setIndex(0);
    setFlipped(false);
  }, [category, scope]);

  useEffect(() => {
    reshuffle();
  }, [reshuffle]);

  // Cards marked during the session stay in the deck until reshuffle
  const deck = order.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as Flashcard[];
  const card = deck[index];

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(deck.length - 1, 0)));
    },
    [deck.length],
  );

  const mark = useCallback(
    (status: FlashcardStatus) => {
      if (!card) return;
      onMark(card.id, status);
      toast.success(status === 'learned' ? 'Marked as learned ✓' : 'Added to review pile', { duration: 1200 });
      if (index < deck.length - 1) go(1);
      else toast('Deck complete! Shuffle to start again 🎉');
    },
    [card, onMark, index, deck.length, go],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === '1') mark('learned');
      else if (e.key === '2') mark('review');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, mark]);

  const learned = cards.filter((c) => (category === 'All' || c.category === category) && c.status === 'learned').length;
  const totalInCat = cards.filter((c) => category === 'All' || c.category === category).length;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as FlashcardCategory | 'All')} aria-label="Category">
          <option value="All">All categories</option>
          {FLASHCARD_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="input" value={scope} onChange={(e) => setScope(e.target.value as Scope)} aria-label="Cards to include">
          <option value="unlearned">Not learned yet</option>
          <option value="review">Needs review only</option>
          <option value="all">All cards</option>
        </select>
        <button className="btn-secondary shrink-0" onClick={reshuffle}>
          <Shuffle size={16} /> Shuffle
        </button>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Mastery</span>
          <span>
            {learned}/{totalInCat} learned
          </span>
        </div>
        <ProgressBar value={totalInCat ? (learned / totalInCat) * 100 : 0} color="#10b981" />
      </div>

      {card ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div key={card.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
              <FlashCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-2">
            <button className="btn-icon" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous card">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-1 justify-center gap-2">
              <button className="btn border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300" onClick={() => mark('review')}>
                <X size={16} /> Cần ôn lại <kbd className="hidden text-[10px] opacity-60 sm:inline">2</kbd>
              </button>
              <button className="btn border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300" onClick={() => mark('learned')}>
                <Check size={16} /> Đã thuộc <kbd className="hidden text-[10px] opacity-60 sm:inline">1</kbd>
              </button>
            </div>
            <button className="btn-icon" onClick={() => go(1)} disabled={index >= deck.length - 1} aria-label="Next card">
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-slate-500">
            Card {index + 1} of {deck.length} · Space flip · ←/→ navigate · 1 learned · 2 review
          </p>
        </>
      ) : (
        <div className="card flex flex-col items-center p-10 text-center">
          <p className="text-lg font-semibold">Nothing to review here 🎉</p>
          <p className="mt-1 text-sm text-slate-500">Change the filters or include all cards.</p>
          <button className="btn-secondary mt-4" onClick={() => setScope('all')}>
            <RotateCcw size={16} /> Review all cards
          </button>
        </div>
      )}
    </div>
  );
}
