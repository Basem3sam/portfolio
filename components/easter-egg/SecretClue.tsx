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
  en: { title: "Secret terminal", hint: "Show a hint", enter: "Enter Konami code", open: "Open terminal" },
  ar: {
    title: "الطرفية السرية",
    hint: "عرض تلميح",
    enter: "أدخل كود كونامي",
    open: "فتح الطرفية",
  },
} as const;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const t = labels[locale];

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    firstItemRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const trigger = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[30px] start-[30px] z-[1000] print:hidden max-[481px]:bottom-[25px] max-[481px]:start-5"
    >
      {open && revealed && (
        <div
          role="menu"
          aria-label={t.title}
          className="absolute bottom-full mb-3 start-0 w-56 overflow-hidden rounded-lg border border-[rgba(251,191,36,0.4)] bg-[#14110a] font-mono shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(251,191,36,0.15)] motion-safe:animate-pop-in"
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
          {unlocked ? (
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-start text-[13px] font-semibold text-[#fbbf24] transition-colors duration-150 hover:bg-[rgba(251,191,36,0.1)]"
              onClick={() => trigger(onOpen)}
            >
              <Icon name="terminal" className="size-4 shrink-0" />
              {t.open}
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-start text-[13px] font-semibold text-[#fbbf24] transition-colors duration-150 hover:bg-[rgba(251,191,36,0.1)]"
              onClick={() => trigger(onPrompt)}
            >
              <Icon name="terminal" className="size-4 shrink-0" />
              {t.enter}
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
        onClick={() => setOpen((value) => !value)}
        className={`relative flex size-11 cursor-pointer items-center justify-center rounded-full bg-secondary text-on-secondary shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-90 motion-reduce:transition-none ${
          revealed ? "visible scale-100 rotate-[360deg] opacity-100" : "invisible scale-0 opacity-0"
        }`}
      >
        {revealed && (
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