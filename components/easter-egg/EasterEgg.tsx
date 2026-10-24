"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { KONAMI_CODE, type TerminalMode } from "@/components/easter-egg/constants";
import type { Locale } from "@/lib/i18n";
import { bindPortraitCursor, isOnPortrait } from "@/lib/portrait-hit";

const EasterEggCore = dynamic(() => import("./EasterEggCore"), { ssr: false });

const OPEN_TERMINAL_EVENT = "open-secret-terminal";
const MIN_CLICK_INTERVAL = 300;

type LoadState = { mode: TerminalMode; clicks: number };

export default function EasterEgg({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [load, setLoad] = useState<LoadState | null>(null);
  const clicks = useRef(0);
  const lastClick = useRef(0);
  const konamiIndex = useRef(0);
  const armed = useRef(false);

  // Access is session-scoped: no storage. A page refresh remounts this
  // module and the terminal locks again until the code is re-entered.
  const arm = useCallback((mode: TerminalMode) => {
    if (armed.current) return;
    armed.current = true;
    setLoad({ mode, clicks: clicks.current });
  }, []);

  useEffect(() => {
    console.log(
      "%c🎮 SECRET TERMINAL LOCKED!",
      "color: #fbbf24; font-size: 16px; font-weight: bold;",
    );
    console.log("%cEnter the Konami Code to unlock it:", "color: #f87171; font-size: 12px;");
    console.log("%c↑ ↑ ↓ ↓ ← → ← → B A", "color: #f87171; font-size: 12px;");
    console.log(
      "%cNo keyboard? Ctrl + Shift + B opens the code entry panel.",
      "color: #e8e6e1; font-size: 12px;",
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (armed.current) return;

      if (event.key === KONAMI_CODE[konamiIndex.current]) {
        konamiIndex.current++;
        if (konamiIndex.current === KONAMI_CODE.length) {
          event.preventDefault();
          konamiIndex.current = 0;
          arm("terminal");
        }
      } else if (konamiIndex.current > 0) {
        konamiIndex.current = 0;
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        arm("prompt");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [arm]);

  // UI access (palette item, footer button): always opens the code entry
  // area on a fresh load - the gate is the Konami code, never a bypass.
  useEffect(() => {
    const openFromUI = () => arm("prompt");

    window.addEventListener(OPEN_TERMINAL_EVENT, openFromUI);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, openFromUI);
  }, [arm]);

  // Warm-up. The first click used to download, parse and evaluate the whole
  // game (the terminal alone is ~1,800 lines) and create the audio context, all
  // inside the press, which showed up as dropped frames on the first few
  // clicks. Do that work while the browser is idle instead, so a click only has
  // to mount and animate. It starts early when someone shows intent (pointing
  // at the portrait, or any first press) and holds the heaviest step while they
  // are actively clicking. Skipped on Save-Data and very slow connections.
  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;

    const cancels: Array<() => void> = [];
    let stopped = false;
    let lastPress = -Infinity;

    const idle = (task: () => void, timeout: number) => {
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(task, { timeout });
        cancels.push(() => window.cancelIdleCallback(id));
      } else {
        const id = window.setTimeout(task, Math.min(timeout, 1200));
        cancels.push(() => window.clearTimeout(id));
      }
    };

    // Step 2 (terminal chunk, glyph fallback): never while a click run is in
    // progress, since evaluating a chunk cannot be interrupted.
    const warmRest = () => {
      const run = () => {
        if (stopped) return;
        if (performance.now() - lastPress < 1500) {
          const id = window.setTimeout(run, 1500);
          cancels.push(() => window.clearTimeout(id));
          return;
        }
        void import("@/components/easter-egg/Terminal").catch(() => {});
        void import("@/lib/effects")
          .then((effects) => effects.prewarmEffects())
          .catch(() => {});
      };
      idle(run, 6000);
    };

    // Step 1 (the game itself). Same specifier as the lazy import, so this is
    // the very chunk the click will use; only the timing is different.
    let codeStarted = false;
    const warmCode = () => {
      if (codeStarted || stopped) return;
      codeStarted = true;
      void import("./EasterEggCore").then(warmRest).catch(() => {});
    };
    const warmCodeSoon = () => idle(warmCode, 250);

    const startAfterLoad = () => idle(warmCode, 2500);
    if (document.readyState === "complete") startAfterLoad();
    else {
      window.addEventListener("load", startAfterLoad, { once: true });
      cancels.push(() => window.removeEventListener("load", startAfterLoad));
    }

    // Audio needs a gesture first, so it is created after the first touch, key
    // or press anywhere on the page, but off the click path.
    let audioQueued = false;
    const onGesture = () => {
      warmCodeSoon();
      if (audioQueued) return;
      audioQueued = true;
      idle(() => {
        void import("@/lib/sounds").then((sounds) => sounds.prepareAudio()).catch(() => {});
      }, 2000);
    };
    const gestures = ["pointerdown", "keydown", "touchstart"] as const;
    gestures.forEach((name) =>
      window.addEventListener(name, onGesture, { once: true, passive: true }),
    );
    cancels.push(() => gestures.forEach((name) => window.removeEventListener(name, onGesture)));

    const notePress = () => {
      lastPress = performance.now();
    };
    document.addEventListener("pointerdown", notePress, { capture: true, passive: true });
    cancels.push(() => document.removeEventListener("pointerdown", notePress, true));

    // Pointing at the portrait almost always comes just before pressing it.
    const portrait = document.querySelector<HTMLElement>("#pf-hit");
    portrait?.addEventListener("pointerover", warmCodeSoon, { once: true, passive: true });
    cancels.push(() => portrait?.removeEventListener("pointerover", warmCodeSoon));

    return () => {
      stopped = true;
      cancels.forEach((cancel) => cancel());
    };
  }, []);

  useEffect(() => {
    if (load) return;

    const image = document.querySelector<HTMLElement>("#hero picture img");
    if (!image) return;
    // The portrait is a real button (mockup `#pf-hit`), so keyboard and
    // touch users play too. The image keeps the animation targets; clicks
    // land on the button sitting over it.
    const hit = document.querySelector<HTMLElement>("#pf-hit");
    const target = hit ?? image;

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      // Only the person counts, not the transparent corners of the photo's box.
      if (event.detail > 0 && !isOnPortrait(image, event.clientX, event.clientY)) return;
      const now = Date.now();
      if (now - lastClick.current < MIN_CLICK_INTERVAL) return;
      lastClick.current = now;
      clicks.current++;
      if (clicks.current === 1) arm(null);
    };

    const unbindCursor =
      image instanceof HTMLImageElement ? bindPortraitCursor(target, image) : () => {};
    target.addEventListener("click", handleClick);
    return () => {
      target.removeEventListener("click", handleClick);
      unbindCursor();
    };
  }, [load, arm, pathname]);

  if (!load) return null;

  return <EasterEggCore mode={load.mode} initialClicks={load.clicks} locale={locale} />;
}
