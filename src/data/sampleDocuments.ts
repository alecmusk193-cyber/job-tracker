import type { DocVersion } from '../types';

const now = new Date().toISOString();

/**
 * Placeholders available in cover-letter templates. They are replaced by
 * values from the selected job + the user's profile fields.
 */
export const PLACEHOLDERS = [
  { key: '{{company}}', label: 'Company name' },
  { key: '{{position}}', label: 'Position' },
  { key: '{{recruiter}}', label: 'Recruiter name' },
  { key: '{{location}}', label: 'Location' },
  { key: '{{myName}}', label: 'Your name' },
  { key: '{{myEmail}}', label: 'Your email' },
  { key: '{{date}}', label: "Today's date" },
] as const;

export const sampleDocuments: DocVersion[] = [
  {
    id: 'doc-1',
    type: 'resume',
    title: 'Resume — Frontend v3',
    content: `ALEX NGUYEN
Frontend Engineer · alex@example.com · github.com/alex

SUMMARY
Frontend engineer with 5 years building fast, accessible React apps.

EXPERIENCE
Senior Frontend Engineer — Example Corp (2022–present)
- Led migration to TypeScript + Vite, cutting build time by 70%
- Built a design system used by 6 product teams

Frontend Engineer — Startup Inc (2019–2022)
- Shipped a real-time dashboard used by 20k daily users

SKILLS
React, TypeScript, Node.js, Tailwind CSS, Testing Library, AWS`,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'doc-2',
    type: 'resume',
    title: 'Resume — Full-stack v1',
    content: `ALEX NGUYEN
Full-stack Developer · alex@example.com

Highlights: React + Node.js + PostgreSQL. Designed REST & GraphQL APIs serving 1M req/day.`,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'doc-3',
    type: 'cover-letter',
    title: 'Cover letter — General template',
    content: `{{date}}

Dear {{recruiter}},

I am excited to apply for the {{position}} role at {{company}}. Over the past five years I have built fast, accessible web applications, and I would love to bring that experience to your team in {{location}}.

What draws me to {{company}} is ... (one specific reason).

In my current role I ... (one quantified achievement relevant to the job).

I would welcome the chance to discuss how I can help {{company}} succeed.

Best regards,
{{myName}}
{{myEmail}}`,
    createdAt: now,
    updatedAt: now,
  },
];
