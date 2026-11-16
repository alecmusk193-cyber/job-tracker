import { useCallback } from 'react';
import { sampleActivities, sampleJobs } from '../data/sampleJobs';
import type { Activity, ActivityType, Job, JobInput, JobStatus } from '../types';
import { uid } from '../utils/id';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

const MAX_ACTIVITIES = 100;

/**
 * CRUD operations for job applications. Every mutation also appends an
 * entry to the activity log that powers the dashboard timeline.
 */
export function useJobs() {
  const [jobs, setJobs] = useLocalStorage<Job[]>(STORAGE_KEYS.jobs, sampleJobs);
  const [activities, setActivities] = useLocalStorage<Activity[]>(STORAGE_KEYS.activities, sampleActivities);

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
      log('created', job.id, `Applied to ${job.company} — ${job.position}`);
      return job;
    },
    [setJobs, log],
  );

  const updateJob = useCallback(
    (id: string, input: Partial<JobInput>) => {
      const existing = jobs.find((j) => j.id === id);
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...input, updatedAt: new Date().toISOString() } : j)));
      if (!existing) return;
      if (input.status && input.status !== existing.status) {
        log('status', id, `${existing.company} moved to ${input.status}${input.status === 'Offer' ? ' 🎉' : ''}`);
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
        const moved = { ...existing, status, updatedAt: status !== existing.status ? new Date().toISOString() : existing.updatedAt };
        const rest = prev.filter((j) => j.id !== id);
        const idx = beforeId ? rest.findIndex((j) => j.id === beforeId) : -1;
        if (idx === -1) rest.push(moved);
        else rest.splice(idx, 0, moved);
        return rest;
      });
      if (status !== existing.status) {
        log('status', id, `${existing.company} moved to ${status}${status === 'Offer' ? ' 🎉' : ''}`);
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

  return { jobs, activities, addJob, updateJob, moveJob, deleteJob, setJobs };
}
