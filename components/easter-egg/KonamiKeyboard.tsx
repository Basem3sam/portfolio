"use client";

import { useEffect, useRef, useState } from "react";
import { KONAMI_CODE } from "@/components/easter-egg/constants";
import OverlayShell from "@/components/easter-egg/OverlayShell";
import { useOverlay } from "@/components/easter-egg/useOverlay";
import { playErrorSound, playKonamiKeySound, warmAudioContext } from "@/lib/sounds";

type KonamiKeyboardProps = {
  onClose: () => void;
  onBack: () => void;
  onSuccess: () => void;
};

type Status = "idle" | "success" | "wrong";

const DISPLAY: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  b: "B",
  a: "A",
};

const PATTERN = ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"];

const mono = "font-[Courier_New,monospace]";

const keys = [
  { key: "ArrowUp", kind: "direction", position: "col-start-2 row-start-1" },
  { key: "ArrowLeft", kind: "direction", position: "col-start-1 row-start-2" },
  { key: "ArrowRight", kind: "direction", position: "col-start-3 row-start-2" },
  { key: "ArrowDown", kind: "direction", position: "col-start-2 row-start-3" },
  { key: "b", kind: "letter", position: "col-span-2 col-start-1 row-start-4" },
  { key: "a", kind: "letter", position: "col-start-3 row-start-4" },
] as const;

const keyStyles = {
  direction: {
    idle: "border-[rgba(0,255,65,0.3)] shadow-[0_4px_15px_rgba(0,255,65,0.2)]",
    pressed: "scale-90 border-[rgba(0,255,65,0.8)] shadow-[0_0_25px_rgba(0,255,65,0.6)]",
    color: "bg-[rgba(0,255,65,0.1)] text-[#00ff41]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.2)_0%,transparent_70%)]",
  },
  letter: {
    idle: "border-[rgba(255,107,107,0.3)] shadow-[0_4px_15px_rgba(255,107,107,0.2)]",
    pressed: "scale-90 border-[rgba(255,107,107,0.8)] shadow-[0_0_25px_rgba(255,107,107,0.6)]",
    color: "bg-[rgba(255,107,107,0.1)] text-[#ff6b6b]",
    glow: "bg-[radial-gradient(circle_at_center,rgba(255,107,107,0.2)_0%,transparent_70%)]",
  },
};

function createPattern() {
  return Array.from({ length: 20 }, () => ({
    symbol: PATTERN[Math.floor(Math.random() * PATTERN.length)],
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    size: 20 + Math.random() * 20,
  }));
}

export default function KonamiKeyboard({ onClose, onBack, onSuccess }: KonamiKeyboardProps) {
  const { visible, containerVisible, leave } = useOverlay();
  const [sequence, setSequence] = useState<string[]>([]);
  const [pressed, setPressed] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [pattern] = useState(createPattern);
  const timers = useRef<number[]>([]);

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
      later(() => leave(onSuccess), 800);
      return;
    }

    playErrorSound();
    setStatus("wrong");
    later(() => setStatus("idle"), 1000);
    later(() => setSequence([]), 1500);
  };

  const press = (key: string) => {
    if (sequence.length >= KONAMI_CODE.length) return;

    setPressed(key);
    later(() => setPressed(null), 200);
    playKonamiKeySound(key, sequence.length);

    const next = [...sequence, key];
    setSequence(next);

    if (next.length === KONAMI_CODE.length) later(() => check(next), 500);
  };

  const backspace = () => {
    if (sequence.length === 0) return;
    setSequence(sequence.slice(0, -1));
    playKonamiKeySound("backspace", 0);
  };

  const empty = sequence.length === 0;

  return (
    <OverlayShell
      icon="👾"
      title="Konami Code"
      visible={visible}
      containerVisible={containerVisible}
      onClose={() => leave(onClose)}
      background={
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.08]">
          {pattern.map((item, index) => (
            <div
              key={index}
              className="absolute animate-symbol-float font-black text-[#00ff41] [text-shadow:0_0_10px_rgba(0,255,65,0.5)]"
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                animationDelay: `${item.delay}s`,
                fontSize: `${item.size}px`,
              }}
            >
              {item.symbol}
            </div>
          ))}
        </div>
      }
    >
      <div className="p-5 max-[481px]:p-3.5">
        <div className="mb-4 rounded-xl border-2 border-[rgba(0,255,65,0.2)] bg-black/60 p-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
          <div
            className={`mb-2.5 flex min-h-[45px] flex-wrap items-center justify-center gap-1.5 rounded-lg bg-black/30 p-2 ${status === "wrong" ? "animate-shake" : ""}`}
          >
            {empty ? (
              <span className="text-[12px] text-[#666] italic">Tap to begin...</span>
            ) : (
              sequence.map((key, index) => {
                const correct = key === KONAMI_CODE[index];
                const tone = correct
                  ? "border-[rgba(0,255,65,0.6)] bg-[rgba(0,255,65,0.15)] text-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.5)]"
                  : "border-[rgba(255,71,87,0.6)] bg-[rgba(255,71,87,0.15)] text-[#ff4757] shadow-[0_0_20px_rgba(255,71,87,0.5)]";
                const effect =
                  status === "success"
                    ? "animate-success-pulse border-[rgba(0,255,65,0.8)] shadow-[0_0_30px_rgba(0,255,65,0.8)]"
                    : "animate-key-appear";

                return (
                  <span
                    key={index}
                    className={`inline-block min-w-8 rounded-lg border-2 px-2.5 py-1.5 text-center text-[16px] font-black transition-all duration-300 ${tone} ${effect}`}
                  >
                    {DISPLAY[key]}
                  </span>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex-1 rounded-lg border border-[rgba(0,217,255,0.3)] bg-[rgba(0,217,255,0.1)] px-3 py-1.5 text-center text-[14px] font-bold text-[#00d9ff]">
              <span key={sequence.length} className="inline-block animate-success-pulse">
                {sequence.length}/10
              </span>
            </span>
            <button
              className="cursor-pointer rounded-lg border border-[rgba(255,165,2,0.3)] bg-[rgba(255,165,2,0.1)] px-3 py-1.5 font-bold text-[#ffa502] transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Backspace"
              disabled={empty}
              onClick={backspace}
            >
              ⌫
            </button>
            <button
              className="cursor-pointer rounded-lg border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.1)] px-3 py-1.5 font-bold text-[#ff6b6b] transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Clear"
              disabled={empty}
              onClick={() => setSequence([])}
            >
              ↺
            </button>
          </div>
          {status === "wrong" && (
            <div className="mt-2.5 flex animate-feedback-slide items-center justify-center gap-2 rounded-lg border border-[rgba(255,71,87,0.4)] bg-[rgba(255,71,87,0.15)] p-2.5 text-[13px] font-bold text-[#ff4757] shadow-[0_0_20px_rgba(255,71,87,0.3)]">
              <span>❌</span>
              <span>Incorrect sequence!</span>
            </div>
          )}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="col-start-2 row-start-2 flex animate-center-pulse items-center justify-center text-[28px] text-[#00ff41] [text-shadow:0_0_20px_rgba(0,255,65,0.8)]">
            ●
          </div>
          {keys.map(({ key, kind, position }) => {
            const style = keyStyles[kind];
            return (
              <button
                key={key}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 text-[24px] font-black transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 max-[481px]:p-3.5 max-[481px]:text-[22px] ${position} ${style.color} ${pressed === key ? style.pressed : style.idle}`}
                aria-label={DISPLAY[key]}
                onClick={() => press(key)}
              >
                <span
                  className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-active:opacity-100 ${style.glow}`}
                ></span>
                <span className="relative z-[2] block">{DISPLAY[key]}</span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[rgba(0,255,65,0.2)] pt-3">
          <button
            className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[rgba(149,165,166,0.3)] bg-[rgba(149,165,166,0.1)] p-2.5 text-[13px] font-bold text-[#95a5a6] transition-all duration-300 active:scale-95 ${mono}`}
            onClick={() => leave(onBack)}
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>
      </div>
    </OverlayShell>
  );
}
