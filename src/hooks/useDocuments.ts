import { useCallback } from 'react';
import { sampleDocuments } from '../data/sampleDocuments';
import type { DocVersion, DocumentType } from '../types';
import { uid } from '../utils/id';
import { STORAGE_KEYS } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

/** Text-based resume / cover-letter versions stored in localStorage. */
export function useDocuments() {
  const [docs, setDocs] = useLocalStorage<DocVersion[]>(STORAGE_KEYS.documents, sampleDocuments);

  const addDoc = useCallback(
    (type: DocumentType, title: string, content = '') => {
      const now = new Date().toISOString();
      const doc: DocVersion = { id: uid(), type, title, content, createdAt: now, updatedAt: now };
      setDocs((prev) => [doc, ...prev]);
      return doc;
    },
    [setDocs],
  );

  const updateDoc = useCallback(
    (id: string, patch: Partial<Pick<DocVersion, 'title' | 'content'>>) =>
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d))),
    [setDocs],
  );

  const deleteDoc = useCallback((id: string) => setDocs((prev) => prev.filter((d) => d.id !== id)), [setDocs]);

  return { docs, addDoc, updateDoc, deleteDoc };
}

export interface Profile {
  name: string;
  email: string;
}

const DEFAULT_PROFILE: Profile = { name: 'Alex Nguyen', email: 'alex@example.com' };

/** The user's own name/email used to fill {{myName}} / {{myEmail}}. */
export function useProfile() {
  return useLocalStorage<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
}
