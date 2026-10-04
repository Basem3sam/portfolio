"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

export default function RevealOnScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const timers = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          timers.add(
            window.setTimeout(() => {
              element.dataset.revealed = "true";
            }, index * 100),
          );
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -100px 0px" },
    );

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      element.dataset.revealed = "false";
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
