"use client";

import { useEffect, useRef, useState } from "react";
import {
  CLICKS_NEEDED,
  FAIL_HINTS,
  KONAMI_CODE,
  KEY_LABEL,
  KEY_NAME,
  eggCopy,
} from "@/components/easter-egg/constants";
import OverlayShell from "@/components/easter-egg/OverlayShell";
import { useOverlay } from "@/components/easter-egg/useOverlay";
import Icon from "@/components/ui/Icon";
import {
  isSoundMuted,
  playErrorSound,
  playKonamiKeySound,
  setSoundMuted,
  warmAudioContext,
} from "@/lib/sounds";
import type { Locale } from "@/lib/i18n";

type KonamiKeyboardProps = {
  locale: Locale;
  onClose: () => void;
  onBack: () => void;
  onSuccess: () => void;
};

type Status = "idle" | "success" | "wrong";

const PAD = [
  { key: "ArrowUp", className: "up" },
  { key: "ArrowLeft", className: "lf" },
  { key: "ArrowRight", className: "rt" },
  { key: "ArrowDown", className: "dn" },
] as const;

/**
 * The on-screen keypad (mockup `#ov-keys`, line 4429): ten slots, a D-pad
 * with B and A, undo/clear/back. A wrong try shakes the card, plays the
 * error tone and hands back a gentler hint each time — the answer is
 * never written here.
 */
export default function KonamiKeyboard({
  locale,
  onClose,
  onBack,
  onSuccess,
}: KonamiKeyboardProps) {
  const { visible, containerVisible, leave } = useOverlay();
  const [sequence, setSequence] = useState<string[]>([]);
  const [pressed, setPressed] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(() => isSoundMuted());
  const [fails, setFails] = useState(0);
  const [hint, setHint] = useState("");
  const timers = useRef<number[]>([]);
  const sequenceRef = useRef(sequence);
  const failsRef = useRef(fails);

  const c = eggCopy(locale);
  const ar = locale === "ar";

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  useEffect(() => {
    failsRef.current = fails;
  }, [fails]);

  const later = (callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  };

  useEffect(() => {
    const pending = timers.current;
    pending.push(window.setTimeout(warmAudioContext, 100));
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const check = (entered: string[]) => {
    if (entered.every((key, index) => key === KONAMI_CODE[index])) {
      setStatus("success");
      later(() => leave(onSuccess), 900);
      return;
    }

    playErrorSound();
    setStatus("wrong");
    setFails((count) => count + 1);
    later(() => {
      setStatus("idle");
      setSequence([]);
    }, 1500);
  };

  const press = (key: string) => {
    if (sequenceRef.current.length >= KONAMI_CODE.length) return;

    setPressed(key);
    later(() => setPressed(null), 200);
    playKonamiKeySound(key, sequenceRef.current.length);

    const next = [...sequenceRef.current, key];
    setSequence(next);

    if (next.length === KONAMI_CODE.length) later(() => check(next), 500);
  };

  const undo = () => {
    if (sequenceRef.current.length === 0) return;
    setSequence(sequenceRef.current.slice(0, -1));
    playKonamiKeySound("backspace", 0);
  };

  // Real keys work too: arrows and B/A drive the same path. Captured here
  // so the sequence never leaks up to the page-level listener while this
  // overlay is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!KEY_LABEL[event.key]) return;
      if (sequenceRef.current.length >= KONAMI_CODE.length) return;
      event.preventDefault();
      event.stopPropagation();
      press(event.key);
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empty = sequence.length === 0;
  const wrongSlots = status === "wrong";
  const failHint = fails > 0 ? FAIL_HINTS[Math.min(fails - 1, FAIL_HINTS.length - 1)] : null;

  return (
    <OverlayShell
      chip={c.kTitle}
      title={c.kTitle}
      visible={visible}
      containerVisible={containerVisible}
      closeLabel={c.close}
      onClose={() => leave(onClose)}
      tide
      cardClassName={status === "success" ? "good" : wrongSlots ? "bad" : undefined}
      headerActions={
        <button
          type="button"
          className="egx"
          aria-pressed={!muted}
          aria-label={c.sound}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            setSoundMuted(next);
          }}
        >
          <Icon name={muted ? "volumeOff" : "volume"} className="i" />
        </button>
      }
    >
      <div className="egbd">
        <div className="egslots" role="img" aria-label={c.kProgress}>
          {KONAMI_CODE.map((key, index) => {
            const entered = sequence[index];
            const letter = entered === "b" || entered === "a";
            const bad = wrongSlots && entered !== undefined && entered !== KONAMI_CODE[index];
            const classes = [
              entered !== undefined ? "on" : "",
              letter ? "let" : "",
              status === "success" ? "good" : bad ? "bad" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <i key={index} className={classes}>
                {entered !== undefined ? KEY_LABEL[entered] : ""}
              </i>
            );
          })}
        </div>

        <p className="egcount" dir="ltr">
          {sequence.length} / {CLICKS_NEEDED}
        </p>

        <p
          className={`egfb${status === "success" ? " ok" : status === "wrong" ? " err" : ""}`}
          role="status"
        >
          {status === "success"
            ? c.ok
            : status === "wrong"
              ? ar
                ? "ليس تمامًا. حاول مرة أخرى."
                : "Not quite. Try again."
              : c.kPh}
        </p>

        <div className="egpad" role="group" aria-label={ar ? "لوحة المفاتيح" : "Keypad"}>
          {PAD.map(({ key, className }) => (
            <button
              key={key}
              type="button"
              className={`k ${className}${pressed === key ? " press" : ""}`}
              aria-label={KEY_NAME[key]}
              onClick={() => press(key)}
            >
              <Icon name="arrowRight" className="i" />
            </button>
          ))}
          {(["b", "a"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`k let ${key}${pressed === key ? " press" : ""}`}
              aria-label={KEY_NAME[key]}
              onClick={() => press(key)}
            >
              {KEY_LABEL[key]}
            </button>
          ))}
        </div>

        <div className="egrow">
          <button
            type="button"
            className="egbtn ghost sm"
            disabled={empty}
            onClick={undo}
          >
            <Icon name="backspace" className="i" />
            <span>{c.undo}</span>
          </button>
          <button
            type="button"
            className="egbtn ghost sm"
            disabled={empty}
            onClick={() => setSequence([])}
          >
            <Icon name="rotateCcw" className="i" />
            <span>{c.clear}</span>
          </button>
          <button type="button" className="egbtn ghost sm" onClick={() => leave(onBack)}>
            <Icon name="arrowLeft" className="i" />
            <span>{c.back}</span>
          </button>
        </div>

        <p className="egt3" dir={ar ? "rtl" : "ltr"}>
          {failHint ? failHint[ar ? "ar" : "en"] : ""}
        </p>
      </div>
    </OverlayShell>
  );
}
