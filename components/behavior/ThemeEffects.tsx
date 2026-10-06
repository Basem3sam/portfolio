"use client";

import { useEffect } from "react";
import { applyTheme, getPreferredTheme, toggleTheme } from "@/lib/theme";

export default function ThemeEffects() {
  useEffect(() => {
    applyTheme(getPreferredTheme());

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "D") {
        event.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
