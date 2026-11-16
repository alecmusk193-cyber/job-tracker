import { motion } from 'framer-motion';
import type { Flashcard } from '../../types';

const STATUS_LABEL = {
  new: { text: 'New', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  learned: { text: 'Learned', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  review: { text: 'Needs review', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
};

/**
 * Flip card: question on the front, answer on the back.
 * Controlled via `flipped` so QuizMode can reset it between cards.
 */
export default function FlashCard({
  card,
  flipped,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  const status = STATUS_LABEL[card.status];
  const face = 'backface-hidden absolute inset-0 flex flex-col rounded-2xl border p-6 sm:p-8';

  return (
    <button
      type="button"
      onClick={onFlip}
      className="perspective block h-80 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:h-96"
      aria-label={flipped ? 'Show question' : 'Show answer'}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      >
        {/* Front: question */}
        <div className={`${face} border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900`}>
          <div className="flex items-center justify-between gap-2">
            <span className="chip">
              {card.category}
              {card.company ? ` · ${card.company}` : ''}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>{status.text}</span>
          </div>
          <p className="my-auto text-center text-xl font-semibold leading-snug sm:text-2xl">{card.question}</p>
          <p className="text-center text-xs text-slate-400">Click or press Space to reveal the answer</p>
        </div>

        {/* Back: answer */}
        <div
          className={`${face} border-brand-200 bg-brand-50 shadow-lg dark:border-brand-500/30 dark:bg-slate-900`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Answer</span>
          <p className="mt-3 flex-1 overflow-y-auto whitespace-pre-line text-sm leading-relaxed sm:text-base">{card.answer}</p>
        </div>
      </motion.div>
    </button>
  );
}
