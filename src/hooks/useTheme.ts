import { useEffect, useState } from 'react';
import { readThemePreference, type ThemePreference, writeThemePreference } from '../lib/storage';

const resolveTheme = (preference: ThemePreference) => {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
};

export function useTheme() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => readThemePreference());

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(themePreference);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
      document.documentElement.dataset.theme = resolved;
    };

    apply();
    writeThemePreference(themePreference);

    if (themePreference !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [themePreference]);

  const toggleTheme = () => setThemePreference((current) => (resolveTheme(current) === 'dark' ? 'light' : 'dark'));

  return { themePreference, setThemePreference, toggleTheme };
}
