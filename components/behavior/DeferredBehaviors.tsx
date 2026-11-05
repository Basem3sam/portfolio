"use client";

import { useEffect, useState, type ComponentType } from "react";

/**
 * Loads `IdleBehaviors` (smooth scroll, scroll story, route transitions,
 * scrollbar tone, offscreen pausing) after first paint instead of with the
 * page's own JavaScript, so they no longer compete with hydration for the
 * main thread.
 *
 * The load starts on whichever comes first:
 *   - the first input (pointer, key, wheel, touch or scroll). Input arrives
 *     before the scroll it causes, so the story is usually ready by then;
 *   - the browser being idle, with a ceiling so a busy page still gets them.
 *
 * Until then the page is simply its finished self: every one of these is an
 * enhancement that is already optional (reduced motion, low tier, no JS), and
 * the story CSS only applies once the engine sets `html[data-story-on]`. A
 * failed load (offline, blocked) is silent for the same reason.
 */

const INPUT_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

/** The longest the idle wait can last before the load starts anyway. */
const IDLE_CEILING_MS = 2500;
/** Browsers without requestIdleCallback (Safari): a plain delay instead. */
const FALLBACK_DELAY_MS = 1200;

function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: IDLE_CEILING_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(id);
}

export default function DeferredBehaviors() {
  const [Behaviors, setBehaviors] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    let started = false;

    const listen = { passive: true, capture: true } as const;
    let cancelIdle = () => {};

    const stopWaiting = () => {
      cancelIdle();
      for (const type of INPUT_EVENTS) window.removeEventListener(type, start, listen);
    };

    function start() {
      if (started) return;
      started = true;
      stopWaiting();
      import("./IdleBehaviors")
        .then((module) => {
          if (!cancelled) setBehaviors(() => module.default);
        })
        .catch(() => {
          // Enhancements only: the page works without them.
        });
    }

    for (const type of INPUT_EVENTS) window.addEventListener(type, start, listen);
    cancelIdle = whenIdle(start);

    return () => {
      cancelled = true;
      stopWaiting();
    };
  }, []);

  return Behaviors ? <Behaviors /> : null;
}
