"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";

type WorkDetailsProps = {
  /** The trigger's visible label, e.g. "Details". */
  label: string;
  children: ReactNode;
};

/**
 * "Details" as a sheet that rises inside its own card.
 *
 * The sheet is absolutely positioned over the card (the card is the nearest
 * positioned ancestor), so opening it changes no layout at all: no neighbour
 * stretches, nothing below moves, and there is nothing to measure. The card
 * dims behind it; a click on the dimmed part, Escape, or the close button
 * brings it back down. Closed, it is `visibility: hidden`, so it takes no focus
 * and is not read out, but it stays in the DOM for search engines.
 */
export default function WorkDetails({ label, children }: WorkDetailsProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const sheetId = `${uid}-sheet`;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    // Move focus into the sheet once it has started to rise.
    const focus = window.setTimeout(() => close.current?.focus({ preventScroll: true }), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="disc-btn"
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="disc-text">{label}</span>
        <Icon name="arrowDown" className="disc-chev size-4" />
      </button>

      <div className="scrim" data-open={open} onClick={dismiss} aria-hidden="true" />
      <div id={sheetId} className="sheet" data-open={open} role="region" aria-label={label}>
        <div className="sheet-head">
          <span>{label}</span>
          <button
            ref={close}
            type="button"
            className="sheet-x"
            aria-label={label}
            aria-expanded={open}
            aria-controls={sheetId}
            onClick={dismiss}
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}
