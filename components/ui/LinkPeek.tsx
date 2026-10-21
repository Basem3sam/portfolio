"use client";

import { useEffect, useRef, useState } from "react";
import "./LinkPeek.css";

const CARD_W = 320;
const CARD_H = 252;
const GAP = 12;
const OPEN_DELAY = 380;
const CLOSE_DELAY = 140;

type Peek = { url: string; host: string; left: number; top: number; above: boolean };

const canHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function place(anchor: HTMLElement): Omit<Peek, "url" | "host"> {
  const rect = anchor.getBoundingClientRect();
  const above = rect.bottom + GAP + CARD_H > window.innerHeight && rect.top > CARD_H + GAP;
  const centre = rect.left + rect.width / 2 - CARD_W / 2;
  const left = Math.min(Math.max(12, centre), window.innerWidth - CARD_W - 12);
  const top = above ? rect.top - GAP - CARD_H : rect.bottom + GAP;
  return { left, top, above };
}

/**
 * One preview card for every `a[data-peek]` on the page. Links opt in with the
 * attribute; the host listens at the document, so it never wraps or re-parents
 * a link and is not affected by transformed ancestors. The card is decorative
 * (aria-hidden, pointer-transparent): the link itself already names where it goes.
 */
export default function LinkPeekHost() {
  const [peek, setPeek] = useState<Peek | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const current = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const clear = () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    };

    const hide = () => {
      clear();
      current.current = null;
      setPeek(null);
    };

    const show = (anchor: HTMLAnchorElement) => {
      window.clearTimeout(closeTimer.current);
      if (current.current === anchor) return;
      window.clearTimeout(openTimer.current);
      openTimer.current = window.setTimeout(
        () => {
          let host = "";
          try {
            host = new URL(anchor.href).host;
          } catch {
            return;
          }
          current.current = anchor;
          setState("loading");
          setPeek({ url: anchor.href, host, ...place(anchor) });
        },
        current.current ? 0 : OPEN_DELAY,
      );
    };

    const find = (event: Event) =>
      (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-peek]") ?? null;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !canHover()) return;
      const anchor = find(event);
      if (anchor) show(anchor);
    };

    const onOut = (event: PointerEvent) => {
      const anchor = find(event);
      if (!anchor || anchor.contains(event.relatedTarget as Node | null)) return;
      window.clearTimeout(openTimer.current);
      closeTimer.current = window.setTimeout(hide, CLOSE_DELAY);
    };

    const onFocusIn = (event: FocusEvent) => {
      const anchor = find(event);
      if (anchor && anchor.matches(":focus-visible") && canHover()) show(anchor);
    };

    const onFocusOut = (event: FocusEvent) => {
      if (find(event)) hide();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);

    return () => {
      clear();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", hide);
    };
  }, []);

  if (!peek) return null;

  const shot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(peek.url)}?w=640&h=400`;

  return (
    <div
      className="peek"
      data-above={peek.above}
      data-state={state}
      aria-hidden="true"
      style={{ left: peek.left, top: peek.top, width: CARD_W }}
    >
      <div className="peek-bar">
        <i className="peek-dot"></i>
        <span className="peek-host" dir="ltr">
          {peek.host}
        </span>
      </div>
      <div className="peek-frame">
        {state !== "failed" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={peek.url}
            src={shot}
            alt=""
            width={640}
            height={400}
            referrerPolicy="no-referrer"
            onLoad={() => setState("ready")}
            onError={() => setState("failed")}
          />
        )}
        {state === "failed" && (
          <span className="peek-fail" dir="ltr">
            {peek.host}
          </span>
        )}
      </div>
    </div>
  );
}
