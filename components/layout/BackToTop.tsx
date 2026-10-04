"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { scrollBehavior } from "@/lib/scroll";

const THRESHOLD = 300;

const hidden = "pointer-events-none invisible translate-y-5 opacity-0";
const shown = "translate-y-0 opacity-100";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const scrollingToTop = useRef(false);

  useEffect(() => {
    let timeout: number | undefined;

    const update = () => {
      if (scrollingToTop.current) return;

      const shouldShow = window.scrollY > THRESHOLD;
      setVisible(shouldShow);

      if (!shouldShow && document.activeElement === linkRef.current) {
        linkRef.current?.blur();
      }
    };

    const handleScroll = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(update, 10);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(timeout);
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollingToTop.current = true;
    setVisible(false);
    event.currentTarget.blur();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });

    window.setTimeout(() => {
      scrollingToTop.current = false;
      setVisible(window.scrollY > THRESHOLD);
    }, 1000);
  };

  return (
    <a
      ref={linkRef}
      href="#"
      className={`group fixed right-[30px] bottom-[30px] z-[1030] flex size-[50px] cursor-pointer items-center justify-center rounded-full border-2 border-transparent bg-secondary text-white no-underline shadow-md transition-all duration-300 select-none [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] hover:-translate-y-[5px] hover:border-white/30 hover:bg-[#2980b9] hover:shadow-xl max-md:right-5 max-md:bottom-5 max-md:size-[45px] pointer-coarse:active:scale-95 print:hidden ${visible ? shown : hidden}`}
      aria-label="Back to top"
      onClick={handleClick}
    >
      <i className="fas fa-arrow-up text-[1.2rem] transition-transform duration-300 group-hover:-translate-y-0.5"></i>
    </a>
  );
}
