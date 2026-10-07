'use client';

import { useSyncExternalStore } from 'react';
import { getCurrentTheme, subscribeToTheme, toggleTheme } from '@/lib/theme';

type ThemeToggleLabels = {
  toLight: string;
  toDark: string;
};

type ThemeToggleProps = {
  id: string;
  className: string;
  iconClassName?: string;
  labels?: ThemeToggleLabels;
};

const defaultLabels: ThemeToggleLabels = {
  toLight: 'Switch to light mode',
  toDark: 'Switch to dark mode',
};

const getSnapshot = () => getCurrentTheme() === 'dark';
const getServerSnapshot = () => false;

export default function ThemeToggle({
  id,
  className,
  iconClassName = '',
  labels = defaultLabels,
}: ThemeToggleProps) {
  const dark = useSyncExternalStore(
    subscribeToTheme,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <button
      id={id}
      className={className}
      aria-label={dark ? labels.toLight : labels.toDark}
      onClick={toggleTheme}
    >
      <i className={`fas ${dark ? 'fa-sun' : 'fa-moon'} ${iconClassName}`}></i>
    </button>
  );
}
