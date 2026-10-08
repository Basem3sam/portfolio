"use client";

import { useEffect, useState } from "react";
import OverlayShell from "@/components/easter-egg/OverlayShell";
import { useOverlay } from "@/components/easter-egg/useOverlay";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

type MobileSecretPromptProps = {
  onClose: () => void;
  onTry: () => void;
};

const RAIN_CHARACTERS = "01アイウエオカキクケコサシスセソタチツテト";

const secretButton = `relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-[14px] font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 font-mono`;

function createRain() {
  return Array.from({ length: 15 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    character: RAIN_CHARACTERS[Math.floor(Math.random() * RAIN_CHARACTERS.length)],
  }));
}

export default function MobileSecretPrompt({ onClose, onTry }: MobileSecretPromptProps) {
  const { visible, containerVisible, leave } = useOverlay();
  const [rain] = useState(createRain);

  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  return (
    <OverlayShell
      icon="🔒"
      title="Secret Terminal Access"
      visible={visible}
      containerVisible={containerVisible}
      onClose={() => leave(onClose)}
      background={
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-10">
          {rain.map((column, index) => (
            <div
              key={index}
              className={`absolute animate-matrix-fall text-[14px] text-[#fbbf24] [text-shadow:0_0_8px_rgba(251,191,36,0.8)] font-mono`}
              style={{ left: `${column.left}%`, animationDelay: `${column.delay}s` }}
            >
              {column.character}
            </div>
          ))}
        </div>
      }
    >
      <div className="px-5 py-[25px]">
        <div className="relative mx-auto mb-[25px] flex size-20 items-center justify-center">
          <div className="absolute size-full animate-ring-pulse rounded-full border-2 border-[rgba(251,191,36,0.3)]"></div>
          <div className="relative z-[2] animate-icon-bounce text-[50px] [filter:drop-shadow(0_0_20px_rgba(251,191,36,0.4))]">
            🎮
          </div>
        </div>

        <div className="mb-[25px] text-center">
          <p className="mb-3 flex flex-col gap-1 text-[15px] leading-[1.6] font-medium text-[#fbbf24]">
            <span className="text-[#a8a29e]">Enter the legendary</span>
            <span className="animate-text-glow text-[18px] font-bold tracking-[1px] text-[#fbbf24]">
              Konami Code
            </span>
            <span className="text-[#a8a29e]">to unlock the developer terminal</span>
          </p>
          <p className="flex items-center justify-center gap-2 text-[13px] text-[#fde68a] opacity-90">
            <span className="animate-sparkle text-[16px]">✨</span>
            <em>A classic gaming sequence holds the key...</em>
          </p>
        </div>

        <div className="relative mb-[25px] overflow-hidden rounded-xl border border-[rgba(251,191,36,0.2)] bg-black/50 p-4 before:absolute before:top-0 before:left-[-100%] before:h-full before:w-full before:animate-progress-sweep before:bg-[linear-gradient(90deg,transparent_0%,rgba(251,191,36,0.05)_50%,transparent_100%)] before:content-['']">
          <div className="relative mb-3 flex items-center justify-center gap-2">
            <span className="text-[18px]">🕹️</span>
            <span className="text-[13px] font-semibold text-[#fde68a]">
              The code is hidden in gaming history
            </span>
          </div>
          <div className="relative mt-3 flex justify-center gap-2">
            <span className="size-2 animate-dot-pulse-1 rounded-full bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.6)]"></span>
            <span className="size-2 animate-dot-pulse-2 rounded-full bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.6)]"></span>
            <span className="size-2 animate-dot-pulse-3 rounded-full bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.6)]"></span>
          </div>
        </div>

        <div className="mb-5 flex gap-3">
          <button
            className={`group min-h-[50px] cursor-pointer border border-[rgba(251,191,36,0.5)] bg-[linear-gradient(135deg,#1c1508_0%,#0f0c06_100%)] text-[#fbbf24] shadow-[0_4px_15px_rgba(0,0,0,0.4)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:border-[rgba(251,191,36,0.8)] hover:shadow-[0_6px_25px_rgba(251,191,36,0.3)] hover:before:opacity-80 ${secretButton}`}
            onClick={() => leave(onTry)}
          >
            <span className="relative text-[22px]">⌨️</span>
            <span className="relative tracking-[1px] group-hover:text-[#fde68a]">Enter Konami Code</span>
          </button>
          <button
            className={`cursor-pointer border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] text-[#f87171] ${secretButton}`}
            onClick={() => leave(onClose)}
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
        </div>

        <div className="relative pt-5">
          <div className="mb-[15px] h-px bg-[linear-gradient(90deg,transparent_0%,rgba(251,191,36,0.3)_50%,transparent_100%)]"></div>
          <small className="flex items-center justify-center gap-1.5 text-[12px] text-[#fde68a]">
            <span className="animate-tip-pulse text-[14px]">💡</span>
            <span>Hint: Tap the profile image repeatedly for clues</span>
          </small>
        </div>
      </div>
    </OverlayShell>
  );
}