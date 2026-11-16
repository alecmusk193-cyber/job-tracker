import type { Flashcard } from '../types';

/** Starter interview questions grouped by category. */
export const sampleFlashcards: Flashcard[] = [
  // ---- Behavioral (STAR) ----
  {
    id: 'fc-1',
    category: 'Behavioral',
    question: 'Tell me about a time you disagreed with a teammate.',
    answer:
      'S: Teammate wanted to rewrite a module right before release.\nT: Ship on time without accumulating risky debt.\nA: Set up a 30-min call, listed risks of both options, proposed a time-boxed refactor after release with a ticket.\nR: Shipped on time; refactor completed next sprint, reducing bug reports in that module by 40%.',
    status: 'learned',
  },
  {
    id: 'fc-2',
    category: 'Behavioral',
    question: 'Describe a project you are most proud of.',
    answer:
      'Use STAR: Situation (context & stakes) → Task (your responsibility) → Action (what YOU did, specific decisions) → Result (measurable impact + what you learned).',
    status: 'review',
  },
  {
    id: 'fc-3',
    category: 'Behavioral',
    question: 'Tell me about a time you failed.',
    answer:
      'Pick a real failure with low blast radius. Own it, explain root cause, the corrective action, and the process change you made so it never happened again.',
    status: 'new',
  },
  {
    id: 'fc-4',
    category: 'Behavioral',
    question: 'How do you handle tight deadlines?',
    answer:
      'Clarify must-haves vs nice-to-haves, communicate trade-offs early, break work into milestones, and give stakeholders frequent status updates.',
    status: 'new',
  },
  // ---- DSA ----
  {
    id: 'fc-5',
    category: 'DSA',
    question: 'What is the time complexity of searching in a balanced BST?',
    answer: 'O(log n) — each comparison halves the remaining search space. Worst case for an unbalanced BST is O(n).',
    status: 'learned',
  },
  {
    id: 'fc-6',
    category: 'DSA',
    question: 'How do you detect a cycle in a linked list?',
    answer:
      "Floyd's tortoise & hare: slow pointer moves 1 step, fast moves 2. If they meet, there is a cycle. O(n) time, O(1) space.",
    status: 'review',
  },
  {
    id: 'fc-7',
    category: 'DSA',
    question: 'When would you use a heap?',
    answer:
      'When you repeatedly need the min/max element: top-K problems, merging K sorted lists, Dijkstra, scheduling. Insert/pop are O(log n), peek O(1).',
    status: 'new',
  },
  {
    id: 'fc-8',
    category: 'DSA',
    question: 'Explain the sliding window technique.',
    answer:
      'Maintain a window [left, right] over an array/string, expand right, shrink left while a constraint is violated. Turns many O(n²) substring problems into O(n).',
    status: 'new',
  },
  // ---- System design ----
  {
    id: 'fc-9',
    category: 'System Design',
    question: 'How would you design a URL shortener?',
    answer:
      'Requirements → API (POST /shorten, GET /:code) → ID generation (base62 of counter / hash) → KV store (code→URL) → cache hot codes (Redis) → 301/302 redirects → analytics via async queue → scale reads with replicas/CDN.',
    status: 'review',
  },
  {
    id: 'fc-10',
    category: 'System Design',
    question: 'What is the CAP theorem?',
    answer:
      'In the presence of a network Partition, a distributed system must choose between Consistency and Availability. CP systems reject requests; AP systems serve possibly stale data.',
    status: 'new',
  },
  {
    id: 'fc-11',
    category: 'System Design',
    question: 'When should you add a cache, and what are the risks?',
    answer:
      'Add when reads dominate and data tolerates slight staleness. Risks: invalidation bugs, stampedes (use request coalescing / jittered TTL), cold starts, memory cost.',
    status: 'new',
  },
  // ---- Language-specific ----
  {
    id: 'fc-12',
    category: 'Language-specific',
    question: 'JavaScript: explain the event loop.',
    answer:
      'JS runs on one thread. The call stack executes sync code; when empty, the event loop drains the microtask queue (Promises) fully, then takes one macrotask (setTimeout, I/O), then renders, and repeats.',
    status: 'learned',
  },
  {
    id: 'fc-13',
    category: 'Language-specific',
    question: 'React: what does useEffect cleanup do?',
    answer:
      'The function returned from useEffect runs before the effect re-runs and on unmount — used to unsubscribe, clear timers, abort fetches to avoid leaks and race conditions.',
    status: 'new',
  },
  {
    id: 'fc-14',
    category: 'Language-specific',
    question: 'TypeScript: difference between `type` and `interface`?',
    answer:
      'Both describe shapes. Interfaces can be re-opened (declaration merging) and extended; type aliases can express unions, intersections, mapped & conditional types.',
    status: 'new',
  },
  // ---- Company-specific ----
  {
    id: 'fc-15',
    category: 'Company-specific',
    company: 'Northwind Labs',
    question: 'Why do you want to work at Northwind Labs?',
    answer:
      'Connect their mission (developer tools for data teams) to your experience building dashboards; mention their recent open-source release and remote-first culture.',
    status: 'new',
  },
  {
    id: 'fc-16',
    category: 'Company-specific',
    company: 'Bluefin Analytics',
    question: 'Which Bluefin product would you improve and how?',
    answer:
      'Pick their reporting UI: propose saved views + keyboard shortcuts; back it with a metric (time-to-insight) and a quick experiment plan.',
    status: 'new',
  },
];
