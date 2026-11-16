import { useCallback } from 'react';
import { sampleStudy } from '../data/sampleStudy';
import type { Resource, StudyTask, StudyTopic } from '../types';
import { uid } from '../utils/id';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

/** CRUD for weekly study topics, their daily tasks and resources. */
export function useStudyPlan() {
  const [topics, setTopics] = useLocalStorage<StudyTopic[]>(STORAGE_KEYS.study, sampleStudy);

  const patchTopic = useCallback(
    (id: string, fn: (t: StudyTopic) => StudyTopic) => setTopics((prev) => prev.map((t) => (t.id === id ? fn(t) : t))),
    [setTopics],
  );

  return {
    topics,
    addTopic: (t: Omit<StudyTopic, 'id' | 'tasks' | 'resources'>) =>
      setTopics((prev) => [...prev, { ...t, id: uid(), tasks: [], resources: [] }]),
    updateTopic: (id: string, patch: Partial<StudyTopic>) => patchTopic(id, (t) => ({ ...t, ...patch })),
    deleteTopic: (id: string) => setTopics((prev) => prev.filter((t) => t.id !== id)),
    addTask: (topicId: string, task: Omit<StudyTask, 'id' | 'done'>) =>
      patchTopic(topicId, (t) => ({ ...t, tasks: [...t.tasks, { ...task, id: uid(), done: false }] })),
    toggleTask: (topicId: string, taskId: string) =>
      patchTopic(topicId, (t) => ({ ...t, tasks: t.tasks.map((k) => (k.id === taskId ? { ...k, done: !k.done } : k)) })),
    deleteTask: (topicId: string, taskId: string) =>
      patchTopic(topicId, (t) => ({ ...t, tasks: t.tasks.filter((k) => k.id !== taskId) })),
    addResource: (topicId: string, r: Omit<Resource, 'id'>) =>
      patchTopic(topicId, (t) => ({ ...t, resources: [...t.resources, { ...r, id: uid() }] })),
    deleteResource: (topicId: string, rid: string) =>
      patchTopic(topicId, (t) => ({ ...t, resources: t.resources.filter((r) => r.id !== rid) })),
  };
}

export type StudyPlanApi = ReturnType<typeof useStudyPlan>;
