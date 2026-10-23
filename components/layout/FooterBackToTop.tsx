"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollBehavior } from "@/lib/scroll";

type FooterBackToTopProps = {
  className?: string;
  children: ReactNode;
};

/**
 * The footer's "back to top": scrolls to the top of whatever page the visitor
 * is on. It used to be a section link to the home page's `#hero`, which sent
 * anyone reading a case study (`/work/trosc`) to `/` instead of up the page
 * they were already on. Same behaviour as the floating BackToTop button.
 */
export default function FooterBackToTop({ className, children }: FooterBackToTopProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    event.currentTarget.blur();
  };

  return (
    <a href="#" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
