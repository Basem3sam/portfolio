"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Icon from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";
import "@/components/easter-egg/Clue.css";

type SecretClueProps = {
  buttonRef: Ref<HTMLButtonElement>;
  revealed: boolean;
  unlocked: boolean;
  locale: Locale;
  onHint: () => void;
  onPrompt: () => void;
  onOpen: () => void;
  onMenuChange: (open: boolean) => void;
};

const labels = {
  en: {
    title: "Secret terminal",
    hint: "Show a hint",
    enter: "Enter code",
    open: "Open terminal",
  },
  ar: {
    title: "الطرفية السرية",
    hint: "عرض تلميح",
    enter: "أدخل الكود",
    open: "فتح الطرفية",
  },
} as const;

// Pointer grace: the menu stays open while the pointer is inside it or
// inside the button, and for this long after the pointer last left both.
const POINTER_GRACE_MS = 400;

/**
 * The round clue button at the start edge (mockup `.clue`): it appears on
 * the third portrait click, pings three times, then rests; it fades near
 * the footer. The menu is a real menu — arrows move, Esc closes, focus
 * returns to the button.
 */
export default function SecretClue({
  buttonRef,
  revealed,
  unlocked,
  locale,
  onHint,
  onPrompt,
  onOpen,
  onMenuChange,
}: SecretClueProps) {
  const [open, setOpen] = useState(false);
  const [footerNear, setFooterNear] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);
  const t = labels[locale];

  useEffect(() => {
    onMenuChange(open && revealed);
  }, [open, revealed, onMenuChange]);

  // The clue button bows out at the page end: it is a mid-page exploration
  // aid, and fading it over the footer removes floating-button clutter.
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => setFooterNear(entry.isIntersecting), {
      threshold: 0.35,
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), POINTER_GRACE_MS);
  };

  const cancelClose = () => {
    window.clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    if (!open) return;

    cancelClose();
    firstItemRef.current?.focus();

    const items = () =>
      Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelClose();
        setOpen(false);
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const list = items();
      if (list.length === 0) return;

      event.preventDefault();
      const index = list.indexOf(document.activeElement as HTMLElement);
      const next =
        event.key === "ArrowDown"
          ? list[(index + 1 + list.length) % list.length]
          : list[(index - 1 + list.length) % list.length];
      next.focus();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        cancelClose();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      cancelClose();
    };
  }, [open]);

  // Focus returns to the button when the menu closes (mockup a11y note).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    containerRef.current
      ?.querySelector<HTMLButtonElement>(".clue")
      ?.focus({ preventScroll: true });
  }, [open]);

  const trigger = (action: () => void) => {
    cancelClose();
    setOpen(false);
    action();
  };

  const state = revealed ? (footerNear ? "away" : "shown") : "hidden";

  return (
    <div
      ref={containerRef}
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
      className={`clue-wrap print:hidden${open && revealed ? " clue-open" : ""}`}
      data-open={open && revealed ? "true" : "false"}
    >
      {open && revealed && (
        <div role="menu" aria-label={t.title} className="cmenu">
          <p className="cmenu-label">{t.title}</p>
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            onClick={() => trigger(onHint)}
          >
            <Icon name="helpCircle" className="i" />
            {t.hint}
          </button>
          <button type="button" role="menuitem" onClick={() => trigger(onPrompt)}>
            <Icon name="code" className="i" />
            {t.enter}
          </button>
          {unlocked && (
            <button
              type="button"
              role="menuitem"
              onClick={() => trigger(onOpen)}
            >
              <Icon name="terminal" className="i" />
              {t.open}
            </button>
          )}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.title}
        data-state={state}
        className={`clue${revealed ? " ping" : ""}`}
        onClick={() => {
          cancelClose();
          setOpen((value) => !value);
        }}
      >
        <Icon name="terminal" className="i" />
      </button>
    </div>
  );
}
