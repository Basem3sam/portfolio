"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { getNavbarHeight, scrollToPosition } from "@/lib/scroll";

type WorkDetailsProps = {
  /** The trigger's visible label, e.g. "Details". */
  label: string;
  /** The project's name, shown in the sheet so it keeps its context. */
  title: string;
  children: ReactNode;
};

/**
 * "Details" as a sheet that rises inside its own card.
 *
 * The sheet is absolutely positioned over the bottom of the card (the card is
 * the nearest positioned ancestor), so opening it changes no layout at all: no
 * neighbour stretches and nothing below moves. The card dims behind it; a click
 * on the dimmed part, Escape, or the close button brings it back down.
 *
 * Because a card can be taller than the screen, the bottom of it is often out
 * of view when "Details" is pressed. So opening also glides the page, on the
 * same eased scroll as everything else, until the whole sheet is on screen,
 * centred in the space under the navbar; if it is already fully visible the
 * page stays put. Closed, the sheet is `visibility: hidden`, so it takes no
 * focus and is not read out, but it stays in the DOM for search engines.
 */
export default function WorkDetails({ label, title, children }: WorkDetailsProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const uid = useId();
  const sheetId = `${uid}-sheet`;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    // Move focus into the sheet once it has started to rise.
    const focus = window.setTimeout(() => close.current?.focus({ preventScroll: true }), 160);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [open]);

  /** Scroll just enough that the whole sheet is on screen, centred if it moves. */
  const bringIntoView = () => {
    const el = sheet.current;
    const card = el?.offsetParent as HTMLElement | null;
    if (!el || !card) return;

    const top = getNavbarHeight() + 16;
    const bottom = window.innerHeight - 16;
    const usable = bottom - top;
    const height = el.offsetHeight;
    const sheetBottom = card.getBoundingClientRect().bottom;
    const sheetTop = sheetBottom - height;

    if (sheetTop >= top && sheetBottom <= bottom) return;

    const wanted = height >= usable ? top : top + (usable - height) / 2;
    scrollToPosition(Math.max(0, window.scrollY + (sheetTop - wanted)));
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) return;

    // Let the sheet that is about to appear take its place in the layout, and
    // let a long one scroll inside itself without dragging the page with it.
    requestAnimationFrame(() => {
      const el = sheet.current;
      if (el) {
        if (el.scrollHeight > el.clientHeight + 1) el.setAttribute("data-lenis-prevent", "");
        else el.removeAttribute("data-lenis-prevent");
      }
      bringIntoView();
    });
  };

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
        onClick={toggle}
      >
        <span className="disc-text">{label}</span>
        <Icon name="arrowDown" className="disc-chev size-4" />
      </button>

      <div className="scrim" data-open={open} onClick={dismiss} aria-hidden="true" />
      <div
        ref={sheet}
        id={sheetId}
        className="sheet"
        data-open={open}
        role="region"
        aria-label={`${label}: ${title}`}
      >
        <div className="sheet-head">
          <span className="sheet-title">
            <small>{label}</small>
            <b>{title}</b>
          </span>
          <button
            ref={close}
            type="button"
            className="sheet-x"
            aria-label={`${label}: ${title}`}
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
