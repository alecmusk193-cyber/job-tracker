import { useCallback } from 'react';
import type { Flashcard, FlashcardStatus } from '../types';
import { uid } from '../utils/id';
import { STORAGE_KEYS } from '../utils/storage';
import { useFirestore } from './useFirestore';

const NO_CARDS: Flashcard[] = [];

/** CRUD + review-status helpers for interview flashcards. */
export function useFlashcards() {
  const [cards, setCards] = useFirestore<Flashcard[]>(STORAGE_KEYS.flashcards, NO_CARDS);

  const addCard = useCallback(
    (card: Omit<Flashcard, 'id' | 'status'>) => setCards((prev) => [{ ...card, id: uid(), status: 'new' }, ...prev]),
    [setCards],
  );

  const updateCard = useCallback(
    (id: string, patch: Partial<Flashcard>) => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [setCards],
  );

  const deleteCard = useCallback((id: string) => setCards((prev) => prev.filter((c) => c.id !== id)), [setCards]);

  /** Mark a card as "learned" (đã thuộc) or "review" (cần ôn lại). */
  const markCard = useCallback(
    (id: string, status: FlashcardStatus) => updateCard(id, { status, lastReviewed: new Date().toISOString() }),
    [updateCard],
  );

  const resetProgress = useCallback(
    () => setCards((prev) => prev.map((c) => ({ ...c, status: 'new' as const, lastReviewed: undefined }))),
    [setCards],
  );

  return { cards, addCard, updateCard, deleteCard, markCard, resetProgress };
}
