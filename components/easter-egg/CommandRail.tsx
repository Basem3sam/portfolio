"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

type CommandRailProps = {
  commands: readonly string[];
  /** Commands that need an argument: a click fills the prompt instead of running. */
  needsArg: ReadonlySet<string>;
  /** What the visitor is typing now (first word); matching chips light up. */
  query: string;
  onRun: (name: string) => void;
  onFill: (name: string) => void;
};

const DRAG_THRESHOLD = 5;

/**
 * The quick-command strip under the transcript. A horizontal rail that works
 * with every input: touch swipes natively, the mouse wheel and click-drag
 * scroll it, arrow buttons page it, and the arrow keys walk the chips
 * (roving tabindex, so Tab does not crawl through 20+ buttons). Edge fades
 * appear only on the side that has more to show. While a command is being
 * typed, matching chips brighten and the first match scrolls into view.
 */
export default function CommandRail({ commands, needsArg, query, onRun, onFill }: CommandRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: false, end: false });
  const [focusIndex, setFocusIndex] = useState(0);
  const dragged = useRef(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const start = track.scrollLeft > 2;
    const end = track.scrollLeft + track.clientWidth < track.scrollWidth - 2;
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.7,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const reveal = useCallback((button: HTMLElement | null | undefined) => {
    const track = trackRef.current;
    if (!track || !button) return;
    const pad = 44; // clear of the arrow buttons and the fades
    const left = button.offsetLeft - pad;
    const right = button.offsetLeft + button.offsetWidth + pad - track.clientWidth;
    const target = left < track.scrollLeft ? left : right > track.scrollLeft ? right : null;
    if (target !== null) {
      track.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, []);

  // The wheel scrolls the rail sideways; the page only gets the wheel back at
  // either end. Needs a non-passive listener to be allowed to cancel it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; // native sideways
      const max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      const next = track.scrollLeft + event.deltaY;
      if ((event.deltaY < 0 && track.scrollLeft <= 0) || (event.deltaY > 0 && track.scrollLeft >= max)) return;
      event.preventDefault();
      track.scrollLeft = Math.min(max, Math.max(0, next));
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  // Typing a command points at its chip.
  useEffect(() => {
    if (!query) return;
    const index = commands.findIndex((name) => name.startsWith(query));
    if (index < 0) return;
    const track = trackRef.current;
    reveal(track?.children[index] as HTMLElement | undefined);
  }, [query, commands, reveal]);

  // Mouse drag-to-scroll. Touch and pen use the browser's own scrolling.
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    const startX = event.clientX;
    const startLeft = track.scrollLeft;
    dragged.current = false;

    const move = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      if (!dragged.current && Math.abs(dx) < DRAG_THRESHOLD) return;
      dragged.current = true;
      track.dataset.drag = "true";
      track.scrollLeft = startLeft - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      delete track.dataset.drag;
      // The click that ends a drag must not run a command.
      window.setTimeout(() => {
        dragged.current = false;
      }, 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = commands.length - 1;
    let next = focusIndex;
    if (event.key === "ArrowRight") next = Math.min(last, focusIndex + 1);
    else if (event.key === "ArrowLeft") next = Math.max(0, focusIndex - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    setFocusIndex(next);
    const button = trackRef.current?.children[next] as HTMLElement | undefined;
    button?.focus();
    reveal(button);
  };

  return (
    <div className="etc" data-start={edge.start} data-end={edge.end}>
      <button
        type="button"
        className="etc-nav etc-prev"
        aria-label="Scroll commands left"
        tabIndex={-1}
        disabled={!edge.start}
        onClick={() => scrollByPage(-1)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 3 5 8l5 5" />
        </svg>
      </button>

      <div
        ref={trackRef}
        className="etc-track"
        role="toolbar"
        aria-label="Quick commands"
        aria-orientation="horizontal"
        onScroll={measure}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
      >
        {commands.map((name, index) => {
          const match = query !== "" && name.startsWith(query);
          return (
            <button
              key={name}
              type="button"
              tabIndex={index === focusIndex ? 0 : -1}
              data-arg={needsArg.has(name) || undefined}
              data-match={query ? (match ? "yes" : "no") : undefined}
              onFocus={() => setFocusIndex(index)}
              onClick={() => {
                if (dragged.current) return;
                if (needsArg.has(name)) onFill(name);
                else onRun(name);
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="etc-nav etc-next"
        aria-label="Scroll commands right"
        tabIndex={-1}
        disabled={!edge.end}
        onClick={() => scrollByPage(1)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>
    </div>
  );
}
