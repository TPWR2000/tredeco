import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

function getInitialDarkMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedTheme = window.localStorage.getItem('tredeco-theme');
  if (savedTheme === 'dark') {
    return true;
  }
  if (savedTheme === 'light') {
    return false;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem('tredeco-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <button
      type="button"
      onClick={() => setIsDarkMode((current) => !current)}
      className="pointer-events-auto rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label="Przełącz motyw"
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
