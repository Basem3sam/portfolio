"use client";

/**
 * The palette itself: its items, the dialog markup and its stylesheet.
 *
 * Kept apart from the provider in CommandPalette.tsx so none of this ships in
 * the page's own JavaScript. The provider loads this file the first time the
 * palette is wanted (and a little earlier, when someone reaches for a trigger
 * or presses Ctrl / Cmd).
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { CV_PATH, GITHUB_URL, LINKEDIN_URL, MAILTO } from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import { isHomePath, switchLocalePath, type Locale } from "@/lib/i18n";
import { homeAnchorHref } from "@/lib/scroll";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { toggleTheme } from "@/lib/theme";
import "./CommandPalette.css";

type PaletteLabels = Dictionary["palette"];
type NavLabels = Dictionary["nav"];
type PaletteGroup = "navigate" | "actions" | "connect";

type PaletteItem = {
  id: string;
  label: string;
  group: PaletteGroup;
  icon: IconName;
  href?: string;
  external?: boolean;
  download?: boolean;
  action?: () => void;
  keywords?: string;
};

function buildItems(
  palette: PaletteLabels,
  nav: NavLabels,
  locale: Locale,
  pathname: string,
): PaletteItem[] {
  const linksHref = locale === "ar" ? "/ar/links" : "/links";
  // The same page in the other language, not the other language's home.
  const languageHref = switchLocalePath(pathname, locale);

  return [
    // Off home there was no way to ask for "home" at all: every entry below
    // is a section of it. A real route link, so the URL stays clean.
    ...(isHomePath(pathname, locale)
      ? []
      : [
          {
            id: "home",
            label: nav.homeLabel,
            group: "navigate" as const,
            icon: "arrowLeft" as const,
            href: homeAnchorHref(locale, ""),
            keywords: "home top start main basem",
          },
        ]),
    { id: "work", label: nav.work, group: "navigate", icon: "arrowRight", href: "#work" },
    { id: "stack", label: nav.stack, group: "navigate", icon: "arrowRight", href: "#stack" },
    { id: "about", label: nav.about, group: "navigate", icon: "arrowRight", href: "#about" },
    {
      id: "experience",
      label: nav.experience,
      group: "navigate",
      icon: "arrowRight",
      href: "#experience",
    },
    { id: "contact", label: nav.contact, group: "navigate", icon: "arrowRight", href: "#contact" },
    { id: "links", label: nav.allLinks, group: "navigate", icon: "externalLink", href: linksHref },
    {
      id: "theme",
      label: palette.items.theme,
      group: "actions",
      icon: "moon",
      action: () => toggleTheme(),
      keywords: "dark light appearance mode",
    },
    {
      id: "terminal",
      label: palette.items.terminal,
      group: "actions",
      icon: "terminal",
      action: () => window.dispatchEvent(new CustomEvent("open-secret-terminal")),
      keywords: "secret hidden konami easter egg game",
    },
    {
      id: "language",
      label: locale === "en" ? palette.items.languageToAr : palette.items.languageToEn,
      group: "actions",
      icon: "globe",
      href: languageHref,
      keywords: "english arabic locale",
    },
    {
      id: "cv",
      label: palette.items.cv,
      group: "actions",
      icon: "fileDown",
      href: CV_PATH,
      download: true,
    },
    { id: "email", label: palette.items.email, group: "connect", icon: "mail", href: MAILTO },
    {
      id: "github",
      label: palette.items.github,
      group: "connect",
      icon: "github",
      href: GITHUB_URL,
      external: true,
    },
    {
      id: "linkedin",
      label: palette.items.linkedin,
      group: "connect",
      icon: "linkedIn",
      href: LINKEDIN_URL,
      external: true,
    },
  ];
}

export type PaletteDialogProps = {
  open: boolean;
  onClose: () => void;
  labels: PaletteLabels;
  nav: NavLabels;
  locale: Locale;
};

export default function PaletteDialog({ open, onClose, labels, nav, locale }: PaletteDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const items = useMemo(
    () => buildItems(labels, nav, locale, pathname),
    [labels, nav, locale, pathname],
  );
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLElement | null)[]>([]);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  // The search text is cleared after the panel has finished leaving (see the
  // effect below), not here. Clearing it at the start of the exit swapped the
  // filtered list for the full one while the panel was still on screen, so the
  // panel visibly jumped in height as it faded.
  const handleClose = () => onClose();

  useEffect(() => {
    if (open) {
      restoreFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lockScroll();
      inputRef.current?.focus({ preventScroll: true });
      const frame = requestAnimationFrame(() => {
        if (document.activeElement !== inputRef.current) {
          inputRef.current?.focus({ preventScroll: true });
        }
      });
      return () => cancelAnimationFrame(frame);
    }

    unlockScroll();
    // preventScroll: giving focus back must not scroll the page to the button.
    restoreFocus.current?.focus?.({ preventScroll: true });
    restoreFocus.current = null;

    // Reset once the exit animation (180ms) is done. Opening again before then
    // runs this cleanup and keeps what was typed.
    const reset = window.setTimeout(() => {
      setQuery("");
      setActive(0);
    }, 260);
    return () => window.clearTimeout(reset);
  }, [open]);

  // Keep the panel inside the part of the screen that is actually visible. An
  // on-screen keyboard shrinks the visual viewport without resizing the layout
  // viewport, so a fixed panel kept its full-height list and the bottom of it
  // sat behind the keyboard (iOS also scrolls the viewport to the focused
  // field). The values feed --cp-top / --cp-vh in the stylesheet.
  useEffect(() => {
    const root = rootRef.current;
    const viewport = window.visualViewport;
    if (!open || !root || !viewport) return;

    let frame = 0;
    const sync = () => {
      frame = 0;
      root.style.setProperty("--cp-top", `${viewport.offsetTop}px`);
      root.style.setProperty("--cp-vh", `${viewport.height}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    sync();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    return () => {
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--cp-top");
      root.style.removeProperty("--cp-vh");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const activate = (index: number) => {
    const item = filtered[index];
    if (!item) return;

    handleClose();
    if (item.action) {
      item.action();
      return;
    }
    optionRefs.current[index]?.click();
  };

  const handleHashLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    if (document.querySelector(href)) return;

    event.preventDefault();
    // A bare `#…` would resolve against the current page, so English was
    // landing on `/work/trosc#work` with no such element. Always target home.
    router.push(homeAnchorHref(locale, href));
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(filtered.length - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      activate(active);
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      if (document.activeElement === closeRef.current) {
        inputRef.current?.focus();
      } else {
        closeRef.current?.focus();
      }
    }
  };

  const optionClass = (index: number) =>
    `flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-start text-sm transition-colors duration-100 cursor-pointer ${
      index === active
        ? "bg-light-bg text-dark-text shadow-[inset_2px_0_0_0_var(--c-signal)]"
        : "text-light-text"
    }`;

  return (
    <div
      ref={rootRef}
      className={`cp-root fixed inset-0 z-[1080] flex items-start justify-center print:hidden ${open ? "" : "pointer-events-none"}`}
      data-open={open ? "" : undefined}
      inert={!open}
    >
      <div
        className="cp-backdrop absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      ></div>
      <div
        role="dialog"
        data-lenis-prevent
        aria-modal="true"
        aria-label={labels.ariaLabel}
        onKeyDown={handleDialogKeyDown}
        className="cp-panel relative mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-hairline px-4">
          <Icon name="search" className="size-4 shrink-0 text-muted-text" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={
              filtered[active] ? `${listId}-${filtered[active].id}` : undefined
            }
            aria-label={labels.ariaLabel}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={labels.placeholder}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-dark-text outline-none placeholder:text-muted-text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label={labels.close}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-light-text transition-colors duration-200 hover:text-dark-text"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="cp-list overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-light-text">{labels.empty}</p>
          ) : (
            <ul
              role="listbox"
              id={listId}
              aria-label={labels.ariaLabel}
              className="flex flex-col gap-0.5"
            >
              {filtered.map((item, index) => {
                const showHeader = index === 0 || filtered[index - 1].group !== item.group;
                const iconClass =
                  item.icon === "arrowRight" ? "size-4 shrink-0 rtl:rotate-180" : "size-4 shrink-0";

                return (
                  <Fragment key={item.id}>
                    {showHeader && (
                      <li
                        role="presentation"
                        className="px-3 pt-2 pb-1 font-mono text-[11px] font-medium tracking-wide text-muted-text uppercase"
                      >
                        {labels.groups[item.group]}
                      </li>
                    )}
                    <li
                      role="presentation"
                      className="cp-item"
                      style={{ "--i": index } as CSSProperties}
                      onMouseEnter={() => setActive(index)}
                    >
                      {item.href ? (
                        item.href.startsWith("#") ||
                        item.download ||
                        item.external ||
                        item.href.startsWith("mailto") ? (
                          <a
                            id={`${listId}-${item.id}`}
                            role="option"
                            aria-selected={index === active}
                            ref={(element) => {
                              optionRefs.current[index] = element;
                            }}
                            href={item.href}
                            download={item.download || undefined}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className={optionClass(index)}
                            onClick={(event) => {
                              if (item.href) handleHashLinkClick(event, item.href);
                              handleClose();
                            }}
                          >
                            <Icon name={item.icon} className={iconClass} />
                            <span className="flex-1">{item.label}</span>
                          </a>
                        ) : (
                          <Link
                            id={`${listId}-${item.id}`}
                            role="option"
                            aria-selected={index === active}
                            ref={(element) => {
                              optionRefs.current[index] = element;
                            }}
                            href={item.href}
                            className={optionClass(index)}
                            onClick={() => handleClose()}
                          >
                            <Icon name={item.icon} className={iconClass} />
                            <span className="flex-1">{item.label}</span>
                          </Link>
                        )
                      ) : (
                        <button
                          id={`${listId}-${item.id}`}
                          role="option"
                          aria-selected={index === active}
                          ref={(element) => {
                            optionRefs.current[index] = element;
                          }}
                          type="button"
                          className={optionClass(index)}
                          onClick={() => {
                            handleClose();
                            item.action?.();
                          }}
                        >
                          <Icon name={item.icon} className={iconClass} />
                          <span className="flex-1">{item.label}</span>
                        </button>
                      )}
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-hairline px-4 py-2">
          <p className="text-xs text-muted-text">{labels.hint}</p>
        </div>
      </div>
    </div>
  );
}
