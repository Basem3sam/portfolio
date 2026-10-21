"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  CLICKS_NEEDED,
  HINT_LEVELS,
  eggCopy,
  isMobileViewport,
  type EggCopy,
} from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import "@/components/easter-egg/Egg.css";

export type ToastData =
  | { id: number; kind: "hint"; level: number; clicks: number }
  | { id: number; kind: "reminder"; text: string }
  | { id: number; kind: "reset" }
  | { id: number; kind: "spam" }
  | { id: number; kind: "access" };

type ToastProps = { onDone: () => void };

function useToast(duration: number, exitDelay: number, onDone: () => void) {
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

  return { shown, dismiss };
}

type ToastShellProps = ToastProps & {
  duration: number;
  exitDelay: number;
  icon: IconName;
  variant?: string;
  children: ReactNode;
  /** A real close button (pills omit it, as in the mockup). */
  close?: { label: string; delay?: number };
};

function ToastShell({ duration, exitDelay, icon, variant, close, onDone, children }: ToastShellProps) {
  const { shown, dismiss } = useToast(duration, exitDelay, onDone);

  return (
    <div className={`tst${variant ? ` ${variant}` : ""}${shown ? " in" : ""}`}>
      <span className="tic">
        <Icon name={icon} className="i" />
      </span>
      <div className="tx">{children}</div>
      {close && (
        <button
          type="button"
          className="tcl"
          aria-label={close.label}
          onClick={() => dismiss(close.delay)}
        >
          <Icon name="x" className="i" />
        </button>
      )}
    </div>
  );
}

type HintToastProps = ToastProps & {
  level: number;
  clicks: number;
  copy: EggCopy;
  ar: boolean;
};

function HintToast({ level, clicks, copy, ar, onDone }: HintToastProps) {
  const hint = HINT_LEVELS[level];
  const ticks = Array.from({ length: CLICKS_NEEDED }, (_, index) => index < clicks);

  return (
    <ToastShell
      duration={6000}
      exitDelay={300}
      icon={hint.icon}
      close={{ label: copy.close }}
      onDone={onDone}
    >
      <span title={hint.tooltip[ar ? "ar" : "en"]}>{hint.notification[ar ? "ar" : "en"]}</span>
      <div className="tp">
        <b dir="ltr">
          {clicks}/{CLICKS_NEEDED}
        </b>
        <span className="bar" aria-hidden="true">
          {ticks.map((on, index) => (
            <i key={index} className={on ? "on" : ""} />
          ))}
        </span>
      </div>
    </ToastShell>
  );
}

type ToastsProps = {
  toasts: ToastData[];
  locale: Locale;
  onRemove: (id: number) => void;
};

export default function Toasts({ toasts, locale, onRemove }: ToastsProps) {
  const copy = eggCopy(locale);
  const ar = locale === "ar";

  return (
    <div className="egg">
      <div className="tl" aria-live="polite">
        {toasts.map((toast) => {
          const onDone = () => onRemove(toast.id);

          switch (toast.kind) {
            case "hint":
              return (
                <HintToast
                  key={toast.id}
                  level={toast.level}
                  clicks={toast.clicks}
                  copy={copy}
                  ar={ar}
                  onDone={onDone}
                />
              );
            case "reminder":
              return (
                <ToastShell
                  key={toast.id}
                  duration={3600}
                  exitDelay={300}
                  icon="clock"
                  variant="pill"
                  onDone={onDone}
                >
                  {toast.text}
                </ToastShell>
              );
            case "reset":
              return (
                <ToastShell
                  key={toast.id}
                  duration={2600}
                  exitDelay={300}
                  icon="rotateCcw"
                  variant="pill grey"
                  onDone={onDone}
                >
                  {copy.reset}
                </ToastShell>
              );
            case "spam":
              return (
                <ToastShell
                  key={toast.id}
                  duration={3200}
                  exitDelay={400}
                  icon="alertCircle"
                  variant="pill warn"
                  onDone={onDone}
                >
                  {copy.spam}
                </ToastShell>
              );
            case "access":
              return (
                <ToastShell
                  key={toast.id}
                  duration={isMobileViewport() ? 4200 : 6500}
                  exitDelay={500}
                  icon="unlock"
                  variant="access"
                  onDone={onDone}
                >
                  <b>{copy.ok}</b>
                  <small>{copy.okd}</small>
                </ToastShell>
              );
          }
        })}
      </div>
    </div>
  );
}
