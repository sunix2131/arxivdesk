import { useCallback, useRef, useState } from 'react';
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
  const latest = useRef(states);
  const commit = useCallback((change: (current: Record<string, UserPaperState>) => Record<string, UserPaperState>) => {
    const next = change(latest.current);
    latest.current = next;
    writeUserStates(next);
    setStates(next);
  }, []);

  const update = useCallback((paperId: string, patch: Partial<UserPaperState>) => {
    commit((current) => patchState(current, paperId, patch));
  }, [commit]);

  const toggleSaved = useCallback((paperId: string) => {
    commit((current) => {
      const currentItem = current[paperId];
      const isSaved = !currentItem?.isSaved;
      const next = patchState(current, paperId, {
        isSaved,
        savedAt: isSaved ? new Date().toISOString() : currentItem?.savedAt
      });
      return next;
    });
  }, [commit]);

  const markViewed = useCallback((paperId: string) => update(paperId, { viewedAt: new Date().toISOString() }), [update]);
  const markRead = useCallback((paperId: string, isRead: boolean) => update(paperId, { isRead }), [update]);
  const saveNote = useCallback((paperId: string, note: string) => update(paperId, { note }), [update]);

  const removeFromHistory = useCallback((paperId: string) => {
    commit((current) => {
      const next = patchState(current, paperId, { viewedAt: undefined });
      return next;
    });
  }, [commit]);

  const clearHistory = useCallback(() => {
    commit((current) => {
      const next = Object.fromEntries(Object.entries(current).map(([id, state]) => [id, { ...state, viewedAt: undefined }]));
      return next;
    });
  }, [commit]);

  return { states, toggleSaved, markViewed, markRead, saveNote, removeFromHistory, clearHistory };
}
