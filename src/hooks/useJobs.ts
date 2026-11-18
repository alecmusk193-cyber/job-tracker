import { useCallback } from 'react';
import type { Activity, ActivityType, Job, JobInput, JobStatus } from '../types';
import { today } from '../utils/date';
import { uid } from '../utils/id';
import { STORAGE_KEYS } from '../utils/storage';
import { useFirestore } from './useFirestore';

const MAX_ACTIVITIES = 100;

const leavesWishlist = (from: JobStatus, to?: JobStatus) => from === 'Wishlist' && !!to && to !== 'Wishlist';

function statusMessage(company: string, from: JobStatus, to: JobStatus): string {
  if (from === 'Wishlist' && to === 'Applied') return `Applied to ${company} (from wishlist)`;
  if (to === 'Wishlist') return `${company} moved back to wishlist`;
  return `${company} moved to ${to}${to === 'Offer' ? ' 🎉' : ''}`;
}
// Stable fallbacks shown only before Firestore data is loaded
const NO_JOBS: Job[] = [];
const NO_ACTIVITIES: Activity[] = [];

/**
 * CRUD operations for job applications. Every mutation also appends an
 * entry to the activity log that powers the dashboard timeline.
 */
export function useJobs() {
  const [jobs, setJobs] = useFirestore<Job[]>(STORAGE_KEYS.jobs, NO_JOBS);
  const [activities, setActivities] = useFirestore<Activity[]>(STORAGE_KEYS.activities, NO_ACTIVITIES);

  const log = useCallback(
    (type: ActivityType, jobId: string, message: string) => {
      setActivities((prev) =>
        [{ id: uid(), type, jobId, message, timestamp: new Date().toISOString() }, ...prev].slice(0, MAX_ACTIVITIES),
      );
    },
    [setActivities],
  );

  const addJob = useCallback(
    (input: JobInput) => {
      const now = new Date().toISOString();
      const job: Job = { ...input, id: uid(), createdAt: now, updatedAt: now };
      setJobs((prev) => [job, ...prev]);
      log(
        'created',
        job.id,
        job.status === 'Wishlist' ? `Added ${job.company} — ${job.position} to wishlist` : `Applied to ${job.company} — ${job.position}`,
      );
      return job;
    },
    [setJobs, log],
  );

  const updateJob = useCallback(
    (id: string, input: Partial<JobInput>) => {
      const existing = jobs.find((j) => j.id === id);
      if (!existing) return;
      const patch = { ...input };
      // Leaving the wishlist = the application was just sent → stamp today's date
      // (unless the user picked another date in the form).
      if (leavesWishlist(existing.status, patch.status) && (!patch.dateApplied || patch.dateApplied === existing.dateApplied)) {
        patch.dateApplied = today();
      }
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j)));
      if (patch.status && patch.status !== existing.status) {
        log('status', id, statusMessage(existing.company, existing.status, patch.status));
      } else {
        log('updated', id, `Updated ${existing.company} — ${existing.position}`);
      }
    },
    [jobs, setJobs, log],
  );

  /**
   * Used by the Kanban board: change status and place the job before
   * `beforeId` (or at the end of the list when undefined).
   */
  const moveJob = useCallback(
    (id: string, status: JobStatus, beforeId?: string) => {
      const existing = jobs.find((j) => j.id === id);
      if (!existing) return;
      setJobs((prev) => {
        const changed = status !== existing.status;
        const moved = {
          ...existing,
          status,
          dateApplied: leavesWishlist(existing.status, status) ? today() : existing.dateApplied,
          updatedAt: changed ? new Date().toISOString() : existing.updatedAt,
        };
        const rest = prev.filter((j) => j.id !== id);
        const idx = beforeId ? rest.findIndex((j) => j.id === beforeId) : -1;
        if (idx === -1) rest.push(moved);
        else rest.splice(idx, 0, moved);
        return rest;
      });
      if (status !== existing.status) {
        log('status', id, statusMessage(existing.company, existing.status, status));
      }
    },
    [jobs, setJobs, log],
  );

  const deleteJob = useCallback(
    (id: string) => {
      const existing = jobs.find((j) => j.id === id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      if (existing) log('deleted', id, `Removed ${existing.company} — ${existing.position}`);
    },
    [jobs, setJobs, log],
  );

  /** One-click "I sent it": Wishlist → Applied (dated today). */
  const markApplied = useCallback((id: string) => updateJob(id, { status: 'Applied' }), [updateJob]);

  return { jobs, activities, addJob, updateJob, moveJob, markApplied, deleteJob, setJobs };
}
