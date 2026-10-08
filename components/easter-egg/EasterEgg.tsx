"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { KONAMI_CODE } from "@/components/easter-egg/constants";

const EasterEggCore = dynamic(() => import("./EasterEggCore"), { ssr: false });

const UNLOCKED_KEY = "terminal_unlocked";
const MIN_CLICK_INTERVAL = 300;

export default function EasterEgg() {
  const [load, setLoad] = useState<{ autoOpen: boolean } | null>(null);
  const clicks = useRef(0);
  const lastClick = useRef(0);
  const konamiIndex = useRef(0);
  const armed = useRef(false);

  const arm = useCallback((autoOpen: boolean) => {
    if (armed.current) return;
    armed.current = true;
    setLoad({ autoOpen });
  }, []);

  useEffect(() => {
    let unlocked = false;
    try {
      unlocked = localStorage.getItem(UNLOCKED_KEY) === "1";
    } catch {}

    if (unlocked) {
      console.log(
        "%c🎮 Welcome back, terminal master!",
        "color: #fbbf24; font-size: 16px; font-weight: bold;",
      );
      console.log("%cPress Ctrl + Shift + B to reopen the terminal", "color: #fbbf24; font-size: 12px;");
    } else {
      console.log(
        "%c🎮 SECRET TERMINAL AVAILABLE!",
        "color: #fbbf24; font-size: 16px; font-weight: bold;",
      );
      console.log("%cPress Ctrl + Shift + B to open the terminal", "color: #e8e6e1; font-size: 12px;");
      console.log(
        "%cOr try the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A",
        "color: #f87171; font-size: 12px;",
      );
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (armed.current) return;

      if (event.key === KONAMI_CODE[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === KONAMI_CODE.length) {
          event.preventDefault();
          konamiIndex.current = 0;
          arm(true);
        }
      } else if (konamiIndex.current > 0) {
        konamiIndex.current = 0;
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        arm(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [arm]);

  useEffect(() => {
    if (load) return;

    const image = document.querySelector<HTMLElement>("#hero picture img");
    if (!image) return;

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      const now = Date.now();
      if (now - lastClick.current < MIN_CLICK_INTERVAL) return;
      lastClick.current = now;
      clicks.current++;
      if (clicks.current === 1) arm(false);
    };

    image.classList.add("cursor-pointer");
    image.addEventListener("click", handleClick);
    return () => {
      image.removeEventListener("click", handleClick);
      if (!armed.current) image.classList.remove("cursor-pointer");
    };
  }, [load, arm]);

  if (!load) return null;

  return <EasterEggCore autoOpen={load.autoOpen} initialClicks={clicks.current} />;
}