'use client';

import Link from 'next/link';
import { useEffect, useState, type MouseEvent } from 'react';
import ThemeToggle from '@/components/behavior/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import Icon from '@/components/ui/Icon';
import { CV_PATH } from '@/data/site';
import type { Dictionary } from '@/lib/dictionaries/en';
import type { Locale } from '@/lib/i18n';

type NavbarProps = {
  labels: Dictionary['nav'];
  theme: Dictionary['theme'];
  locale: Locale;
  languageSwitch: { href: string; hrefLang: string; label: string };
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

const sectionLink = (active: boolean) =>
  `relative flex min-h-11 items-center px-2.5 text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-2.5 after:bottom-2 after:h-0.5 after:rounded-sm after:bg-secondary after:transition-transform after:duration-200 max-lg:after:hidden ${active ? 'text-secondary after:scale-x-100' : 'text-light-text hover:text-dark-text after:scale-x-0'}`;

const auxLink =
  'flex min-h-11 items-center gap-1.5 px-2.5 text-sm font-medium text-light-text no-underline transition-colors duration-200 hover:text-dark-text';

const themeButton =
  'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-hairline bg-surface/50 text-light-text transition-colors duration-200 hover:border-secondary hover:text-secondary max-lg:self-start';

export default function Navbar({
  labels,
  theme,
  locale,
  languageSwitch,
}: NavbarProps) {
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
      className={`fixed inset-x-0 top-0 z-[1030] border-b transition-[padding,background-color,border-color,box-shadow] duration-300 print:hidden ${
        scrolled
          ? 'border-hairline bg-(--c-page) py-2 shadow-xs'
          : 'border-transparent bg-(--c-page) py-3'
      }`}
      aria-label={labels.mainNavigation}
      data-scrolled={scrolled}
      onClick={handleClick}
    >
      <div className="container flex flex-wrap items-center justify-between lg:flex-nowrap">
        <a
          href="#hero"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-base font-semibold text-dark-text no-underline transition-colors duration-200 hover:text-secondary"
          aria-label={labels.ariaHome}
        >
          <span
            className="size-2 rounded-full bg-status"
            aria-hidden="true"
          ></span>
          <span>basem.esam</span>
        </a>

        <button
          type="button"
          className="flex size-11 cursor-pointer items-center justify-center rounded-md border border-hairline bg-surface/50 text-dark-text transition-colors duration-200 hover:border-secondary hover:text-secondary lg:hidden"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label={labels.toggleNavigation}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name="menu" className="size-5" />
        </button>

        <div
          className={`grid grow basis-full transition-[grid-template-rows,visibility] duration-300 ease-in-out lg:visible lg:flex lg:basis-auto lg:items-center ${
            menuOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
          }`}
          id="navbarNav"
        >
          <div className="min-h-0 overflow-hidden lg:ms-auto lg:overflow-visible">
            <ul className="flex list-none flex-col border-t border-hairline py-2 lg:flex-row lg:items-center lg:border-0 lg:py-0">
              {sections.map((section) => {
                const active = activeSection === section.href.slice(1);
                return (
                  <li key={section.href}>
                    <a
                      className={sectionLink(active)}
                      href={section.href}
                      aria-current={active ? 'page' : undefined}
                    >
                      {labels[section.labelKey]}
                    </a>
                  </li>
                );
              })}

              <li className="max-lg:mt-1 max-lg:border-t max-lg:border-hairline max-lg:pt-1 lg:ms-2">
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
                  <Link href={linksHref} className={auxLink}>
                    <Icon name="externalLink" className="size-4" />
                    {labels.allLinks}
                  </Link>
                  <a href={CV_PATH} download className={auxLink}>
                    <Icon name="fileDown" className="size-4" />
                    {labels.resume}
                  </a>
                  <LanguageSwitcher {...languageSwitch} />
                  <ThemeToggle
                    id="darkModeToggle"
                    labels={theme}
                    className={themeButton}
                    iconClassName="size-5"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
