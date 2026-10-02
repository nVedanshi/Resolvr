import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'resolvr-theme';

// Resolves the stored preference, falling back to the operating system setting.
function readInitialTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Private browsing modes can block storage; the system preference still applies.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Holds the active colour scheme and keeps the document class in sync.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A failed write only means the choice is not remembered next visit.
    }
  }, [theme]);

  // Flips between the light and dark palettes.
  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Exposes the active theme to components that need to read or change it.
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }

  return context;
}