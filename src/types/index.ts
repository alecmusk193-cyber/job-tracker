/**
 * Shared domain types for the whole app.
 * Everything here is persisted to localStorage as JSON, so keep it serialisable
 * (dates are stored as ISO strings "YYYY-MM-DD" or full ISO timestamps).
 */

// ---------- Jobs ----------

export const JOB_STATUSES = [
  'Applied',
  'Phone Screen',
  'Technical',
  'Onsite',
  'Offer',
  'Rejected',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type WorkLocation = 'Remote' | 'Onsite' | 'Hybrid';

export interface Contact {
  name: string;
  email: string;
}

export interface Job {
  id: string;
  company: string;
  position: string;
  location: WorkLocation;
  city?: string;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  dateApplied: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  interviewDate?: string; // ISO datetime of next scheduled interview
  notes: string;
  tags: string[];
  contact: Contact;
  createdAt: string;
  updatedAt: string;
}

/** Form payload: everything except the auto-managed fields */
export type JobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

// ---------- Activity log (powers the dashboard timeline) ----------

export type ActivityType = 'created' | 'updated' | 'status' | 'deleted';

export interface Activity {
  id: string;
  type: ActivityType;
  jobId: string;
  message: string;
  timestamp: string; // ISO
}

// ---------- Interview prep ----------

export const FLASHCARD_CATEGORIES = [
  'Behavioral',
  'DSA',
  'System Design',
  'Language-specific',
  'Company-specific',
] as const;

export type FlashcardCategory = (typeof FLASHCARD_CATEGORIES)[number];

/** new = never reviewed, learned = "đã thuộc", review = "cần ôn lại" */
export type FlashcardStatus = 'new' | 'learned' | 'review';

export interface Flashcard {
  id: string;
  category: FlashcardCategory;
  question: string;
  answer: string;
  company?: string;
  status: FlashcardStatus;
  lastReviewed?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

// ---------- Study plan ----------

export interface Resource {
  id: string;
  title: string;
  url: string;
}

export interface StudyTask {
  id: string;
  text: string;
  day: number; // 0 = Monday ... 6 = Sunday
  done: boolean;
}

export interface StudyTopic {
  id: string;
  name: string;
  weekStart: string; // YYYY-MM-DD (Monday of the week)
  color: string;
  tasks: StudyTask[];
  resources: Resource[];
}

// ---------- Documents ----------

export type DocumentType = 'resume' | 'cover-letter';

export interface DocVersion {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Backup ----------

export interface BackupData {
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
}
