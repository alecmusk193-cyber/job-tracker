import { useEffect } from 'react';
import { PREF_KEYS } from '../utils/localPrefs';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

const systemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const initialTheme = systemTheme();

/** Light/dark theme — a per-device preference kept in localStorage; toggles the `dark` class on <html>. */
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(PREF_KEYS.theme, initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
}
