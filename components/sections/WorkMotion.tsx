"use client";

import { useEffect } from "react";
import { prefersReducedMotion, revealBelow } from "@/lib/scroll";

const DURATION = 520;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Makes the project cards react as one when a card's "Details" opens or closes
 * in the two-column layout.
 *
 * Without this, the card's partner would snap from "stretched to match" to its
 * own height the instant the details open, and the rest of the grid would jump
 * with it. Here both cards of the pair animate their height from where they
 * were to where they end up, so the open card grows like a curtain, its
 * partner eases to its own size, and the rows below slide with them. The same
 * motion runs in reverse on close, with the text left visible until the card
 * has finished shrinking.
 *
 * The featured panel and the single-column layout keep the CSS-only slide, and
 * `prefers-reduced-motion` skips all of it. Renders nothing.
 */
export default function WorkMotion() {
  useEffect(() => {
    const root = document.getElementById("work");
    if (!root) return;

    const wide = window.matchMedia("(min-width: 900px)");

    // Two-column layout: give both visuals of a pair the height of the taller
    // one, so titles line up whatever mix of previews and diagrams sits in it.
    const equalise = () => {
      const rows = Array.from(root.querySelectorAll<HTMLElement>(".row"));
      rows.forEach((row) => row.style.removeProperty("--pair-media"));
      if (!wide.matches) return;
      for (let i = 0; i < rows.length; i += 2) {
        const pair = rows.slice(i, i + 2);
        pair.forEach((row) => row.style.setProperty("--pair-media", "0px"));
        const tallest = Math.max(
          ...pair.map((row) => row.querySelector(".row-media")?.getBoundingClientRect().height ?? 0),
        );
        pair.forEach((row) => row.style.setProperty("--pair-media", `${Math.ceil(tallest)}px`));
      }
    };

    const sync = () => {
      root.classList.toggle("js-disc", wide.matches);
      equalise();
    };
    sync();
    wide.addEventListener("change", sync);

    // Chips can re-wrap when the column width changes; fonts can change sizes.
    let lastWidth = root.clientWidth;
    const observer = new ResizeObserver(() => {
      if (root.clientWidth === lastWidth) return;
      lastWidth = root.clientWidth;
      equalise();
    });
    observer.observe(root);
    void document.fonts?.ready.then(equalise);

    // Re-measure whenever a visual itself changes size (a screenshot or a font
    // arriving late), so the two visuals of a pair never drift apart. Writing
    // the same heights back does not retrigger it.
    let frame = 0;
    const visuals = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(equalise);
    });
    root.querySelectorAll(".row .sp, .row .plate").forEach((el) => visuals.observe(el));
    window.addEventListener("load", equalise);

    // One in-flight toggle per <details>: how to settle it immediately.
    const pending = new WeakMap<HTMLDetailsElement, () => void>();
    const heights = (cards: HTMLElement[]) => cards.map((c) => c.getBoundingClientRect().height);
    // Where each direct child of a card sits, measured from the card's top.
    const offsets = (cards: HTMLElement[]) =>
      cards.map((c) => {
        const top = c.getBoundingClientRect().top;
        return Array.from(c.children).map((child) => child.getBoundingClientRect().top - top);
      });

    const onClick = (event: MouseEvent) => {
      if (!wide.matches || prefersReducedMotion()) return;

      const summary = (event.target as Element | null)?.closest?.("summary");
      const details = summary?.parentElement;
      if (!(details instanceof HTMLDetailsElement) || !details.classList.contains("disc")) return;
      const card = details.closest<HTMLElement>(".row");
      if (!card) return;

      event.preventDefault();

      const cards = Array.from(root.querySelectorAll<HTMLElement>(".row"));
      const at = cards.indexOf(card);
      const partner = cards[at % 2 === 0 ? at + 1 : at - 1];
      const pair = [card, partner].filter(Boolean) as HTMLElement[];

      // Where everything is right now, even mid-animation.
      const before = heights(pair);
      const beforeAt = offsets(pair);
      pending.get(details)?.();

      const opening = !details.open;

      // Jump to the final state without transitions just long enough to
      // measure it, then animate from the old heights to the new ones.
      root.classList.add("is-measuring");
      details.open = opening;
      const after = heights(pair);
      const afterAt = offsets(pair);
      if (!opening) {
        // Keep the text on screen while the card shrinks around it.
        details.open = true;
        details.dataset.state = "closing";
      }
      root.classList.remove("is-measuring");

      const animations = pair.map((el, i) =>
        el.animate([{ height: `${before[i]}px` }, { height: `${after[i]}px` }], {
          duration: DURATION,
          easing: EASE,
          fill: "forwards",
        }),
      );

      // A card that was stretched by its neighbour pins its footer (tech list,
      // actions, Details bar) to the bottom with auto margins. When the pair
      // stops sharing a height that slack disappears and those blocks would
      // jump up in one frame. Glide them instead: the layout already is the
      // final one when opening, and still the old one when closing.
      const glides: Animation[] = [];
      pair.forEach((el, i) => {
        Array.from(el.children).forEach((child, j) => {
          const delta = (beforeAt[i]?.[j] ?? 0) - (afterAt[i]?.[j] ?? 0);
          if (Math.abs(delta) < 0.5) return;
          const rest = "translateY(0)";
          const moved = `translateY(${opening ? delta : -delta}px)`;
          glides.push(
            (child as HTMLElement).animate(
              [{ transform: opening ? moved : rest }, { transform: opening ? rest : moved }],
              { duration: DURATION, easing: EASE, fill: "forwards" },
            ),
          );
        });
      });

      const settle = () => {
        pending.delete(details);
        if (!opening) {
          details.open = false;
          delete details.dataset.state;
        }
        animations.forEach((a) => a.cancel());
        glides.forEach((a) => a.cancel());
      };
      pending.set(details, settle);

      animations[0].finished
        .then(() => {
          if (pending.get(details) !== settle) return;
          settle();
          if (opening) {
            const { bottom } = card.getBoundingClientRect();
            if (bottom > window.innerHeight - 16) {
              revealBelow(card);
            }
          }
        })
        .catch(() => {});
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      wide.removeEventListener("change", sync);
      observer.disconnect();
      visuals.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("load", equalise);
      root.classList.remove("js-disc", "is-measuring");
    };
  }, []);

  return null;
}
