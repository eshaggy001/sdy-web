import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 hover:border-sdy-red/40 dark:hover:border-sdy-red/40 transition-all bg-white/60 dark:bg-gray-800/60"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={15} className="text-sdy-black/60 transition-transform duration-300" />
      ) : (
        <Sun size={15} className="text-yellow-400 transition-transform duration-300" />
      )}
    </button>
  );
};
