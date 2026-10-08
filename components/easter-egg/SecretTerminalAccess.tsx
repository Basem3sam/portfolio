"use client";

import { useEffect, useState } from "react";
import { KONAMI_CODE } from "@/components/easter-egg/constants";
import OverlayShell from "@/components/easter-egg/OverlayShell";
import { useOverlay } from "@/components/easter-egg/useOverlay";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

type SecretTerminalAccessProps = {
  onClose: () => void;
  onTry: () => void;
};

const RAIN_CHARACTERS = "01アイウエオカキクケコサシスセソタチツテト";

const actionButton = `relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-[14px] font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 font-mono min-h-14`;

function createRain() {
  return Array.from({ length: 15 }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 2,
    character: RAIN_CHARACTERS[Math.floor(Math.random() * RAIN_CHARACTERS.length)],
  }));
}

export default function SecretTerminalAccess({ onClose, onTry }: SecretTerminalAccessProps) {
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
      <div className="px-5 py-[25px] max-[481px]:px-4">
        <div className="mx-auto mb-6 flex w-full max-w-[340px] flex-col items-center">
          <div
            className="mb-5 h-1.5 w-16 rounded-full bg-[rgba(251,191,36,0.3)]"
            aria-hidden="true"
          ></div>
          <div className="relative flex size-20 items-center justify-center">
            <div className="absolute size-full animate-ring-pulse rounded-full border-2 border-[rgba(251,191,36,0.3)]"></div>
            <div className="absolute size-[115%] animate-ring-pulse rounded-full border border-[rgba(251,191,36,0.15)] [animation-delay:0.5s]"></div>
            <div className="relative z-[2] animate-icon-bounce text-[50px] [filter:drop-shadow(0_0_20px_rgba(251,191,36,0.4))]">
              🎮
            </div>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-[12px] font-medium tracking-[0.25em] text-[#a8a29e] uppercase">
            Enter the legendary
          </p>
          <p className="animate-text-glow my-2 bg-[linear-gradient(135deg,#fbbf24_0%,#fde68a_100%)] bg-clip-text text-[26px] font-black tracking-[0.18em] text-transparent">
            KONAMI CODE
          </p>
          <p className="text-[12px] font-medium tracking-[0.25em] text-[#a8a29e] uppercase">
            to unlock the developer terminal
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 text-[12px] text-[#fde68a] opacity-90">
            <span className="animate-sparkle text-[15px]">✨</span>
            <em>A classic gaming sequence holds the key...</em>
          </p>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-xl border border-[rgba(251,191,36,0.25)] bg-black/50 p-4 shadow-[0_0_30px_rgba(251,191,36,0.1),inset_0_0_25px_rgba(0,0,0,0.45)] before:absolute before:top-0 before:left-[-100%] before:h-full before:w-full before:animate-progress-sweep before:bg-[linear-gradient(90deg,transparent_0%,rgba(251,191,36,0.06)_50%,transparent_100%)] before:content-['']">
          <div className="relative mb-3 flex w-full gap-1.5">
            {Array.from({ length: KONAMI_CODE.length }).map((_, index) => (
              <span
                key={index}
                style={{ animationDelay: `${index * 130}ms` }}
                className="flex h-10 flex-1 animate-pulse items-center justify-center rounded-md border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)] font-mono text-[15px] font-black text-[#fbbf24]/70 shadow-[inset_0_-3px_6px_rgba(0,0,0,0.5)] motion-reduce:animate-none"
              >
                ?
              </span>
            ))}
          </div>
          <p className="relative text-center font-mono text-[10px] tracking-[0.2em] text-[#a8a29e] uppercase">
            {KONAMI_CODE.length} inputs · one legendary sequence · hidden in gaming history
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-3 max-[481px]:gap-2.5">
          <button
            className={`group cursor-pointer border border-[rgba(251,191,36,0.5)] bg-[linear-gradient(135deg,#1c1508_0%,#0f0c06_100%)] text-[#fbbf24] shadow-[0_4px_15px_rgba(0,0,0,0.4)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)] before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] hover:-translate-y-0.5 hover:border-[rgba(251,191,36,0.8)] hover:shadow-[0_6px_25px_rgba(251,191,36,0.3)] hover:before:opacity-80 ${actionButton}`}
            onClick={() => leave(onTry)}
          >
            <span className="relative text-[22px]">⌨️</span>
            <span className="relative tracking-[1px] group-hover:text-[#fde68a]">
              Enter Konami Code
            </span>
          </button>
          <button
            className={`cursor-pointer border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] text-[#f87171] ${actionButton}`}
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
            <span>Hint: tap the profile image repeatedly for clues</span>
          </small>
        </div>
      </div>
    </OverlayShell>
  );
}