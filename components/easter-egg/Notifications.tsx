"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { HINT_LEVELS, isMobileViewport } from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";

export type ToastData =
  | { id: number; kind: "hint"; level: number; clicks: number; closing?: boolean }
  | { id: number; kind: "reminder"; text: string }
  | { id: number; kind: "reset" }
  | { id: number; kind: "spam" }
  | { id: number; kind: "access" }
  | { id: number; kind: "master"; closing?: boolean };

type ToastProps = { onDone: () => void };

function useToast(duration: number, exitDelay: number, onDone: () => void, closing = false) {
  const [shown, setShown] = useState(false);
  const dismissed = useRef(false);
  const timers = useRef<number[]>([]);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  const dismiss = useCallback(
    (delay = exitDelay) => {
      if (dismissed.current) return;
      dismissed.current = true;
      setShown(false);
      timers.current.push(window.setTimeout(() => doneRef.current(), delay));
    },
    [exitDelay],
  );

  useEffect(() => {
    const pending = timers.current;
    pending.push(window.setTimeout(() => setShown(true), 10));
    pending.push(window.setTimeout(() => dismiss(), duration));
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, [duration, dismiss]);

  useEffect(() => {
    if (closing) dismiss(300);
  }, [closing, dismiss]);

  return { shown, dismiss };
}

type PillProps = ToastProps & {
  duration: number;
  exitDelay: number;
  className: string;
  children: ReactNode;
};

function Pill({ duration, exitDelay, onDone, className, children }: PillProps) {
  const { shown } = useToast(duration, exitDelay, onDone);

  return (
    <div
      className={`fixed start-1/2 z-[10001] flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium text-white shadow-lg transition-all rtl:translate-x-1/2 ${className} ${shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-5 opacity-0"}`}
    >
      {children}
    </div>
  );
}

const hintLevelStyles = [
  "",
  "border-[rgba(251,191,36,0.35)] bg-[linear-gradient(135deg,#191307_0%,#0c0a06_100%)]",
  "border-[rgba(253,230,138,0.4)] bg-[linear-gradient(135deg,#191308_0%,#0d0b06_100%)]",
  "border-[rgba(251,146,60,0.45)] bg-[linear-gradient(135deg,#1a1208_0%,#0e0a05_100%)]",
  "border-[rgba(251,191,36,0.5)] bg-[linear-gradient(135deg,#1c1508_0%,#0f0c06_100%)]",
  "border-[rgba(251,191,36,0.65)] bg-[linear-gradient(135deg,#20180a_0%,#120e07_100%)]",
];

type HintToastProps = ToastProps & { level: number; clicks: number; closing?: boolean };

function HintToast({ level, clicks, closing, onDone }: HintToastProps) {
  const [duration] = useState(() => (isMobileViewport() ? 3500 : 4000));
  const { shown, dismiss } = useToast(duration, 300, onDone, closing);
  const progress = Math.min((clicks / 10) * 100, 90);

  return (
    <div
      className={`fixed start-1/2 top-[100px] z-[10001] flex max-w-[320px] -translate-x-1/2 flex-col items-center gap-1.5 rounded-xl border border-[rgba(251,191,36,0.35)] bg-[linear-gradient(135deg,#191307_0%,#0c0a06_100%)] px-5 py-4 text-center font-mono text-[13px] font-semibold tracking-[0.5px] text-[#fbbf24] shadow-[0_8px_32px_rgba(251,191,36,0.25),0_0_0_1px_rgba(251,191,36,0.2),inset_0_1px_0_rgba(253,230,138,0.08)] backdrop-blur-[10px] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] [text-shadow:0_0_8px_rgba(251,191,36,0.4)] before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-full before:bg-[linear-gradient(90deg,transparent_0%,#fbbf24_50%,transparent_100%)] before:content-[''] max-md:top-auto max-md:bottom-[100px] max-md:z-[10002] max-md:max-w-[280px] max-md:px-4 max-md:py-3 max-[481px]:bottom-[90px] max-[481px]:max-w-[260px] max-[481px]:px-3.5 max-[481px]:py-2.5 rtl:translate-x-1/2 ${hintLevelStyles[level] ?? ""} ${shown ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-5 scale-95 opacity-0 max-md:translate-y-5 max-md:scale-100"}`}
    >
      <button
        className="absolute end-0 top-0 flex size-11 cursor-pointer items-center justify-center rounded-full text-[12px] text-[rgba(251,191,36,0.6)] transition-all duration-200 hover:bg-[rgba(248,113,113,0.2)] hover:text-[#f87171]"
        aria-label="Close notification"
        onClick={() => dismiss()}
      >
        &times;
      </button>
      <span className="flex size-7 items-center justify-center rounded-full border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.1)]">
        <Icon
          name={HINT_LEVELS[level].icon}
          className="size-3.5 text-[#fbbf24] [filter:drop-shadow(0_0_6px_rgba(251,191,36,0.6))]"
        />
      </span>
      <span className="leading-[1.3] text-[#fbbf24] max-md:text-[12px]">
        {HINT_LEVELS[level].notification}
      </span>
      {level >= 1 && level <= 4 && (
        <div className="mt-0.5 flex w-full items-center gap-2 text-[10px] text-[#fde68a]">
          <span className="shrink-0 font-bold" dir="ltr">
            {clicks}/10
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(251,191,36,0.2)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#fbbf24,#fde68a)] shadow-[0_0_6px_rgba(251,191,36,0.6)] transition-[width] duration-300 ease-[ease]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      {level === 5 && (
        <small className="mt-px text-[10px] font-medium text-[#fde68a] opacity-80 [text-shadow:0_0_5px_rgba(251,191,36,0.5)]">
          Almost there! One more step...
        </small>
      )}
    </div>
  );
}

function AccessToast({ onDone }: ToastProps) {
  const { shown } = useToast(4500, 500, onDone);

  return (
    <div
      dir="ltr"
      className={`pointer-events-none fixed inset-0 z-[10010] m-auto flex h-fit w-fit max-w-[340px] items-center gap-3.5 rounded-xl border border-[rgba(251,191,36,0.4)] bg-[linear-gradient(135deg,#191307_0%,#0c0a06_100%)] px-6 py-5 font-mono shadow-[0_20px_50px_rgba(251,191,36,0.35),0_0_0_2px_rgba(251,191,36,0.4),inset_0_1px_0_rgba(253,230,138,0.08)] backdrop-blur-[10px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-md:w-[calc(100%_-_40px)] max-md:max-w-[300px] ${shown ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
    >
      <Icon
        name="unlock"
        className="size-7 shrink-0 text-[#fbbf24] [filter:drop-shadow(0_0_8px_rgba(251,191,36,0.6))]"
      />
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-start">
        <span className="text-[16px] font-bold text-[#fbbf24] [text-shadow:0_0_10px_rgba(251,191,36,0.5)]">
          Access Granted! 🎉
        </span>
        <span className="text-[11px] leading-snug text-[#fde68a] opacity-90">
          Terminal unlocked for this session — it locks again when you refresh the page.
        </span>
      </span>
    </div>
  );
}

type MasterToastProps = ToastProps & { closing?: boolean };

function MasterToast({ closing, onDone }: MasterToastProps) {
  const { shown, dismiss } = useToast(10000, 1000, onDone, closing);

  return (
    <div
      dir="ltr"
      className={`fixed inset-0 z-[10006] m-auto h-fit w-fit max-w-[460px] min-w-[380px] cursor-pointer overflow-hidden rounded-2xl border-2 border-[rgba(251,191,36,0.4)] bg-[#131007] px-[30px] py-[35px] text-center font-mono text-[#e8e6e1] shadow-[0_0_0_2px_rgba(251,191,36,0.3),0_10px_40px_rgba(0,0,0,0.7)] transition-opacity duration-[800ms] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(transparent_50%,rgba(251,191,36,0.02)_50%)] before:bg-[length:100%_4px] before:content-[''] max-[481px]:max-w-[90%] max-[481px]:min-w-[320px] max-[481px]:px-5 max-[481px]:py-[25px] ${shown ? "animate-master-pop opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={() => dismiss(500)}
    >
      <div className="relative z-[2]">
        <div className="mb-4 flex items-center justify-center gap-3 text-[18px] font-bold tracking-[2px] text-[#fbbf24] uppercase [text-shadow:0_0_10px_rgba(251,191,36,0.5)] max-[481px]:text-[16px]">
          <Icon
            name="trophy"
            className="size-6 text-[#fbbf24] [filter:drop-shadow(0_0_8px_rgba(251,191,36,0.6))]"
          />
          <span>KONAMI CODE MASTER!</span>
          <Icon
            name="trophy"
            className="size-6 text-[#fbbf24] [filter:drop-shadow(0_0_8px_rgba(251,191,36,0.6))]"
          />
        </div>
        <p className="my-[18px] text-[14px] leading-[1.6] text-[#a8a29e]">
          🎮 You&apos;ve discovered the{" "}
          <strong className="font-semibold text-[#fbbf24]">legendary 10-click sequence</strong>!
          <br />
          <span className="text-[12px]">The secret terminal awaits your command...</span>
        </p>
        <div className="my-5 rounded-lg border border-[rgba(251,191,36,0.3)] bg-black/40 p-[18px]">
          <code
            dir="ltr"
            className="block text-[20px] font-bold tracking-[6px] text-[#fbbf24] [text-shadow:0_0_10px_rgba(251,191,36,0.4)] [unicode-bidi:isolate] max-[481px]:text-[16px] max-[481px]:tracking-[4px]"
          >
            ↑ ↑ ↓ ↓ ← → ← → B A
          </code>
        </div>
        <div className="my-[18px] rounded-lg border border-[rgba(251,191,36,0.2)] bg-black/30 p-3.5">
          <small className="mb-2 block text-[11px] font-medium text-[#a8a29e]">
            ⚡ Quick Access Shortcut:
          </small>
          <code className="inline-block rounded-md border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.15)] px-3.5 py-2 text-[13px] font-bold tracking-[1px] text-[#fbbf24]">
            Ctrl + Shift + B
          </code>
        </div>
        <div className="mt-[18px] border-t border-[rgba(251,191,36,0.2)] pt-[18px]">
          <small className="text-[12px] font-semibold tracking-[1px] text-[#fbbf24] uppercase [text-shadow:0_0_8px_rgba(251,191,36,0.4)]">
            🏆 Achievement Unlocked: Terminal Explorer 🏆
          </small>
        </div>
      </div>
    </div>
  );
}

type ToastsProps = {
  toasts: ToastData[];
  onRemove: (id: number) => void;
};

export default function Toasts({ toasts, onRemove }: ToastsProps) {
  return (
    <div aria-live="polite">
      {toasts.map((toast) => {
        const onDone = () => onRemove(toast.id);

        switch (toast.kind) {
          case "hint":
            return (
              <HintToast
                key={toast.id}
                level={toast.level}
                clicks={toast.clicks}
                closing={toast.closing}
                onDone={onDone}
              />
            );
          case "reminder":
            return (
              <Pill
                key={toast.id}
                duration={3000}
                exitDelay={300}
                onDone={onDone}
                className="top-[120px] gap-2.5 rounded-xl border border-[rgba(251,191,36,0.35)] bg-[#14110a] px-4 py-2.5 font-mono text-[12px] font-semibold text-[#fbbf24] shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.15)] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
              >
                <Icon name="clock" className="size-3.5" />
                <span>{toast.text}</span>
              </Pill>
            );
          case "reset":
            return (
              <Pill
                key={toast.id}
                duration={2000}
                exitDelay={300}
                onDone={onDone}
                className="top-[140px] bg-[linear-gradient(135deg,#78716c_0%,#57534e_100%)] duration-300 ease-[ease]"
              >
                <Icon name="rotateCcw" className="size-3.5" />
                <span>Sequence broken! Start over... 🔄</span>
              </Pill>
            );
          case "spam":
            return (
              <Pill
                key={toast.id}
                duration={3000}
                exitDelay={400}
                onDone={onDone}
                className="top-[180px] rounded-xl border border-white/20 bg-[linear-gradient(135deg,#d97706_0%,#b45309_100%)] px-5 py-3 text-[13px] duration-[400ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
              >
                <Icon name="alertCircle" className="size-3.5" />
                <span>Slow down! Enjoy the discovery process 🐢</span>
              </Pill>
            );
          case "access":
            return <AccessToast key={toast.id} onDone={onDone} />;
          case "master":
            return <MasterToast key={toast.id} closing={toast.closing} onDone={onDone} />;
        }
      })}
    </div>
  );
}
