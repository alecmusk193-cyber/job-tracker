import type { DataKey } from '../utils/storage';
import { defaultChecklist } from './checklistTemplates';
import { sampleDocuments } from './sampleDocuments';
import { sampleFlashcards } from './sampleFlashcards';
import { sampleActivities, sampleJobs } from './sampleJobs';
import { sampleStudy } from './sampleStudy';

/** Starting data for a brand-new account (demo content, editable/deletable). */
export const DEFAULT_DATA: Record<DataKey, unknown> = {
  jobs: sampleJobs,
  activities: sampleActivities,
  flashcards: sampleFlashcards,
  checklist: defaultChecklist,
  study: sampleStudy,
  documents: sampleDocuments,
  profile: { name: '', email: '' },
};
