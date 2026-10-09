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

// Mobile menu section row: mono index + label + trailing arrow
const menuRow =
  "group/row flex min-h-[52px] w-full items-center gap-3 rounded-lg px-3 text-start no-underline transition-colors duration-150 active:bg-light-bg";

const menuRowIndex =
  "font-mono text-xs font-semibold text-secondary/70 dark:text-[#fbbf24]/60";

const menuRowLabel = "flex-1 text-base font-medium text-dark-text transition-colors duration-150 group-hover/row:text-signal";

const menuRowArrow =
  "size-4 text-signal opacity-0 -translate-x-1 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100 rtl:rotate-180 rtl:translate-x-1 rtl:group-hover/row:translate-x-0";

export default function Navbar({ labels, theme, locale, languageSwitch, palette }: NavbarProps) {
  const { openPalette } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modKey] = useState(getModKey);
  const navRef = useRef<HTMLElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const linksHref = locale === "ar" ? "/ar/links" : "/links";

  // Scroll-spy: the active section is the LAST section whose top edge has
  // crossed above the detection line (32px below the navbar).
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

  // Lock body scroll while the mobile menu is open (with scrollbar-width
  // compensation to prevent layout shift); clean unlock on close/unmount.
  useEffect(() => {
    if (!menuOpen) return;

    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = "";
    };
  }, [menuOpen]);

  // Scrim fade: mount at opacity-0, then rAF to the target opacity for a
  // smooth entrance; fade out on close via the transition + delayed unmount.
  useEffect(() => {
    if (!menuOpen || !scrimRef.current) return;

    const scrim = scrimRef.current;
    const raf = requestAnimationFrame(() => scrim.classList.add("opacity-40"));
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a[href^="#"]')) setMenuOpen(false);
  };

  return (
    <>
      {/* Scrim: dims the page while the mobile menu is open; stays mounted
          during the close transition, then unmounts. */}
      {menuOpen && (
        <div
          ref={scrimRef}
          className="fixed inset-0 z-[1029] nav-scrim opacity-0 transition-opacity duration-300 motion-reduce:transition-none print:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      )}

      <nav
        ref={navRef}
        className={`group/nav fixed inset-x-0 top-0 z-[1030] border-b transition-[padding,background-color,border-color,box-shadow] duration-300 print:hidden ${
          scrolled
            ? "border-hairline py-2 shadow-xs nav-glass hover:nav-glass-hover"
            : "border-transparent bg-(--c-page) py-3"
        } ${menuOpen ? "border-hairline shadow-xs bg-(--c-page)" : ""}`}
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
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-hairline bg-surface/50 text-dark-text transition-all duration-200 hover:border-signal hover:text-signal active:scale-95 lg:hidden"
            aria-controls="navbarNav"
            aria-expanded={menuOpen}
            aria-label={labels.toggleNavigation}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "x" : "menu"} className="size-5" />
          </button>

          {/* Mobile expanded panel: a designed navigation surface.
              On lg+ it collapses to the standard inline row. */}
          <div
            className={`grid grow basis-full transition-[grid-template-rows,visibility] duration-300 ease-in-out lg:visible lg:flex lg:basis-auto lg:items-center ${
              menuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
            }`}
            id="navbarNav"
          >
            <div
              className={`min-h-0 transition-colors duration-300 max-lg:pb-[env(safe-area-inset-bottom)] lg:overflow-visible lg:ms-auto ${
                menuOpen
                  ? "max-lg:bg-(--c-page) max-lg:shadow-lg"
                  : "bg-transparent"
              }`}
            >
              {/* Mobile: the panel content, with breathing room and its own composition */}
              <div className="flex flex-col px-4 pt-6 pb-6 lg:hidden">
                {/* Section rows — the primary navigation, as designed tappable rows */}
                <nav aria-label={labels.mainNavigation} className="flex flex-col gap-1">
                  {sections.map((section, index) => {
                    const active = activeSection === section.href.slice(1);
                    return (
                      <a
                        key={section.href}
                        href={section.href}
                        aria-current={active ? "page" : undefined}
                        style={{ animationDelay: `${80 + index * 50}ms` }}
                        className={`${menuRow} ${active ? "bg-light-bg" : ""} ${
                          menuOpen ? "motion-safe:animate-menu-item-in" : ""
                        }`}
                      >
                        <span className={menuRowIndex} dir="ltr">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className={active ? `${menuRowLabel} text-secondary` : menuRowLabel}>
                          {labels[section.labelKey]}
                        </span>
                        <Icon name="arrowRight" className={menuRowArrow} />
                      </a>
                    );
                  })}
                </nav>

                {/* Palette trigger as a row, matching the section rows */}
                <button
                  type="button"
                  className={`${menuRow} mt-2 cursor-pointer`}
                  style={{ animationDelay: `${80 + sections.length * 50}ms` }}
                  onClick={() => {
                    setMenuOpen(false);
                    openPalette();
                  }}
                >
                  <span className={menuRowIndex} dir="ltr">
                    ⌕
                  </span>
                  <span className={menuRowLabel}>{palette.trigger}</span>
                  <Icon name="arrowRight" className={menuRowArrow} />
                </button>

                {/* Action footer: quick links + language + theme + close */}
                <div
                  className="mt-auto pt-6"
                  style={{ animationDelay: `${80 + (sections.length + 1) * 50}ms` }}
                >
                  <div className="mb-4 flex items-center gap-2" aria-hidden="true">
                    <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-text uppercase">
                      {labels.allLinks}
                    </span>
                    <span className="h-px flex-1 bg-hairline"></span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={linksHref} className={`${auxLink} rounded-lg py-2`}>
                      <Icon name="externalLink" className="size-4" />
                      {labels.allLinks}
                    </Link>
                    <a href={CV_PATH} download className={`${auxLink} rounded-lg py-2`}>
                      <Icon name="fileDown" className="size-4" />
                      {labels.resume}
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <LanguageSwitcher {...languageSwitch} />
                    <ThemeToggle
                      id="darkModeToggle"
                      labels={theme}
                      className={themeButton}
                      iconClassName="size-5"
                    />
                  </div>

                  {/* Bottom close: thumb-reach dismiss */}
                  <button
                    type="button"
                    className="mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-hairline text-sm font-medium text-light-text transition-colors duration-200 hover:border-signal hover:text-signal active:scale-[0.98]"
                    onClick={closeMenu}
                  >
                    <Icon name="x" className="size-4" />
                    Close
                  </button>
                </div>
              </div>

              {/* Desktop: the standard inline row (unchanged) */}
              <div className="hidden lg:block">
                <ul className="flex list-none items-center">
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

                  <li className="ms-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={openPalette}
                        aria-label={palette.trigger}
                        className={paletteButton}
                      >
                        <Icon name="search" className="size-4" />
                        <span
                          className="font-mono text-xs text-muted-text"
                          suppressHydrationWarning
                        >
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
        </div>
      </nav>
    </>
  );
}