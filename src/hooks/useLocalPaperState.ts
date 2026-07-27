import { useCallback, useState } from 'react';
import type { UserPaperState } from '../types';
import { readUserStates, writeUserStates } from '../lib/storage';

const patchState = (
  states: Record<string, UserPaperState>,
  paperId: string,
  patch: Partial<UserPaperState>
) => ({
  ...states,
  [paperId]: {
    ...(states[paperId] || { paperId, isSaved: false, isRead: false }),
    ...patch,
    paperId
  }
});

export function useLocalPaperState() {
  const [states, setStates] = useState<Record<string, UserPaperState>>(() => readUserStates());

  const update = useCallback((paperId: string, patch: Partial<UserPaperState>) => {
    setStates((current) => {
      const next = patchState(current, paperId, patch);
      writeUserStates(next);
      return next;
    });
  }, []);

  const toggleSaved = useCallback((paperId: string) => {
    setStates((current) => {
      const currentItem = current[paperId];
      const isSaved = !currentItem?.isSaved;
      const next = patchState(current, paperId, {
        isSaved,
        savedAt: isSaved ? new Date().toISOString() : currentItem?.savedAt
      });
      writeUserStates(next);
      return next;
    });
  }, []);

  const markViewed = useCallback((paperId: string) => update(paperId, { viewedAt: new Date().toISOString() }), [update]);
  const markRead = useCallback((paperId: string, isRead: boolean) => update(paperId, { isRead }), [update]);
  const saveNote = useCallback((paperId: string, note: string) => update(paperId, { note }), [update]);

  const removeFromHistory = useCallback((paperId: string) => {
    setStates((current) => {
      const next = patchState(current, paperId, { viewedAt: undefined });
      writeUserStates(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setStates((current) => {
      const next = Object.fromEntries(Object.entries(current).map(([id, state]) => [id, { ...state, viewedAt: undefined }]));
      writeUserStates(next);
      return next;
    });
  }, []);

  return { states, toggleSaved, markViewed, markRead, saveNote, removeFromHistory, clearHistory };
}
