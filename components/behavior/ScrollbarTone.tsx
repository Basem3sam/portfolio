"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps the page scrollbar's strip in step with the band beside it.
 *
 * The scrollbar sits in a 10px strip that `scrollbar-gutter: stable` always
 * reserves. In light mode that strip shows the page colour, and no section can
 * paint into it, so next to every dark band (stack, contact, the footer, a case
 * study hero) it read as a pale pipe cutting through the dark. The strip takes
 * the colour of the `html` background and does not scroll with the page, so the
 * only way to match it is to change that colour as the page moves.
 *
 * This marks `<html data-edge="dark">` (and sets `--edge-color`) while a dark
 * band covers the middle of the screen. globals.css turns that into the strip's
 * colour with a short fade and lightens the scrollbar thumb so it stays visible.
 * Dark mode is already dark everywhere, so the CSS leaves it alone.
 *
 * A band is picked up by its selector below, or by adding
 * `data-tone="dark"` (and optionally `data-edge-color="#rrggbb"`) to any new
 * dark section. The strip is one colour for the whole height, so when a band's
 * edge is crossing the middle of the screen the other half is briefly mismatched;
 * the fade softens that.
 */

type Band = { selector: string; color: string };

const BANDS: Band[] = [
  { selector: "#stack", color: "#0a1230" },
  { selector: "#contact", color: "#04103a" },
  { selector: ".case-hero", color: "#04103a" },
  { selector: "footer.foot", color: "#040e2e" },
  { selector: '[data-tone="dark"]', color: "#05123a" },
];

export default function ScrollbarTone() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const root = document.documentElement;
    const colorOf = new Map<Element, string>();
    const covering = new Set<Element>();

    const paint = () => {
      // The band covering the middle of the screen wins; if two ever overlap
      // the one later in the page does.
      let color: string | undefined;
      covering.forEach((element) => {
        color = colorOf.get(element) ?? color;
      });
      if (color) {
        root.style.setProperty("--edge-color", color);
        root.dataset.edge = "dark";
      } else {
        delete root.dataset.edge;
      }
    };

    // A zero-height window along the vertical middle of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) covering.add(entry.target);
          else covering.delete(entry.target);
        }
        paint();
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    const scan = () => {
      let removed = false;
      colorOf.forEach((_color, element) => {
        if (element.isConnected) return;
        observer.unobserve(element);
        colorOf.delete(element);
        covering.delete(element);
        removed = true;
      });

      for (const band of BANDS) {
        document.querySelectorAll(band.selector).forEach((element) => {
          if (colorOf.has(element)) return;
          colorOf.set(element, element.getAttribute("data-edge-color") ?? band.color);
          observer.observe(element);
        });
      }

      if (removed) paint();
    };

    scan();

    // Sections mount lazily and on route changes; look again when the DOM
    // changes, at most a few times a second.
    let timer = 0;
    const mutations = new MutationObserver(() => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        scan();
      }, 200);
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      mutations.disconnect();
      observer.disconnect();
      covering.clear();
      colorOf.clear();
      delete root.dataset.edge;
      root.style.removeProperty("--edge-color");
    };
  }, [pathname]);

  return null;
}
