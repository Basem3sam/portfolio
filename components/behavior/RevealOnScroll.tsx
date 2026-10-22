"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/scroll";

export default function RevealOnScroll() {
  const pathname = usePathname();

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

    document
      .querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed="true"])')
      .forEach((element) => {
        element.dataset.revealed = "false";
        observer.observe(element);
      });

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return null;
}
