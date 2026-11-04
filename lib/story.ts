/**
 * Scroll story engine.
 *
 * Elements opt in with `data-story="<kind>"`. While the page scrolls, the
 * engine writes one number to each of them, `--sp` (0 to 1), and the CSS in
 * `components/behavior/ScrollStory.css` turns that number into motion. Keeping
 * the motion in CSS means designers can tune it without touching JS, and the
 * numbers it writes are the only thing that happens per frame.
 *
 * Kinds (T is the element's top edge measured from the top of the viewport):
 *   enter  0 when the element starts to appear (T = viewport height),
 *          1 when its top reaches 35% of the viewport.
 *   pass   0 as it appears at the bottom, 1 as it leaves at the top.
 *   read   0 when its top reaches 88% of the viewport, 1 when its bottom
 *          reaches 42%. For text that fills in as it is read.
 *   trace  0 when its top reaches 90% of the viewport, 1 when its top reaches
 *          46%. A short, tight scrub for a figure that should finish while
 *          it is still well on screen (the Stack flow). Tall elements, such
 *          as the same flow stacked on a phone, stretch to cover their height.
 *   exit   0 while its top is at the top of the page, 1 once it has
 *          scrolled out. For the hero.
 *   line   Written to `--lp`, not `--sp` (so it can sit inside a `trace`
 *          element). 0 when the element's top reaches the reading line (58%
 *          of the viewport), 1 when its bottom does: a fill that is exactly
 *          as far along as the reader's eye. For each step of the vertical
 *          Stack timeline on phones.
 *
 * Positions are cached (from layout offsets, which ignore the transforms the
 * story itself applies, so there is no feedback loop) and only re-measured when
 * the page resizes, so a scroll frame is plain arithmetic: no layout reads.
 * Without JS, or with reduced motion, the engine never starts and the CSS
 * defaults (`var(--sp, 1)`) leave every element in its finished state.
 */

import { fastScroll } from "@/lib/scroll-speed";

export type StoryKind = "enter" | "pass" | "read" | "trace" | "exit" | "line";

const KINDS: readonly StoryKind[] = ["enter", "pass", "read", "trace", "exit", "line"];

type Item = {
  el: HTMLElement;
  kind: StoryKind;
  top: number;
  height: number;
  value: number;
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Document-space top of an element, ignoring any CSS transforms on it. */
function documentTop(el: HTMLElement) {
  let y = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    y += node.offsetTop;
  }
  return y;
}

export function storyProgress(
  kind: StoryKind,
  top: number,
  height: number,
  scroll: number,
  vh: number,
) {
  const t = top - scroll;
  switch (kind) {
    case "enter":
      return (vh - t) / (vh * 0.65);
    case "pass":
      return (vh - t) / (vh + height);
    case "read":
      return (vh * 0.88 - t) / (vh * 0.46 + height);
    case "trace":
      return (vh * 0.9 - t) / (vh * 0.44 + Math.max(0, height - vh * 0.6));
    case "exit":
      return -t / Math.max(1, height);
    case "line":
      return (vh * 0.58 - t) / Math.max(1, height);
  }
}

export function createStory() {
  let items: Item[] = [];
  let viewport = 0;
  let scroll = 0;
  let observer: ResizeObserver | null = null;
  let measureFrame = 0;
  let live = false;
  let lastApply = 0;
  let trailing = 0;

  const measure = () => {
    measureFrame = 0;
    viewport = window.innerHeight;
    for (const item of items) {
      item.top = documentTop(item.el);
      item.height = item.el.offsetHeight;
    }
    apply();
  };

  const scheduleMeasure = () => {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  };

  const apply = () => {
    for (const item of items) {
      const next =
        Math.round(
          clamp01(storyProgress(item.kind, item.top, item.height, scroll, viewport)) * 1000,
        ) / 1000;
      if (next !== item.value) {
        item.value = next;
        item.el.style.setProperty(item.kind === "line" ? "--lp" : "--sp", String(next));
      }
    }
  };

  return {
    mount(initialScroll: number) {
      items = Array.from(document.querySelectorAll<HTMLElement>("[data-story]"))
        .map((el) => ({ el, kind: el.dataset.story as StoryKind, top: 0, height: 0, value: -1 }))
        .filter((item) => KINDS.includes(item.kind));
      scroll = initialScroll;
      measure();
      // Switch the CSS on only after every element has its real starting value,
      // so nothing flashes between "finished" and "not started".
      document.documentElement.setAttribute("data-story-on", "");
      live = true;

      window.addEventListener("resize", scheduleMeasure, { passive: true });
      window.addEventListener("load", scheduleMeasure);
      void document.fonts?.ready.then(() => live && scheduleMeasure());
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver(scheduleMeasure);
        observer.observe(document.body);
      }
    },

    update(nextScroll: number) {
      scroll = nextScroll;
      const now = performance.now();
      // While a finger is flinging the page, the in-between states cannot be
      // seen, but writing them (each one restyles the section it is on) is what
      // costs the fling its smoothness. Apply at most ~8 times a second, and
      // once more when the page slows down so it lands on the right state.
      if (fastScroll() && now - lastApply < 120) {
        if (!trailing) {
          trailing = window.setTimeout(() => {
            trailing = 0;
            lastApply = performance.now();
            apply();
          }, 130);
        }
        return;
      }
      lastApply = now;
      apply();
    },

    /** Layout changed in a way the observers cannot see (e.g. a section opened). */
    remeasure: scheduleMeasure,

    destroy() {
      live = false;
      if (trailing) window.clearTimeout(trailing);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("load", scheduleMeasure);
      observer?.disconnect();
      if (measureFrame) cancelAnimationFrame(measureFrame);
      document.documentElement.removeAttribute("data-story-on");
      for (const item of items)
        item.el.style.removeProperty(item.kind === "line" ? "--lp" : "--sp");
      items = [];
    },
  };
}
