import type { StudyTopic } from '../types';
import { addDays, startOfWeek } from '../utils/date';

const thisWeek = startOfWeek();
const nextWeek = addDays(thisWeek, 7);

/** Demo weekly study plan. `day` 0 = Monday. */
export const sampleStudy: StudyTopic[] = [
  {
    id: 'st-1',
    name: 'Arrays & Hashing',
    weekStart: thisWeek,
    color: '#6366f1',
    tasks: [
      { id: 't1', text: 'Two Sum, Contains Duplicate', day: 0, done: true },
      { id: 't2', text: 'Group Anagrams', day: 1, done: true },
      { id: 't3', text: 'Top K Frequent Elements', day: 2, done: false },
      { id: 't4', text: 'Product of Array Except Self', day: 3, done: false },
      { id: 't5', text: 'Review & redo mistakes', day: 5, done: false },
    ],
    resources: [
      { id: 'r1', title: 'NeetCode roadmap', url: 'https://neetcode.io/roadmap' },
      { id: 'r2', title: 'Big-O cheat sheet', url: 'https://www.bigocheatsheet.com/' },
    ],
  },
  {
    id: 'st-2',
    name: 'System Design Basics',
    weekStart: thisWeek,
    color: '#10b981',
    tasks: [
      { id: 't6', text: 'Read: load balancing & caching', day: 0, done: true },
      { id: 't7', text: 'Watch: design a URL shortener', day: 2, done: false },
      { id: 't8', text: 'Practice: design a chat app (whiteboard)', day: 4, done: false },
    ],
    resources: [{ id: 'r3', title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' }],
  },
  {
    id: 'st-3',
    name: 'React Deep Dive',
    weekStart: nextWeek,
    color: '#f59e0b',
    tasks: [
      { id: 't9', text: 'Reconciliation & keys', day: 0, done: false },
      { id: 't10', text: 'Memoization: useMemo / useCallback / memo', day: 2, done: false },
      { id: 't11', text: 'Build a small app with Suspense', day: 4, done: false },
    ],
    resources: [{ id: 'r4', title: 'react.dev — Learn', url: 'https://react.dev/learn' }],
  },
];
