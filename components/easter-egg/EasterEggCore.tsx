"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLICKS_NEEDED,
  CLUE_LINGER_MS,
  CLUE_START_CLICK,
  HINT_LEVELS,
  KONAMI_CODE,
  REMINDERS,
  getHintLevel,
} from "@/components/easter-egg/constants";
import KonamiKeyboard from "@/components/easter-egg/KonamiKeyboard";
import MasterCode from "@/components/easter-egg/MasterCode";
import SecretTerminalAccess from "@/components/easter-egg/SecretTerminalAccess";
import Toasts, { type ToastData } from "@/components/easter-egg/Notifications";
import SecretClue from "@/components/easter-egg/SecretClue";
import Terminal from "@/components/easter-egg/Terminal";
import {
  animateClue,
  animateProfileClick,
  createCelebrationParticles,
  createConfettiBurst,
  createClickRipple,
  createDirectionalParticles,
  createEpicCelebration,
} from "@/lib/effects";
import { bindPortraitCursor, isOnPortrait } from "@/lib/portrait-hit";
import { playKonamiSound, playSuccessSound, resumeAudio, setupAudio } from "@/lib/sounds";
import type { Locale } from "@/lib/i18n";
import type { TerminalMode } from "@/components/easter-egg/constants";

type Overlay = "none" | "prompt" | "keyboard" | "master";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type NewToast = DistributiveOmit<ToastData, "id">;

const MIN_CLICK_INTERVAL = 300;
const SPAM_WINDOW = 1000;
const SPAM_THRESHOLD = 3;
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
  // Hand-offs between overlays: the old one stays underneath as a frozen
  // ghost while the new one dissolves in, so there is never a blank beat.
  const [behind, setBehind] = useState<Overlay>("none");
  const [quick, setQuick] = useState(false);
  const [keyboardFrom, setKeyboardFrom] = useState<"prompt" | "master">("prompt");
  const behindTimer = useRef(0);
  const [clue, setClue] = useState({ revealed: false, level: 0 });
  const [unlocked, setUnlocked] = useState(false);
  const clueRef = useRef<HTMLButtonElement>(null);
  const terminalOpenRef = useRef(false);
  const nextToastId = useRef(0);
  const resetJourney = useRef<(notify: boolean) => void>(() => {});
  const settleJourney = useRef<() => void>(() => {});
  const holdLinger = useRef<(busy: boolean) => void>(() => {});
  const busyRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const game = useRef({
    clicks: 0,
    lastClick: 0,
    timestamps: [] as number[],
    spamActive: false,
    level: 0,
    revealed: false,
    solved: false,
    masterShown: false,
    lingering: false,
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

  // The terminal's only concern is the terminal. It reads and writes nothing
  // the click game owns - the two systems are fully independent.
  const openTerminal = useCallback(() => {
    setUnlocked(true);
    terminalOpenRef.current = true;
    setTerminalOpen(true);
  }, []);

  const closeTerminal = useCallback(() => {
    terminalOpenRef.current = false;
    setTerminalOpen(false);
  }, []);

  const celebrateUnlock = useCallback(() => {
    addToast({ kind: "access" });
    createCelebrationParticles();
    createConfettiBurst();
    playSuccessSound();
  }, [addToast]);

  useEffect(() => {
    const state = game.current;
    state.clicks = initialClicks;
    state.level = getHintLevel(initialClicks);
    setClue({ revealed: state.revealed, level: state.level });

    if (mode === "terminal") {
      openTerminal();
      celebrateUnlock();
    }
    if (mode === "prompt") {
      setQuick(false);
      setOverlay("prompt");
    }

    return setupAudio();
  }, [mode, initialClicks, openTerminal, celebrateUnlock]);

  // Keyboard Konami and the shortcut: the actual easter-egg triggers.
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
          celebrateUnlock();
        }
      } else if (index > 0) {
        index = 0;
      }

      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        if (unlocked) {
          openTerminal();
        } else {
          setQuick(false);
      setOverlay((current) => (current === "none" ? "prompt" : current));
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openTerminal, unlocked, celebrateUnlock]);

  // UI access (palette item, footer button): unlocked opens directly,
  // locked opens the code entry area. Never touches the click game.
  useEffect(() => {
    const openFromUI = () => {
      if (terminalOpenRef.current) return;
      if (unlocked) {
        openTerminal();
        return;
      }
      setQuick(false);
      setOverlay((current) => (current === "none" ? "prompt" : current));
    };

    window.addEventListener(OPEN_TERMINAL_EVENT, openFromUI);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, openFromUI);
  }, [unlocked, openTerminal]);

  // The photo journey: a hint delivery system and nothing more. Its ONLY
  // outcome is revealing the Konami Master Code window - the answer sheet.
  // The effect depends on a single stable callback, so it mounts once and
  // nothing the terminal does can ever tear it down or reset the counter.
  useEffect(() => {
    const image = document.querySelector<HTMLElement>("#hero picture img");
    if (!image) return;
    // Same story as the loader: clicks land on the portrait button when it
    // exists; the photo underneath keeps the animation targets.
    const hit = document.querySelector<HTMLElement>("#pf-hit");
    const target = hit ?? image;

    const state = game.current;
    const syncClue = () => setClue({ revealed: state.revealed, level: state.level });

    const reset = (notify: boolean) => {
      window.clearTimeout(state.resetTimer);
      state.clicks = 0;
      state.level = 0;
      state.revealed = false;
      state.solved = false;
      state.lingering = false;
      syncClue();
      if (notify) addToast({ kind: "reset" });
    };

    // The master window closes from outside this effect, so the quiet
    // reset it triggers is handed back through a ref.
    resetJourney.current = reset;

    const scheduleLinger = () => {
      window.clearTimeout(state.resetTimer);
      state.resetTimer = window.setTimeout(() => reset(false), CLUE_LINGER_MS);
    };

    const settle = () => {
      window.clearTimeout(state.resetTimer);
      state.clicks = 0;
      state.level = 0;
      state.solved = false;
      state.revealed = true;
      state.lingering = true;
      syncClue();
      if (!busyRef.current) scheduleLinger();
    };

    settleJourney.current = settle;

    holdLinger.current = (busy) => {
      if (!state.lingering) return;
      if (busy) window.clearTimeout(state.resetTimer);
      else scheduleLinger();
    };

    const startResetTimer = (duration: number) => {
      window.clearTimeout(state.resetTimer);
      state.resetTimer = window.setTimeout(() => reset(true), duration);
    };

    // The journey's single outcome: deliver the answer sheet. It never
    // opens the terminal, never sets unlock state, runs no open timers.
    // Guarded so clicks past ten do not stack duplicate master windows;
    // the window stays until it is closed, then the hunt quietly resets
    // so it stays replayable.
    const solve = () => {
      if (state.solved) return;
      if (state.masterShown) {
        settle();
        return;
      }
      state.solved = true;
      state.masterShown = true;

      state.revealed = true;
      state.level = HINT_LEVELS.length - 1;
      syncClue();
      if (clueRef.current) animateClue(clueRef.current, "celebration", 2000);
      setQuick(false);
      setOverlay((current) => (current === "none" ? "master" : current));
      createEpicCelebration();
      resumeAudio().then(() => playSuccessSound());

      window.clearTimeout(state.resetTimer);
    };

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      // Only the person counts, not the transparent corners of the photo's box.
      // Keyboard activation (detail 0) has no position and always counts.
      if (event.detail > 0 && !isOnPortrait(image, event.clientX, event.clientY)) return;

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
      state.lingering = false;
      window.clearTimeout(state.resetTimer);

      // Pointer clicks react where they landed; keyboard activation reports
      // no position (detail 0), so it falls back to the middle of the photo.
      const point =
        event.detail > 0 ? { x: event.clientX, y: event.clientY } : undefined;
      animateProfileClick(image, state.clicks, point);
      if (point) createClickRipple(point, state.clicks);
      if (state.clicks >= 2) createDirectionalParticles(image, state.clicks, point);
      playKonamiSound(state.clicks);

      const previousLevel = state.level;
      state.level = getHintLevel(state.clicks);

      if (state.clicks >= CLUE_START_CLICK && state.clicks < CLICKS_NEEDED && !state.revealed) {
        state.revealed = true;
        if (clueRef.current) animateClue(clueRef.current, "reveal", 1000);
      }

      if (state.clicks >= CLICKS_NEEDED) {
        solve();
        return;
      }

      if (state.level !== previousLevel && HINT_LEVELS[state.level].showNotification) {
        addToast({ kind: "hint", level: state.level, clicks: state.clicks });
      }

      syncClue();
      if (state.level === 4 && clueRef.current) animateClue(clueRef.current, "reveal", 2000);
      startResetTimer(state.spamActive ? 3000 : 5000);
    };

    // The pointer cursor follows the person's outline (set per-move), so the
    // blanket cursor-pointer class is not used on the portrait.
    const unbindCursor =
      image instanceof HTMLImageElement ? bindPortraitCursor(target, image) : () => {};
    target.addEventListener("click", handleClick);

    return () => {
      target.removeEventListener("click", handleClick);
      unbindCursor();
      window.clearTimeout(state.resetTimer);
    };
  }, [addToast]);

  const busy = overlay !== "none" || terminalOpen || menuOpen;

  useEffect(() => {
    busyRef.current = busy;
    holdLinger.current(busy);
  }, [busy]);

  const showHint = () => {
    if (overlay !== "none") return;

    const reminder = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
    addToast({ kind: "reminder", text: reminder[locale] });
  };

  const openPrompt = () => {
    if (overlay !== "none") return;
    setQuick(false);
    setOverlay("prompt");
  };

  const go = (next: Overlay) => {
    window.clearTimeout(behindTimer.current);
    setBehind(overlay);
    setQuick(true);
    setOverlay(next);
    behindTimer.current = window.setTimeout(() => setBehind("none"), 600);
  };

  // Master code -> keypad is one step: the person has just read the
  // sequence, so the gate that asks for it again is skipped.
  const enterFromMaster = () => {
    setKeyboardFrom("master");
    go("keyboard");
  };

  const enterFromPrompt = () => {
    setKeyboardFrom("prompt");
    go("keyboard");
  };

  const leaveKeyboard = () => {
    // The hunt that produced the master code is finished once its keypad is.
    if (keyboardFrom === "master") settleJourney.current();
    setOverlay("none");
  };

  const handleKeyboardSuccess = () => {
    // The terminal opens on top of the keypad; the keypad is removed once
    // the terminal's own fade-in has covered it.
    if (keyboardFrom === "master") settleJourney.current();
    openTerminal();
    celebrateUnlock();
    window.setTimeout(() => setOverlay("none"), 700);
  };

  const ghostProps = { locale, quick: true, ghost: true, onClose: () => {} } as const;

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
        onMenuChange={setMenuOpen}
      />
      {behind === "prompt" && <SecretTerminalAccess {...ghostProps} onTry={() => {}} />}
      {behind === "keyboard" && (
        <KonamiKeyboard {...ghostProps} onBack={() => {}} onSuccess={() => {}} />
      )}
      {behind === "master" && <MasterCode {...ghostProps} onEnter={() => {}} />}
      {overlay === "prompt" && (
        <SecretTerminalAccess
          locale={locale}
          quick={quick}
          onClose={() => setOverlay("none")}
          onTry={enterFromPrompt}
        />
      )}
      {overlay === "keyboard" && (
        <KonamiKeyboard
          locale={locale}
          quick={quick}
          onClose={leaveKeyboard}
          onBack={() => go(keyboardFrom)}
          onSuccess={handleKeyboardSuccess}
        />
      )}
      {overlay === "master" && (
        <MasterCode
          locale={locale}
          quick={quick}
          onClose={() => {
            setOverlay("none");
            settleJourney.current();
          }}
          onEnter={enterFromMaster}
        />
      )}
      <Terminal
        key={terminalOpen ? "open" : "closed"}
        open={terminalOpen}
        onClose={closeTerminal}
      />
      <Toasts toasts={toasts} locale={locale} onRemove={removeToast} />
    </>
  );
}
