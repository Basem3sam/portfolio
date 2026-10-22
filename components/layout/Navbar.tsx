"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { useCommandPalette } from "@/components/palette/CommandPalette";
import Icon from "@/components/ui/Icon";
import Mark from "@/components/ui/Mark";
import { CV_PATH, GITHUB_URL, LINKEDIN_URL, MAILTO, PHONE_DISPLAY, PHONE_TEL } from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import { getNavbarHeight, homeAnchorHref } from "@/lib/scroll";
import "./Navbar.css";

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

/**
 * The five home sections, in mockup order: scroll-spy targets, the progress
 * rail's segments, and the mobile menu rows. Education no longer exists.
 */
const sections: { href: string; labelKey: keyof Dictionary["nav"] }[] = [
  { href: "#work", labelKey: "work" },
  { href: "#experience", labelKey: "experience" },
  { href: "#stack", labelKey: "stack" },
  { href: "#about", labelKey: "about" },
  { href: "#contact", labelKey: "contact" },
];

/** The four section links that always fit in the desktop bar. Contact becomes
 *  the "Let's talk" button at xl, and /links only joins the bar at xl (below
 *  that it is the icon link in the utility group). */
const barSections = sections.slice(0, 4);

const sectionIds = sections.map((section) => section.href.slice(1));

const NAV_SYNC_EVENT = "navbar-sync-section";

/** Scroll distance over which the bar turns into the glass capsule. Short on
 *  purpose: a long ramp leaves page content under a bare bar. */
const NAV_RAMP_PX = 80;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Desktop section link. The mockup's final state has no per-link underline:
 * one shared `.nav-ind` pill (or, at the top of the page, a 2px honey rule)
 * slides underneath instead — see Navbar.css and the indicator effect below.
 */
const sectionLink = (active: boolean) =>
  `relative z-[1] flex min-h-11 items-center px-2.5 text-sm font-medium transition-colors duration-200 ${
    active ? "text-dark-text" : "text-light-text hover:text-dark-text"
  }`;

const auxLink =
  "flex min-h-11 items-center gap-1.5 px-2.5 text-sm font-medium text-light-text no-underline transition-colors duration-200 hover:text-signal";

// Between lg and xl the bar is too narrow for text labels, so the secondary
// links collapse to icon buttons (the label stays for assistive tech).
const auxLinkBar = `${auxLink} nav-ctl nav-ctl-quiet rounded-md max-xl:min-w-11 max-xl:justify-center`;
const auxLabel = "max-xl:sr-only";

const talkButton =
  "nav-cta hidden min-h-11 items-center rounded-full text-sm font-semibold no-underline xl:inline-flex";

const themeButton =
  "nav-ctl nav-ctl-quiet flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md max-lg:w-full";

const paletteButton =
  "nav-ctl hidden min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium lg:inline-flex max-xl:min-w-11 max-xl:justify-center max-xl:px-0";

/** The phone bar carries the search control too (reference mobile nav). */
const mobilePaletteButton =
  "nav-mobile-btn nav-ctl ms-auto flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md";

const menuRow = "menu-row relative w-full no-underline";

const menuThemeButton =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-hairline bg-surface/50 text-light-text transition-colors duration-200 hover:border-signal hover:text-signal";

type SectionAnchorProps = {
  /** Raw section hash, e.g. `#work`. */
  href: string;
  /** True when the current route is the home page, where the section exists. */
  isHome: boolean;
  locale: Locale;
  className?: string;
  style?: CSSProperties;
  active?: boolean;
  /** Section-style link that the sliding `.nav-ind` pill may follow. */
  ind?: boolean;
  /** Adds `data-nav-logo`, which `getNavbarHeight()` measures. */
  logo?: boolean;
  ariaLabel?: string;
  children: ReactNode;
};

/**
 * The navbar's section links target sections that only exist on the home page.
 *
 * On the home route they stay plain `<a href="#…">`, leaving ScrollManager in
 * charge of smooth scroll, focus and history — unchanged behaviour.
 *
 * Off the home route a bare `#…` resolves against the current page, producing
 * URLs like `/work/trosc#work` where the element does not exist and nothing
 * scrolls. There they become route links to `/#…`, and ScrollManager scrolls
 * once the destination has mounted. `data-nav-section` marks both forms so the
 * mobile menu can close on either.
 */
function SectionAnchor({
  href,
  isHome,
  locale,
  className,
  style,
  active,
  ind,
  logo,
  ariaLabel,
  children,
}: SectionAnchorProps) {
  const current = active ? "page" : undefined;
  const dataNavLogo = {
    ...(logo ? { "data-nav-logo": true } : {}),
    ...(ind ? { "data-nav-ind": true } : {}),
  };

  if (isHome) {
    return (
      <a
        href={href}
        className={className}
        style={style}
        aria-current={current}
        aria-label={ariaLabel}
        data-nav-section
        {...dataNavLogo}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={homeAnchorHref(locale, href)}
      className={className}
      style={style}
      aria-current={current}
      aria-label={ariaLabel}
      data-nav-section
      {...dataNavLogo}
    >
      {children}
    </Link>
  );
}

export default function Navbar({ labels, theme, locale, languageSwitch, palette }: NavbarProps) {
  const { openPalette } = useCommandPalette();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modKey] = useState(getModKey);
  const navRef = useRef<HTMLElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linksHref = locale === "ar" ? "/ar/links" : "/links";
  const pathname = usePathname();

  // `proxy.ts` rewrites `/` to `/en`, so the English home is reachable at both
  // URLs. Anywhere else the section anchors below do not exist in the DOM.
  const isHome = pathname === "/" || pathname === `/${locale}`;

  // The case study is its own route. Its hero is the deep-blue tide band, so
  // the bar keeps light ink over it until the glass capsule takes over, and
  // the Work link is the section the reader is actually in.
  const onCaseStudy = pathname.endsWith("/work/trosc");
  const activeId = onCaseStudy ? "work" : activeSection;

  // Scroll-spy: the active section is the LAST section whose top edge has
  // crossed above the detection line (32px below the navbar).
  useEffect(() => {
    let frame = 0;

    // Closed-bar height, so the open mobile menu never shifts the line.
    const detectionLine = () => getNavbarHeight() + 32;

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

  // One shared indicator slides under the hovered link and parks on the active
  // section (mockup rev 21: `.nav-ind`). It is written straight to the DOM like
  // the progress rail, so pointing and scrolling never re-render React; the
  // reduced-motion path just drops the slide (Navbar.css). Re-runs when the
  // active section changes so it re-parks on the new link.
  useEffect(() => {
    const bar = barRef.current;
    const indicator = indicatorRef.current;
    if (!bar || !indicator) return;

    const currentLink = () => bar.querySelector<HTMLElement>("a[data-nav-ind][aria-current='page']");

    const move = (el: HTMLElement | null) => {
      // `offsetParent` is null when the desktop list is collapsed (mobile).
      if (!el || el.offsetParent === null) {
        indicator.classList.remove("on");
        return;
      }
      const box = bar.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      indicator.style.setProperty("--ix", `${rect.left - box.left}px`);
      indicator.style.setProperty("--iw", `${rect.width}px`);
      indicator.classList.add("on");
    };

    move(currentLink());

    const enter = (event: Event) => move(event.currentTarget as HTMLElement);
    const leave = () => move(currentLink());
    const anchors = Array.from(bar.querySelectorAll<HTMLElement>("a[data-nav-ind]"));

    for (const anchor of anchors) {
      anchor.addEventListener("pointerenter", enter);
      anchor.addEventListener("focus", enter);
      anchor.addEventListener("pointerleave", leave);
      anchor.addEventListener("blur", leave);
    }

    return () => {
      for (const anchor of anchors) {
        anchor.removeEventListener("pointerenter", enter);
        anchor.removeEventListener("focus", enter);
        anchor.removeEventListener("pointerleave", leave);
        anchor.removeEventListener("blur", leave);
      }
    };
  }, [activeId]);

  // Capsule progress (--np) and the section progress rail. Both are written
  // straight to the DOM from one rAF-throttled scroll handler, so scrolling
  // never re-renders React. While the mobile menu is open the capsule is held
  // fully formed.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let frame = 0;
    const segments = Array.from(progressRef.current?.children ?? []) as HTMLElement[];

    const paintProgress = () => {
      if (menuOpen || segments.length === 0) return;

      // Same detection line the scroll-spy uses, so the rail and the active
      // link agree about which section is being read.
      const line = getNavbarHeight() + 32;
      const sectionEls = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

      if (sectionEls.length === 0) {
        // Routes without the home sections (case study): one segment that
        // tracks the whole document.
        const max = document.documentElement.scrollHeight - window.innerHeight;
        segments.forEach((segment, index) => {
          segment.style.display = index === 0 ? "" : "none";
        });
        segments[0].style.flexGrow = "1";
        const fill = segments[0].firstElementChild as HTMLElement | null;
        if (fill) fill.style.width = `${clamp01(max > 0 ? window.scrollY / max : 0) * 100}%`;
        return;
      }

      // Fractional-DPI screens can stop a pixel or two short of the end, so the
      // rail snaps to complete within 2px of the bottom (the standalone top
      // bar used to do this; the rail is now the only progress indicator).
      const root = document.documentElement;
      const atBottom = root.scrollHeight - window.innerHeight - window.scrollY <= 2;

      segments.forEach((segment, index) => {
        const el = sectionEls[index];
        segment.style.display = el ? "" : "none";
        if (!el) return;
        const rect = el.getBoundingClientRect();
        segment.style.flexGrow = String(Math.max(1, Math.round(rect.height)));
        const fill = segment.firstElementChild as HTMLElement | null;
        if (fill) {
          fill.style.width = atBottom ? "100%" : `${clamp01((line - rect.top) / rect.height) * 100}%`;
        }
      });
    };

    const update = () => {
      frame = 0;
      const np = menuOpen ? 1 : clamp01(window.scrollY / NAV_RAMP_PX);
      nav.style.setProperty("--np", np.toFixed(3));
      paintProgress();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener(NAV_SYNC_EVENT, schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener(NAV_SYNC_EVENT, schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [menuOpen]);

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
  }, [pathname]);

  // The menu never locks the page. It collapses as soon as the user
  // interacts with anything outside it: a press outside, scrolling the
  // page, Escape, or the viewport growing into the desktop layout.
  useEffect(() => {
    if (!menuOpen) return;

    const startY = window.scrollY;
    const close = () => setMenuOpen(false);

    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) close();
    };
    const handleScroll = () => {
      if (Math.abs(window.scrollY - startY) > 10) close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const desktop = window.matchMedia("(min-width: 992px)");
    const handleDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    desktop.addEventListener("change", handleDesktop);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
      desktop.removeEventListener("change", handleDesktop);
    };
  }, [menuOpen]);

  // Scrim fade: mount at opacity-0, then rAF to the target opacity.
  useEffect(() => {
    if (!menuOpen || !scrimRef.current) return;

    const scrim = scrimRef.current;
    const raf = requestAnimationFrame(() => scrim.classList.add("opacity-40"));
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    // Matches both the local `<a href="#…">` and the cross-route route link,
    // so the menu closes whichever form a section link currently takes.
    if ((event.target as Element).closest("a[data-nav-section]")) setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && (
        <div
          ref={scrimRef}
          className="fixed inset-0 z-[1029] opacity-0 nav-scrim transition-opacity duration-300 motion-reduce:transition-none print:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      )}

      <nav
        ref={navRef}
        className="group/nav fixed inset-x-0 top-0 z-[1030] nav-shell print:hidden"
        aria-label={labels.mainNavigation}
        data-scrolled={scrolled}
        data-tide={onCaseStudy ? "true" : undefined}
        onClick={handleClick}
      >
        <div className="nav-capsule container flex flex-wrap items-center justify-between lg:flex-nowrap">
          <div
            ref={progressRef}
            className={`nav-progress ${menuOpen ? "invisible" : ""}`}
            aria-hidden="true"
            // Progress always reads left to right, in Arabic too: it tracks
            // scroll depth, not text flow, so it is deliberately not mirrored.
            dir="ltr"
          >
            {sections.map((section) => (
              <i
                key={section.href}
                className="relative block h-full min-w-1.5 flex-1 overflow-hidden rounded-full bg-muted-text/25"
              >
                <b className="absolute inset-y-0 start-0 block w-0 rounded-full bg-linear-to-r from-note to-honey-hi"></b>
              </i>
            ))}
          </div>

          <SectionAnchor
            href="#hero"
            isHome={isHome}
            locale={locale}
            logo
            ariaLabel={labels.ariaHome}
            className="inline-flex min-h-11 items-center gap-2 font-mono text-base font-semibold text-dark-text no-underline transition-colors duration-200 hover:text-secondary"
          >
            <Mark className="size-[22px] text-note" />
            <span>basem.esam</span>
          </SectionAnchor>

          <button
            type="button"
            onClick={openPalette}
            aria-label={palette.trigger}
            className={`${mobilePaletteButton} lg:hidden`}
          >
            <Icon name="search" className="size-4" />
          </button>

          <button
            type="button"
            className="nav-mobile-btn nav-ctl ms-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md active:scale-95 lg:hidden"
            aria-controls="navbarNav"
            aria-expanded={menuOpen}
            aria-label={labels.toggleNavigation}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "x" : "menu"} className="size-5" />
          </button>

          <div
            className={`grid grow basis-full transition-[grid-template-rows,visibility] duration-300 ease-in-out lg:visible lg:flex lg:basis-auto lg:items-center ${
              menuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
            }`}
            id="navbarNav"
          >
            <div className="min-h-0 max-lg:max-h-[calc(100dvh-5rem)] max-lg:[scrollbar-width:none] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:pb-[env(safe-area-inset-bottom)] lg:ms-auto lg:overflow-visible max-lg:[&::-webkit-scrollbar]:hidden">
              <div className="mt-3 border-t border-hairline px-2.5 pt-3 pb-3 lg:hidden">
                <div className="flex flex-col rounded-2xl border border-hairline nav-menu-panel p-3">
                  <div className="flex flex-col">
                    {sections.map((section, index) => {
                      const active = activeId === section.href.slice(1);
                      return (
                        <SectionAnchor
                          key={section.href}
                          href={section.href}
                          isHome={isHome}
                          locale={locale}
                          active={active}
                          style={{ animationDelay: `${80 + index * 50}ms` }}
                          className={`${menuRow} ${active ? "is-active" : ""} ${
                            menuOpen ? "motion-safe:animate-menu-item-in" : ""
                          }`}
                        >
                          <span className="mn" dir="ltr">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="t">{labels[section.labelKey]}</span>
                          <Icon name="arrowRight" className="go rtl:rotate-180" />
                        </SectionAnchor>
                      );
                    })}
                  </div>

                  <div
                    className="menu-tiles"
                    style={{ animationDelay: `${80 + sections.length * 50}ms` }}
                  >
                    <Link href={linksHref} className="menu-tile menu-tile-links">
                      <span className="mn" dir="ltr">
                        /links
                      </span>
                      <b>{labels.allLinks}</b>
                      <Icon name="externalLink" className="i" />
                    </Link>
                    <a href={CV_PATH} download className="menu-tile">
                      <span className="mn" dir="ltr">
                        PDF
                      </span>
                      <b>{labels.resume}</b>
                      <Icon name="fileDown" className="i" />
                    </a>
                  </div>

                  <div
                    className="menu-foot"
                    style={{ animationDelay: `${80 + (sections.length + 1) * 50}ms` }}
                  >
                    <a href={PHONE_TEL} dir="ltr" className="menu-phone">
                      <Icon name="phone" className="size-5" />
                      {PHONE_DISPLAY}
                    </a>

                    <div className="menu-util">
                      <LanguageSwitcher {...languageSwitch} />
                      <ThemeToggle
                        id="darkModeToggleMobile"
                        labels={theme}
                        className={menuThemeButton}
                        iconClassName="size-4"
                      />
                      <span className="menu-soc">
                        <a
                          href={GITHUB_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={palette.items.github}
                        >
                          <Icon name="github" className="size-4" />
                        </a>
                        <a
                          href={LINKEDIN_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={palette.items.linkedin}
                        >
                          <Icon name="linkedIn" className="size-4" />
                        </a>
                        <a href={MAILTO} aria-label={palette.items.email}>
                          <Icon name="mail" className="size-4" />
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nav-links hidden lg:block" ref={barRef}>
                <span ref={indicatorRef} className="nav-ind" aria-hidden="true"></span>
                <ul className="flex list-none items-center">
                  {barSections.map((section, index) => {
                    const active = activeId === section.href.slice(1);
                    return (
                      <li key={section.href}>
                        <SectionAnchor
                          className={sectionLink(active)}
                          href={section.href}
                          isHome={isHome}
                          locale={locale}
                          active={active}
                          ind
                        >
                          <span className="nn" dir="ltr" aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {labels[section.labelKey]}
                        </SectionAnchor>
                      </li>
                    );
                  })}

                  {/* At xl the plain Contact link is replaced by the CTA below,
                      so exactly one visible link targets #contact at a time. */}
                  <li className="xl:hidden">
                    <SectionAnchor
                      className={sectionLink(activeId === "contact")}
                      href="#contact"
                      isHome={isHome}
                      locale={locale}
                      active={activeId === "contact"}
                      ind
                    >
                      <span className="nn" dir="ltr" aria-hidden="true">
                        05
                      </span>
                      {labels.contact}
                    </SectionAnchor>
                  </li>

                  {/* /links joins the bar at xl only; below that the utility
                      group carries it as an icon. */}
                  <li className="hidden xl:block">
                    <Link href={linksHref} className={sectionLink(false)} data-nav-ind>
                      <span className="nn" dir="ltr" aria-hidden="true">
                        ↗
                      </span>
                      {labels.links}
                    </Link>
                  </li>

                  <li className="ms-2">
                    <div className="nav-util flex items-center gap-2">
                      <button
                        type="button"
                        onClick={openPalette}
                        aria-label={palette.trigger}
                        className={`${paletteButton} group/palette`}
                      >
                        <Icon name="search" className="size-4" />
                        <span className="palette-word" aria-hidden="true">
                          {labels.search}
                        </span>
                        <span
                          className="font-mono text-xs max-xl:sr-only"
                          suppressHydrationWarning
                        >
                          {modKey} K
                        </span>
                      </button>
                      <Link href={linksHref} className={`${auxLinkBar} xl:hidden`}>
                        <Icon name="externalLink" className="size-4" />
                        <span className={auxLabel}>{labels.allLinks}</span>
                      </Link>
                      <LanguageSwitcher {...languageSwitch} className="nav-ctl nav-ctl-quiet" />
                      <ThemeToggle
                        id="darkModeToggle"
                        labels={theme}
                        className={themeButton}
                        iconClassName="size-5"
                      />
                      <SectionAnchor
                        href="#contact"
                        isHome={isHome}
                        locale={locale}
                        active={activeId === "contact"}
                        className={talkButton}
                      >
                        <span>{labels.letsTalk}</span>
                        <span className="nav-cta-ic" aria-hidden="true">
                          <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
                        </span>
                      </SectionAnchor>
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
