"use client";

import { useSyncExternalStore } from "react";
import { getCurrentTheme, subscribeToTheme, toggleTheme } from "@/lib/theme";

type ThemeToggleProps = {
  id: string;
  className: string;
  iconClassName?: string;
};

const getSnapshot = () => getCurrentTheme() === "dark";
const getServerSnapshot = () => false;

export default function ThemeToggle({ id, className, iconClassName = "" }: ThemeToggleProps) {
  const dark = useSyncExternalStore(subscribeToTheme, getSnapshot, getServerSnapshot);

  return (
    <button
      id={id}
      className={className}
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
    >
      <i className={`fas ${dark ? "fa-sun" : "fa-moon"} ${iconClassName}`}></i>
    </button>
  );
}
