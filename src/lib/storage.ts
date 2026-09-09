import type { UserPaperState } from '../types';

const USER_STATE_KEY = 'research-reader:user-paper-state:v1';
const CATEGORY_KEY = 'research-reader:enabled-categories:v1';
const THEME_KEY = 'research-reader:theme:v1';
const LANGUAGE_KEY = 'research-reader:language:v1';

const failedWrites = new Set<string>();
export const storageFailures = () => [...failedWrites];

export const readStorage = (key: string): string | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, value);
    failedWrites.delete(key);
  } catch {
    failedWrites.add(key);
  }
  window.dispatchEvent(new CustomEvent('reader-storage-status'));
  return !failedWrites.has(key);
};

export const readUserStates = (): Record<string, UserPaperState> => {
  try {
    const parsed: unknown = JSON.parse(readStorage(USER_STATE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).flatMap(([id, value]) => {
      if (!value || typeof value !== 'object' || typeof value.isSaved !== 'boolean' || typeof value.isRead !== 'boolean') return [];
      const state: UserPaperState = { paperId: id, isSaved: value.isSaved, isRead: value.isRead };
      if (typeof value.note === 'string') state.note = value.note;
      for (const key of ['viewedAt', 'savedAt'] as const) {
        if (typeof value[key] === 'string' && Number.isFinite(Date.parse(value[key]))) state[key] = value[key];
      }
      return [[id, state]];
    }));
  } catch {
    return {};
  }
};

export const writeUserStates = (states: Record<string, UserPaperState>) => {
  return writeStorage(USER_STATE_KEY, JSON.stringify(states));
};

export const readEnabledCategories = (fallback: string[]) => {
  try {
    const stored: unknown = JSON.parse(readStorage(CATEGORY_KEY) || 'null');
    return Array.isArray(stored) && stored.every((value) => typeof value === 'string') ? stored : fallback;
  } catch {
    return fallback;
  }
};

export const writeEnabledCategories = (slugs: string[]) => {
  return writeStorage(CATEGORY_KEY, JSON.stringify(slugs));
};

export type ThemePreference = 'light' | 'dark' | 'system';

export const readThemePreference = (): ThemePreference => {
  const value = readStorage(THEME_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'light';
};

export const writeThemePreference = (theme: ThemePreference) => {
  return writeStorage(THEME_KEY, theme);
};

export type Language = 'en' | 'ru';

export const readLanguage = (): Language => {
  const value = readStorage(LANGUAGE_KEY);
  return value === 'ru' || value === 'en' ? value : 'en';
};

export const writeLanguage = (language: Language) => {
  return writeStorage(LANGUAGE_KEY, language);
};
