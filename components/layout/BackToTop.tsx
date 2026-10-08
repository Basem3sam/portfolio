'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Icon from '@/components/ui/Icon';
import { scrollBehavior } from '@/lib/scroll';

const THRESHOLD = 300;

const hidden = 'pointer-events-none invisible translate-y-5 opacity-0';
const shown = 'translate-y-0 opacity-100';

type BackToTopProps = {
  label?: string;
};

export default function BackToTop({ label = 'Back to top' }: BackToTopProps) {
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
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
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
      className={`group fixed end-5 bottom-5 z-[1030] flex size-11 cursor-pointer items-center justify-center rounded-full border border-hairline bg-surface text-dark-text no-underline shadow-md transition-all duration-300 select-none [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] hover:border-signal hover:text-signal hover:shadow-lg md:end-8 md:bottom-8 pointer-coarse:active:scale-95 print:hidden ${visible ? shown : hidden}`}
      aria-label={label}
      onClick={handleClick}
    >
      <Icon
        name="arrowUp"
        className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
