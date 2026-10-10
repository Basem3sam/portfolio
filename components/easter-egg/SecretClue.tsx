"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import Icon from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";

type SecretClueProps = {
  buttonRef: Ref<HTMLButtonElement>;
  revealed: boolean;
  unlocked: boolean;
  locale: Locale;
  onHint: () => void;
  onPrompt: () => void;
  onOpen: () => void;
};

const labels = {
  en: {
    title: "Secret terminal",
    hint: "Show a hint",
    enter: "Enter Konami code",
    open: "Open terminal",
  },
  ar: {
    title: "الطرفية السرية",
    hint: "عرض تلميح",
    enter: "أدخل كود كونامي",
    open: "فتح الطرفية",
  },
} as const;

// Pointer grace: the menu stays open while the pointer is inside it or
// inside the button, and for this long after the pointer last left both.
const POINTER_GRACE_MS = 400;

export default function SecretClue({
  buttonRef,
  revealed,
  unlocked,
  locale,
  onHint,
  onPrompt,
  onOpen,
}: SecretClueProps) {
  const [open, setOpen] = useState(false);
  const [footerNear, setFooterNear] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);
  const t = labels[locale];

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelClose();
        setOpen(false);
      }
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

  const trigger = (action: () => void) => {
    cancelClose();
    setOpen(false);
    action();
  };

  return (
    <div
      ref={containerRef}
      onPointerEnter={cancelClose}
      onPointerLeave={scheduleClose}
      className={`fixed start-[30px] bottom-[30px] max-[481px]:start-5 max-[481px]:bottom-[25px] print:hidden ${
        open && revealed ? "z-[10050]" : "z-[1000]"
      }`}
    >
      {open && revealed && (
        <div
          role="menu"
          aria-label={t.title}
          className="absolute start-0 bottom-full mb-3 w-56 overflow-hidden rounded-lg border border-[rgba(251,191,36,0.4)] bg-[#14110a] font-mono shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(251,191,36,0.15)] motion-safe:animate-pop-in"
        >
          <p className="border-b border-[rgba(251,191,36,0.2)] px-3 py-2 text-[10px] font-semibold tracking-[0.2em] text-[#a8a29e] uppercase">
            {t.title}
          </p>
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-start text-[13px] font-medium text-[#fde68a] transition-colors duration-150 hover:bg-[rgba(251,191,36,0.1)] hover:text-[#fbbf24]"
            onClick={() => trigger(onHint)}
          >
            <Icon name="helpCircle" className="size-4 shrink-0" />
            {t.hint}
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-start text-[13px] font-medium text-[#fde68a] transition-colors duration-150 hover:bg-[rgba(251,191,36,0.1)] hover:text-[#fbbf24]"
            onClick={() => trigger(onPrompt)}
          >
            <Icon name="code" className="size-4 shrink-0" />
            {t.enter}
          </button>
          {unlocked && (
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-start text-[13px] font-semibold text-[#fbbf24] transition-colors duration-150 hover:bg-[rgba(251,191,36,0.1)]"
              onClick={() => trigger(onOpen)}
            >
              <Icon name="terminal" className="size-4 shrink-0" />
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
        onClick={() => {
          cancelClose();
          setOpen((value) => !value);
        }}
        className={`relative flex size-11 cursor-pointer items-center justify-center rounded-full bg-secondary text-on-secondary shadow-md transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg active:scale-90 motion-reduce:transition-none ${
          revealed
            ? `visible scale-100 rotate-[360deg] ${footerNear ? "pointer-events-none opacity-0" : "opacity-100"}`
            : "invisible scale-0 opacity-0"
        }`}
      >
        {revealed && !footerNear && (
          <span
            className="pointer-events-none absolute inset-0 animate-attention rounded-full border-2 border-secondary motion-reduce:animate-none"
            aria-hidden="true"
          ></span>
        )}
        <Icon name="terminal" className="relative z-[1] size-[18px]" />
      </button>
    </div>
  );
}
