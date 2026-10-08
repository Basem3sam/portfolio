"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { HINT_LEVELS } from "@/components/easter-egg/constants";
import { isMobileViewport } from "@/components/easter-egg/constants";
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
      className={`fixed left-1/2 z-[10001] flex -translate-x-1/2 items-center text-white transition-all ${className} ${shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-5 opacity-0"}`}
    >
      {children}
    </div>
  );
}

const hintLevelStyles = [
  "",
  "border-[rgba(0,255,65,0.3)] bg-[linear-gradient(135deg,#1a1f3a_0%,#0a0e27_100%)]",
  "border-[rgba(0,217,255,0.4)] bg-[linear-gradient(135deg,#1a2f3a_0%,#0a1e27_100%)]",
  "border-[rgba(255,107,107,0.4)] bg-[linear-gradient(135deg,#2a1f3a_0%,#1a0e27_100%)]",
  "border-[rgba(255,165,2,0.4)] bg-[linear-gradient(135deg,#3a1f2a_0%,#270e1a_100%)]",
  "border-[rgba(0,255,65,0.6)] bg-[linear-gradient(135deg,#2a3a1f_0%,#1a270e_100%)]",
];

type HintToastProps = ToastProps & { level: number; clicks: number; closing?: boolean };

function HintToast({ level, clicks, closing, onDone }: HintToastProps) {
  const [duration] = useState(() => (isMobileViewport() ? 3500 : 4000));
  const { shown, dismiss } = useToast(duration, 300, onDone, closing);
  const progress = Math.min((clicks / 10) * 100, 90);

  return (
    <div
      className={`fixed left-1/2 z-[10001] flex max-w-[320px] -translate-x-1/2 flex-col items-center gap-1 rounded-xl border border-[rgba(0,255,65,0.3)] bg-[linear-gradient(135deg,#1a1f3a_0%,#0a0e27_100%)] px-5 py-3.5 text-center font-[Courier_New,monospace] text-[13px] font-semibold tracking-[0.5px] text-[#00ff41] shadow-[0_8px_32px_rgba(0,255,65,0.3),0_0_0_1px_rgba(0,255,65,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[10px] [text-shadow:0_0_8px_rgba(0,255,65,0.4)] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] top-[100px] max-md:top-auto max-md:bottom-[100px] max-md:z-[10002] max-md:max-w-[280px] max-md:px-4 max-md:py-3 max-[481px]:bottom-[90px] max-[481px]:max-w-[260px] max-[481px]:px-3.5 max-[481px]:py-2.5 dark:border-[rgba(0,255,65,0.4)] dark:bg-[linear-gradient(135deg,#050814_0%,#0a0e1a_100%)] ${hintLevelStyles[level] ?? ""} ${shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-5 opacity-0 max-md:translate-y-5"}`}
      onClick={() => dismiss()}
    >
      <button
        className="absolute top-1.5 right-1.5 flex size-4 cursor-pointer items-center justify-center rounded-full text-[12px] text-[rgba(0,255,65,0.6)] transition-all duration-200 hover:bg-[rgba(255,71,87,0.2)] hover:text-[#ff4757] max-md:top-1 max-md:right-1 max-md:size-5 max-md:text-[10px]"
        aria-label="Close notification"
        onClick={(event) => {
          event.stopPropagation();
          dismiss();
        }}
      >
        &times;
      </button>
      <Icon
        name={HINT_LEVELS[level].icon}
        className="mb-0.5 size-4 text-[#00ff41] [filter:drop-shadow(0_0_6px_rgba(0,255,65,0.6))]"
      />
      <span className="leading-[1.3] text-[#00ff41] max-md:text-[12px]">
        {HINT_LEVELS[level].notification}
      </span>
      {level >= 1 && level <= 4 && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#00d9ff] max-md:gap-[5px] max-md:text-[9px]">
          <span>Exploring...</span>
          <div className="h-[3px] w-[50px] overflow-hidden rounded-sm bg-[rgba(0,255,65,0.2)] max-md:w-10">
            <div
              className="h-full rounded-sm bg-[linear-gradient(90deg,#00ff41,#00d9ff)] shadow-[0_0_6px_rgba(0,255,65,0.6)] transition-[width] duration-300 ease-[ease]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      {level === 5 && (
        <small className="mt-px text-[10px] font-medium text-[#00d9ff] opacity-80 [text-shadow:0_0_5px_rgba(0,217,255,0.5)]">
          Almost there! One more step...
        </small>
      )}
    </div>
  );
}

function AccessToast({ onDone }: ToastProps) {
  const { shown } = useToast(3000, 500, onDone);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[10010] m-auto flex h-fit w-fit max-w-[320px] items-center justify-center gap-3 rounded-xl border border-[rgba(0,255,65,0.4)] bg-[linear-gradient(135deg,#1a1f3a_0%,#0a0e27_100%)] px-[25px] py-5 text-center font-[Courier_New,monospace] text-[16px] leading-[1.4] font-semibold tracking-[0.5px] text-[#00ff41] shadow-[0_20px_50px_rgba(0,255,65,0.5),0_0_0_2px_rgba(0,255,65,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[10px] [text-shadow:0_0_10px_rgba(0,255,65,0.5)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] max-md:w-[calc(100%_-_40px)] max-md:max-w-[280px] max-md:px-[22px] max-md:py-[18px] max-md:text-[15px] max-[481px]:max-w-[260px] max-[481px]:px-5 max-[481px]:py-4 max-[481px]:text-[14px] ${shown ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
    >
      <Icon
        name="unlock"
        className="shrink-0 size-6 text-[#00ff41] [filter:drop-shadow(0_0_8px_rgba(0,255,65,0.6))] max-md:size-[22px] max-[481px]:size-5"
      />
      <span className="min-w-0 flex-1 text-[#00ff41]">Access Granted! The terminal awaits... 🎉</span>
    </div>
  );
}

type MasterToastProps = ToastProps & { closing?: boolean; onShown: () => void };

function MasterToast({ closing, onDone, onShown }: MasterToastProps) {
  const { shown, dismiss } = useToast(10000, 1000, onDone, closing);

  useEffect(() => {
    onShown();
  }, [onShown]);

  return (
    <div
      className={`fixed inset-0 z-[10004] m-auto h-fit w-fit max-w-[460px] min-w-[380px] cursor-pointer overflow-hidden rounded-2xl border-2 border-[rgba(0,255,65,0.4)] bg-[#0a0e27] px-[30px] py-[35px] text-center text-[#e0e0e0] shadow-[0_0_0_2px_rgba(0,255,65,0.3),0_10px_40px_rgba(0,0,0,0.7)] transition-opacity duration-[800ms] before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[linear-gradient(transparent_50%,rgba(0,255,65,0.02)_50%)] before:bg-[length:100%_4px] before:content-[''] max-[481px]:max-w-[90%] max-[481px]:min-w-[320px] max-[481px]:px-5 max-[481px]:py-[25px] ${shown ? "animate-master-pop opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={() => dismiss(500)}
    >
      <div className="relative z-[2]">
        <div className="mb-4 flex items-center justify-center gap-3 text-[18px] font-bold tracking-[2px] text-[#00ff41] uppercase [text-shadow:0_0_10px_rgba(0,255,65,0.5)] max-[481px]:text-[16px]">
          <Icon name="trophy" className="size-6 text-[#00ff41] [filter:drop-shadow(0_0_8px_rgba(0,255,65,0.6))]" />
          <span>KONAMI CODE MASTER!</span>
          <Icon name="trophy" className="size-6 text-[#00ff41] [filter:drop-shadow(0_0_8px_rgba(0,255,65,0.6))]" />
        </div>
        <p className="my-[18px] text-[14px] leading-[1.6] text-[#b8b8b8]">
          🎮 You&apos;ve unlocked the{" "}
          <strong className="font-semibold text-[#00ff41]">legendary 10-click sequence</strong>!
          <br />
          <span className="text-[12px]">The secret terminal awaits your command...</span>
        </p>
        <div className="my-5 rounded-lg border border-[rgba(0,255,65,0.3)] bg-black/40 p-[18px]">
          <code className="block font-[Courier_New,monospace] text-[20px] font-bold tracking-[6px] text-[#00ff41] [text-shadow:0_0_10px_rgba(0,255,65,0.4)] max-[481px]:text-[16px] max-[481px]:tracking-[4px]">
            ↑ ↑ ↓ ↓ ← → ← → B A
          </code>
        </div>
        <div className="my-[18px] rounded-lg border border-[rgba(0,255,65,0.2)] bg-black/30 p-3.5">
          <small className="mb-2 block text-[11px] font-medium text-[#a0a0a0]">
            ⚡ Quick Access Shortcut:
          </small>
          <code className="inline-block rounded-md border border-[rgba(0,255,65,0.3)] bg-[rgba(0,255,65,0.15)] px-3.5 py-2 text-[13px] font-bold tracking-[1px] text-[#00ff41]">
            Ctrl + Shift + B
          </code>
        </div>
        <div className="mt-[18px] border-t border-[rgba(0,255,65,0.2)] pt-[18px]">
          <small className="text-[12px] font-semibold tracking-[1px] text-[#00ff41] uppercase [text-shadow:0_0_8px_rgba(0,255,65,0.4)]">
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
  onMasterShown: () => void;
};

export default function Toasts({ toasts, onRemove, onMasterShown }: ToastsProps) {
  return (
    <>
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
                className="top-[120px] gap-[9px] rounded-[22px] bg-[linear-gradient(135deg,#3498db_0%,#2980b9_100%)] px-[19px] py-[11px] text-[12px] font-medium shadow-[0_8px_35px_rgba(52,152,219,0.5)] duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
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
                className="top-[140px] gap-2 rounded-[20px] bg-[linear-gradient(135deg,#95a5a6_0%,#7f8c8d_100%)] px-[18px] py-2.5 text-[12px] font-medium shadow-[0_6px_25px_rgba(149,165,166,0.5)] duration-300 ease-[ease]"
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
                className="top-[180px] gap-2.5 rounded-xl border border-white/20 bg-[linear-gradient(135deg,#f39c12_0%,#e67e22_100%)] px-5 py-3 text-[13px] font-medium shadow-[0_8px_30px_rgba(243,156,18,0.5)] duration-[400ms] ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
              >
                <Icon name="alertCircle" className="size-3.5" />
                <span>Slow down! Enjoy the discovery process 🐢</span>
              </Pill>
            );
          case "access":
            return <AccessToast key={toast.id} onDone={onDone} />;
          case "master":
            return (
              <MasterToast
                key={toast.id}
                closing={toast.closing}
                onDone={onDone}
                onShown={onMasterShown}
              />
            );
        }
      })}
    </>
  );
}
