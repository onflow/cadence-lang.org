'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import {
  ThemeToggler,
  type ThemeSelection,
  type Resolved,
} from './ThemeToggler';

const modes: ThemeSelection[] = ['light', 'dark', 'system'];

function getIcon(effective: ThemeSelection, resolved: Resolved) {
  const theme = effective === 'system' ? 'system' : resolved;
  if (theme === 'system') return <Monitor className="w-4 h-4" />;
  if (theme === 'dark') return <Moon className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
}

function getNextTheme(effective: ThemeSelection): ThemeSelection {
  const i = modes.indexOf(effective);
  if (i === -1) return modes[0];
  return modes[(i + 1) % modes.length];
}

export function ThemeToggleButton() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="inline-flex items-center justify-center rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  return (
    <ThemeToggler
      theme={(theme as ThemeSelection) ?? 'system'}
      resolvedTheme={(resolvedTheme as Resolved) ?? 'light'}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ effective, resolved, toggleTheme }) => (
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground transition-colors"
          onClick={() => toggleTheme(getNextTheme(effective))}
          aria-label="Toggle theme"
        >
          {getIcon(effective, resolved)}
        </button>
      )}
    </ThemeToggler>
  );
}
