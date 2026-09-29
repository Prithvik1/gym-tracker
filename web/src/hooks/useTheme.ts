import { useState } from 'react';

function isDark() {
  return document.documentElement.classList.contains('dark');
}

/** Reads/toggles the `.dark` class set on <html> by the blocking init script in index.html. */
export function useTheme() {
  const [dark, setDark] = useState(isDark);

  function toggle() {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }

  return { dark, toggle };
}
