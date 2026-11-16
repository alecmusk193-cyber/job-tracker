import type { ChecklistItem } from '../types';

/** Default "before the interview" checklist. Users can add / remove items. */
export const defaultChecklist: ChecklistItem[] = [
  { id: 'cl-1', text: 'Research the company: mission, products, recent news', done: true },
  { id: 'cl-2', text: 'Re-read the job description and map skills to requirements', done: true },
  { id: 'cl-3', text: 'Look up interviewers on LinkedIn', done: false },
  { id: 'cl-4', text: 'Prepare 3–5 STAR stories', done: false },
  { id: 'cl-5', text: 'Prepare 3 thoughtful questions to ask', done: false },
  { id: 'cl-6', text: 'Test camera, mic, internet & screen sharing', done: false },
  { id: 'cl-7', text: 'Set up IDE / coding environment', done: false },
  { id: 'cl-8', text: 'Have resume, notes, water and pen ready', done: false },
  { id: 'cl-9', text: 'Send a thank-you email within 24h after', done: false },
];

/** Quick-add suggestions shown under the checklist. */
export const checklistSuggestions = [
  'Review salary expectations',
  'Plan the route / arrive 10 min early',
  'Practice a 60-second self-introduction',
  'Review system design fundamentals',
  'Charge laptop and headphones',
];
