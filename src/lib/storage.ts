import type { UserPaperState } from '../types';

const USER_STATE_KEY = 'research-reader:user-paper-state:v1';
const CATEGORY_KEY = 'research-reader:enabled-categories:v1';
const THEME_KEY = 'research-reader:theme:v1';
const LANGUAGE_KEY = 'research-reader:language:v1';

const canUseStorage = () => typeof window !== 'undefined' && 'localStorage' in window;

export const readUserStates = (): Record<string, UserPaperState> => {
  if (!canUseStorage()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(USER_STATE_KEY) || '{}');
  } catch {
    return {};
  }
};

export const writeUserStates = (states: Record<string, UserPaperState>) => {
  if (canUseStorage()) window.localStorage.setItem(USER_STATE_KEY, JSON.stringify(states));
};

export const readEnabledCategories = (fallback: string[]) => {
  if (!canUseStorage()) return fallback;
  try {
    const stored = JSON.parse(window.localStorage.getItem(CATEGORY_KEY) || 'null');
    return Array.isArray(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
};

export const writeEnabledCategories = (slugs: string[]) => {
  if (canUseStorage()) window.localStorage.setItem(CATEGORY_KEY, JSON.stringify(slugs));
};

export type ThemePreference = 'light' | 'dark' | 'system';

export const readThemePreference = (): ThemePreference => {
  if (!canUseStorage()) return 'light';
  const value = window.localStorage.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'light';
};

export const writeThemePreference = (theme: ThemePreference) => {
  if (canUseStorage()) window.localStorage.setItem(THEME_KEY, theme);
};

export type Language = 'en' | 'ru';

export const readLanguage = (): Language => {
  if (!canUseStorage()) return 'en';
  const value = window.localStorage.getItem(LANGUAGE_KEY);
  return value === 'ru' || value === 'en' ? value : 'en';
};

export const writeLanguage = (language: Language) => {
  if (canUseStorage()) window.localStorage.setItem(LANGUAGE_KEY, language);
};
