'use client';

import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import ThemeToggle from '@/components/behavior/ThemeToggle';
import { CV_PATH } from '@/data/site';
import type { Dictionary } from '@/lib/dictionaries/en';
import type { Locale } from '@/lib/i18n';

type NavbarProps = {
  labels: Dictionary['nav'];
  theme: Dictionary['theme'];
  locale: Locale;
};

const sections: { href: string; labelKey: keyof Dictionary['nav'] }[] = [
  { href: '#about', labelKey: 'about' },
  { href: '#skills', labelKey: 'skills' },
  { href: '#experience', labelKey: 'experience' },
  { href: '#projects', labelKey: 'projects' },
  { href: '#education', labelKey: 'education' },
  { href: '#contact', labelKey: 'contact' },
];

const sectionIds = sections.map((section) => section.href.slice(1));

const navLinkBase =
  "relative block px-4 py-2 font-medium text-white/90 transition-colors duration-300 hover:text-secondary-ink dark:text-dark-text after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-sm after:bg-secondary after:transition-all after:duration-300 after:content-[''] hover:after:w-4/5";

const navLink = (active = false) =>
  `${navLinkBase} ${active ? 'after:w-4/5' : 'after:w-0'}`;

const navbarTop = 'bg-primary py-4 shadow-sm backdrop-blur-[10px]';
const navbarScrolled =
  'bg-primary/95 py-3 shadow-md backdrop-blur-[20px] backdrop-saturate-[180%] dark:bg-[rgba(15,18,21,0.92)]';

export default function Navbar({ labels, theme, locale }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const linksHref = locale === 'ar' ? '/ar/links' : '/links';

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      {
        threshold: 0,
        rootMargin: '-72px 0px 0px 0px',
      },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const current = Array.from(
        document.querySelectorAll<HTMLElement>('section[id]'),
      ).find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });
      setActiveSection(
        current && sectionIds.includes(current.id) ? current.id : null,
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a[href^="#"]')) setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[1030] flex flex-wrap items-center justify-between transition-all duration-300 print:hidden dark:border-b dark:border-hairline ${scrolled ? navbarScrolled : navbarTop}`}
      role="navigation"
      aria-label={labels.mainNavigation}
      data-scrolled={scrolled}
      onClick={handleClick}
    >
      <div className="container flex flex-wrap items-center justify-between lg:flex-nowrap">
        <a
          className="mr-4 py-[0.3125rem] text-[1.5rem] font-bold tracking-[-0.5px] whitespace-nowrap text-white transition-transform duration-300 hover:scale-105 dark:text-dark-text"
          href="#hero"
          aria-label={labels.ariaHome}
        >
          {labels.home}
        </a>
        <button
          className="cursor-pointer rounded-md border-2 border-white/20 bg-transparent px-3 py-2 text-[1.25rem] leading-none transition-all duration-300 hover:scale-105 hover:border-white/40 focus:shadow-[0_0_0_0.2rem_rgba(255,255,255,0.2)] focus:outline-0 lg:hidden"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label={labels.toggleNavigation}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            viewBox="0 0 30 30"
            className="inline-block h-[1.5em] w-[1.5em] align-middle"
            aria-hidden="true"
          >
            <path
              fill="none"
              stroke="rgba(255, 255, 255, 0.55)"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth={2}
              d="M4 7h22M4 15h22M4 23h22"
            />
          </svg>
        </button>
        <div
          className={`grid grow basis-full transition-[grid-template-rows,visibility] duration-[350ms] ease-in-out lg:visible lg:flex lg:basis-auto lg:items-center ${menuOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}
          id="navbarNav"
        >
          <div className="min-h-0 overflow-hidden lg:ml-auto lg:overflow-visible">
            <ul className="flex list-none flex-col lg:flex-row">
              {sections.map((section) => {
                const active = activeSection === section.href.slice(1);
                return (
                  <li key={section.href}>
                    <a
                      className={navLink(active)}
                      href={section.href}
                      aria-current={active ? 'page' : undefined}
                    >
                      {labels[section.labelKey]}
                    </a>
                  </li>
                );
              })}
              <li>
                <Link className={navLink()} href={linksHref}>
                  {labels.allLinks}
                </Link>
              </li>
              <li>
                <a className={navLink()} href={CV_PATH} download>
                  <i className="fas fa-file-pdf mr-1" aria-hidden="true"></i>
                  {labels.resume}
                </a>
              </li>
              <li>
                <ThemeToggle
                  id="darkModeToggle"
                  labels={theme}
                  className={`${navLink()} cursor-pointer border border-transparent bg-transparent leading-normal hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(160,74,7,0.35)]`}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
