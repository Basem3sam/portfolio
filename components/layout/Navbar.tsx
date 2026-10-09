"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useCommandPalette } from "@/components/palette/CommandPalette";
import Icon from "@/components/ui/Icon";
import { CV_PATH } from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";

type NavbarProps = {
  labels: Dictionary["nav"];
  theme: Dictionary["theme"];
  locale: Locale;
  languageSwitch: { href: string; hrefLang: string; label: string };
  palette: Dictionary["palette"];
};

function getModKey() {
  if (typeof navigator === "undefined") return "⌘";
  return /mac/i.test(navigator.userAgent) ? "⌘" : "Ctrl";
}

const sections: { href: string; labelKey: keyof Dictionary["nav"] }[] = [
  { href: "#work", labelKey: "work" },
  { href: "#stack", labelKey: "stack" },
  { href: "#about", labelKey: "about" },
  { href: "#experience", labelKey: "experience" },
  { href: "#education", labelKey: "education" },
  { href: "#contact", labelKey: "contact" },
];

const sectionIds = sections.map((section) => section.href.slice(1));

// Fired by ScrollManager after a smooth-scroll navigation settles, so the
// spy syncs to the destination immediately.
const NAV_SYNC_EVENT = "navbar-sync-section";

const sectionLink = (active: boolean) =>
  `relative flex min-h-11 items-center px-2.5 text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-2.5 after:bottom-2 after:h-0.5 after:rounded-full after:transition-transform after:duration-200 after:content-[''] max-lg:after:hidden ${
    active
      ? "text-secondary after:scale-x-100 after:bg-secondary"
      : "text-light-text hover:text-signal after:scale-x-0 after:bg-signal hover:after:scale-x-100"
  }`;

const auxLink =
  "flex min-h-11 items-center gap-1.5 px-2.5 text-sm font-medium text-light-text no-underline transition-colors duration-200 hover:text-signal";

const themeButton =
  "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-hairline bg-surface/50 text-light-text transition-colors duration-200 hover:border-signal hover:text-signal max-lg:w-full";

const paletteButton =
  "hidden min-h-11 cursor-pointer items-center gap-2 rounded-md border border-hairline bg-surface/50 px-3 text-sm font-medium text-light-text transition-colors duration-200 hover:border-signal hover:text-signal lg:inline-flex";

export default function Navbar({ labels, theme, locale, languageSwitch, palette }: NavbarProps) {
  const { openPalette } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modKey] = useState(getModKey);
  const navRef = useRef<HTMLElement>(null);
  const linksHref = locale === "ar" ? "/ar/links" : "/links";

  // Scroll-spy: the active section is the LAST section whose top edge has
  // crossed above the detection line. The line sits 32px below the navbar —
  // wide enough to absorb the navbar's height transition during scroll
  // (py-3 unscrolled → py-2 scrolled = 8px) plus the scroll offset (+10px)
  // plus margin, so the destination section's top always clears the line.
  useEffect(() => {
    let frame = 0;

    const detectionLine = () => {
      const nav = navRef.current;
      return nav ? nav.offsetHeight + 32 : 120;
    };

    const update = () => {
      frame = 0;
      const line = detectionLine();
      let current: string | null = null;

      for (const section of document.querySelectorAll<HTMLElement>("section[id]")) {
        if (section.getBoundingClientRect().top <= line) {
          current = section.id;
        } else {
          break;
        }
      }

      setActiveSection(current && sectionIds.includes(current) ? current : null);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener(NAV_SYNC_EVENT, update);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener(NAV_SYNC_EVENT, update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Scrolled state: IntersectionObserver on #hero (homepage), scroll
  // listener fallback for pages without #hero (case study).
  useEffect(() => {
    const hero = document.getElementById("hero");

    if (!hero) {
      let frame = 0;
      const update = () => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      };
      const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      return () => {
        window.removeEventListener("scroll", schedule);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: "-72px 0px 0px 0px",
    });

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a[href^="#"]')) setMenuOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-[1030] border-b transition-[padding,background-color,border-color,box-shadow] duration-300 print:hidden ${
        scrolled
          ? "border-hairline py-2 shadow-xs nav-glass"
          : "border-transparent bg-(--c-page) py-3"
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
          <span className="size-2 rounded-full bg-status" aria-hidden="true"></span>
          <span>basem.esam</span>
        </a>

        <button
          type="button"
          className="flex size-11 cursor-pointer items-center justify-center rounded-md border border-hairline bg-surface/50 text-dark-text transition-colors duration-200 hover:border-signal hover:text-signal lg:hidden"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label={labels.toggleNavigation}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name="menu" className="size-5" />
        </button>

        <div
          className={`grid grow basis-full transition-[grid-template-rows,visibility] duration-300 ease-in-out lg:visible lg:flex lg:basis-auto lg:items-center ${
            menuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
          }`}
          id="navbarNav"
        >
          <div className="min-h-0 overflow-hidden lg:ms-auto lg:overflow-visible">
            <button
              type="button"
              className="mb-2 flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm font-medium text-light-text transition-colors duration-200 hover:text-signal lg:hidden"
              onClick={() => {
                setMenuOpen(false);
                openPalette();
              }}
            >
              <Icon name="search" className="size-4" />
              {palette.trigger}
            </button>

            <ul className="flex list-none flex-col border-t border-hairline py-2 lg:flex-row lg:items-center lg:border-0 lg:py-0">
              {sections.map((section) => {
                const active = activeSection === section.href.slice(1);
                return (
                  <li key={section.href}>
                    <a
                      className={sectionLink(active)}
                      href={section.href}
                      aria-current={active ? "page" : undefined}
                    >
                      {labels[section.labelKey]}
                    </a>
                  </li>
                );
              })}

              <li className="max-lg:mt-1 max-lg:border-t max-lg:border-hairline max-lg:pt-2 lg:ms-2">
                <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
                  <button
                    type="button"
                    onClick={openPalette}
                    aria-label={palette.trigger}
                    className={paletteButton}
                  >
                    <Icon name="search" className="size-4" />
                    <span className="font-mono text-xs text-muted-text" suppressHydrationWarning>
                      {modKey} K
                    </span>
                  </button>
                  <Link href={linksHref} className={auxLink}>
                    <Icon name="externalLink" className="size-4" />
                    {labels.allLinks}
                  </Link>
                  <a href={CV_PATH} download className={auxLink}>
                    <Icon name="fileDown" className="size-4" />
                    {labels.resume}
                  </a>
                  <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-2">
                    <LanguageSwitcher {...languageSwitch} className="max-lg:w-full" />
                    <ThemeToggle
                      id="darkModeToggle"
                      labels={theme}
                      className={themeButton}
                      iconClassName="size-5"
                    />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}