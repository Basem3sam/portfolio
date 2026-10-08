"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLICKS_NEEDED,
  CLUE_START_CLICK,
  HINT_LEVELS,
  KONAMI_CODE,
  REMINDERS,
  getHintLevel,
  isMobileViewport,
} from "@/components/easter-egg/constants";
import KonamiKeyboard from "@/components/easter-egg/KonamiKeyboard";
import SecretTerminalAccess from "@/components/easter-egg/SecretTerminalAccess";
import Toasts, { type ToastData } from "@/components/easter-egg/Notifications";
import SecretClue from "@/components/easter-egg/SecretClue";
import Terminal from "@/components/easter-egg/Terminal";
import {
  animateClue,
  animateProfileClick,
  createCelebrationParticles,
  createConfettiBurst,
  createDirectionalParticles,
  createEpicCelebration,
} from "@/lib/effects";
import { playKonamiSound, playSuccessSound, setupAudio } from "@/lib/sounds";
import type { Locale } from "@/lib/i18n";
import type { TerminalMode } from "@/components/easter-egg/constants";

type Overlay = "none" | "prompt" | "keyboard";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type NewToast = DistributiveOmit<ToastData, "id">;

const MIN_CLICK_INTERVAL = 300;
const SPAM_WINDOW = 1000;
const SPAM_THRESHOLD = 3;
const UNLOCKED_KEY = "terminal_unlocked";
const OPEN_TERMINAL_EVENT = "open-secret-terminal";

type EasterEggCoreProps = {
  mode: TerminalMode;
  initialClicks: number;
  locale: Locale;
};

export default function EasterEggCore({ mode, initialClicks, locale }: EasterEggCoreProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [clue, setClue] = useState({ revealed: false, level: 0 });
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(UNLOCKED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const clueRef = useRef<HTMLButtonElement>(null);
  const terminalOpenRef = useRef(false);
  const nextToastId = useRef(0);
  const game = useRef({
    clicks: 0,
    lastClick: 0,
    timestamps: [] as number[],
    spamActive: false,
    level: 0,
    revealed: false,
    resetTimer: 0,
  });

  const addToast = useCallback((toast: NewToast) => {
    const id = nextToastId.current++;
    const exclusive = toast.kind === "hint" || toast.kind === "access";

    setToasts((current) => [
      ...current.filter((item) => !(exclusive && item.kind === toast.kind)),
      { ...toast, id } as ToastData,
    ]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const openTerminal = useCallback(() => {
    try {
      localStorage.setItem(UNLOCKED_KEY, "1");
    } catch {}
    setUnlocked(true);
    terminalOpenRef.current = true;
    setToasts((current) =>
      current.map((toast) => (toast.kind === "master" ? { ...toast, closing: true } : toast)),
    );
    setTerminalOpen(true);
  }, []);

  const closeTerminal = useCallback(() => {
    terminalOpenRef.current = false;
    setTerminalOpen(false);
  }, []);

  const handleMasterShown = useCallback(() => {
    createCelebrationParticles();
    createConfettiBurst();
    playSuccessSound();
  }, []);

  useEffect(() => {
    const state = game.current;
    state.clicks = initialClicks;
    state.level = getHintLevel(initialClicks);

    try {
      if (localStorage.getItem(UNLOCKED_KEY) === "1") {
        state.revealed = true;
        state.level = HINT_LEVELS.length - 1;
      }
    } catch {}

    setClue({ revealed: state.revealed, level: state.level });

    if (mode === "terminal") openTerminal();
    if (mode === "prompt") setOverlay("prompt");

    return setupAudio();
  }, [mode, initialClicks, openTerminal]);

  useEffect(() => {
    let index = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (terminalOpenRef.current) return;

      if (event.key === KONAMI_CODE[index]) {
        index++;
        if (index === KONAMI_CODE.length) {
          event.preventDefault();
          index = 0;
          openTerminal();
        }
      } else if (index > 0) {
        index = 0;
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        openTerminal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openTerminal]);

  // UI access while the core is already loaded (palette item, footer button).
  useEffect(() => {
    const openFromUI = () => {
      if (terminalOpenRef.current) return;
      if (unlocked) {
        openTerminal();
        return;
      }
      setOverlay((current) => (current === "none" ? "prompt" : current));
    };

    window.addEventListener(OPEN_TERMINAL_EVENT, openFromUI);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, openFromUI);
  }, [unlocked, openTerminal]);

  useEffect(() => {
    const image = document.querySelector<HTMLElement>("#hero picture img");
    if (!image) return;

    const state = game.current;
    const syncClue = () => setClue({ revealed: state.revealed, level: state.level });

    const reset = (notify: boolean) => {
      window.clearTimeout(state.resetTimer);
      state.clicks = 0;
      state.level = 0;
      state.revealed = false;
      syncClue();
      if (notify) addToast({ kind: "reset" });
    };

    const startResetTimer = (duration: number) => {
      window.clearTimeout(state.resetTimer);
      state.resetTimer = window.setTimeout(() => reset(true), duration);
    };

    const unlock = () => {
      try {
        localStorage.setItem(UNLOCKED_KEY, "1");
      } catch {}
      setUnlocked(true);
      setToasts((current) =>
        current.map((toast) => (toast.kind === "hint" ? { ...toast, closing: true } : toast)),
      );
      state.revealed = true;
      state.clicks = 0;
      state.level = HINT_LEVELS.length - 1;
      syncClue();
      if (clueRef.current) animateClue(clueRef.current, "celebration", 2000);
      addToast({ kind: "master" });
      createEpicCelebration();
    };

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();

      const now = Date.now();
      if (now - state.lastClick < MIN_CLICK_INTERVAL) return;
      state.lastClick = now;

      state.timestamps = state.timestamps.filter((time) => now - time < SPAM_WINDOW);
      state.timestamps.push(now);
      const spamming = state.timestamps.length > SPAM_THRESHOLD;

      if (spamming && !state.spamActive) {
        state.spamActive = true;
        addToast({ kind: "spam" });
        window.setTimeout(() => {
          state.spamActive = false;
        }, 2000);
      }

      if (spamming) {
        reset(false);
        return;
      }

      state.clicks++;
      window.clearTimeout(state.resetTimer);

      animateProfileClick(image, state.clicks);
      if (state.clicks >= 2) createDirectionalParticles(image, state.clicks);
      playKonamiSound(state.clicks);

      const previousLevel = state.level;
      state.level = getHintLevel(state.clicks);

      if (state.clicks >= CLUE_START_CLICK && state.clicks < CLICKS_NEEDED && !state.revealed) {
        state.revealed = true;
        if (clueRef.current) animateClue(clueRef.current, "reveal", 1000);
      }

      if (state.clicks >= CLICKS_NEEDED) {
        unlock();
        return;
      }

      if (state.level !== previousLevel && HINT_LEVELS[state.level].showNotification) {
        addToast({ kind: "hint", level: state.level, clicks: state.clicks });
      }

      syncClue();
      if (state.level === 4 && clueRef.current) animateClue(clueRef.current, "reveal", 2000);
      startResetTimer(state.spamActive ? 3000 : 5000);
    };

    image.classList.add("cursor-pointer");
    image.addEventListener("click", handleClick);

    return () => {
      image.removeEventListener("click", handleClick);
      window.clearTimeout(state.resetTimer);
      image.classList.remove("cursor-pointer");
    };
  }, [addToast]);

  const showHint = () => {
    if (overlay !== "none") return;

    addToast({
      kind: "reminder",
      text: REMINDERS[Math.floor(Math.random() * REMINDERS.length)],
    });
  };

  const openPrompt = () => {
    if (overlay !== "none") return;
    setOverlay("prompt");
  };

  const handleKeyboardSuccess = () => {
    setOverlay("none");
    openTerminal();
    addToast({ kind: "access" });
    createCelebrationParticles();
    createConfettiBurst();
    playSuccessSound();
  };

  return (
    <>
      <SecretClue
        buttonRef={clueRef}
        revealed={clue.revealed}
        unlocked={unlocked}
        locale={locale}
        onHint={showHint}
        onPrompt={openPrompt}
        onOpen={openTerminal}
      />
      <Terminal key={terminalOpen ? "open" : "closed"} open={terminalOpen} onClose={closeTerminal} />
      {overlay === "prompt" && (
        <SecretTerminalAccess
          onClose={() => setOverlay("none")}
          onTry={() => setOverlay("keyboard")}
        />
      )}
      {overlay === "keyboard" && (
        <KonamiKeyboard
          onClose={() => setOverlay("none")}
          onBack={() => setOverlay("prompt")}
          onSuccess={handleKeyboardSuccess}
        />
      )}
      <Toasts toasts={toasts} onRemove={removeToast} onMasterShown={handleMasterShown} />
    </>
  );
}