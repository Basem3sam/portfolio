"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { CV_PATH, GITHUB_URL, LINKEDIN_URL, MAILTO } from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { toggleTheme } from "@/lib/theme";

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

const PaletteContext = createContext<{ openPalette: () => void } | null>(null);

export function useCommandPalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  }
  return context;
}

function buildItems(palette: PaletteLabels, nav: NavLabels, locale: Locale): PaletteItem[] {
  const linksHref = locale === "ar" ? "/ar/links" : "/links";
  const languageHref = locale === "ar" ? "/" : "/ar";

  return [
    { id: "stack", label: nav.stack, group: "navigate", icon: "arrowRight", href: "#stack" },
    { id: "about", label: nav.about, group: "navigate", icon: "arrowRight", href: "#about" },
    {
      id: "experience",
      label: nav.experience,
      group: "navigate",
      icon: "arrowRight",
      href: "#experience",
    },
    {
      id: "education",
      label: nav.education,
      group: "navigate",
      icon: "arrowRight",
      href: "#education",
    },
    {
      id: "projects",
      label: nav.projects,
      group: "navigate",
      icon: "arrowRight",
      href: "#projects",
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

function PaletteDialog({
  open,
  onClose,
  items,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  items: PaletteItem[];
  labels: PaletteLabels;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLElement | null)[]>([]);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.label} ${item.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  useEffect(() => {
    if (open) {
      restoreFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setQuery("");
      setActive(0);
      lockScroll();
      const frame = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }

    unlockScroll();
    restoreFocus.current?.focus?.();
    restoreFocus.current = null;
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const activate = (index: number) => {
    const item = filtered[index];
    if (!item) return;

    onClose();
    if (item.action) {
      item.action();
      return;
    }
    optionRefs.current[index]?.click();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
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
      onClose();
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
      index === active ? "bg-light-bg text-dark-text" : "text-light-text"
    }`;

  return (
    <div
      className={`fixed inset-0 z-[1080] flex items-start justify-center p-4 pt-[10vh] ${open ? "" : "pointer-events-none"}`}
      inert={!open}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.ariaLabel}
        onKeyDown={handleDialogKeyDown}
        className={`relative mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-xl transition duration-200 motion-reduce:transition-none ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-2 scale-[0.98] opacity-0"
        }`}
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
            onClick={onClose}
            aria-label={labels.close}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-light-text transition-colors duration-200 hover:text-dark-text"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="max-h-[min(50vh,400px)] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-light-text">{labels.empty}</p>
          ) : (
            <ul role="listbox" id={listId} aria-label={labels.ariaLabel} className="flex flex-col gap-0.5">
              {filtered.map((item, index) => {
                const showHeader = index === 0 || filtered[index - 1].group !== item.group;
                const iconClass =
                  item.icon === "arrowRight" ? "size-4 shrink-0 rtl:rotate-180" : "size-4 shrink-0";

                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={index === active}
                    id={`${listId}-${item.id}`}
                    onMouseEnter={() => setActive(index)}
                  >
                    {showHeader && (
                      <p className="px-3 pt-2 pb-1 font-mono text-[11px] font-medium tracking-wide text-muted-text uppercase">
                        {labels.groups[item.group]}
                      </p>
                    )}
                    {item.href ? (
                      item.href.startsWith("#") ||
                      item.download ||
                      item.external ||
                      item.href.startsWith("mailto") ? (
                        <a
                          ref={(element) => {
                            optionRefs.current[index] = element;
                          }}
                          href={item.href}
                          download={item.download || undefined}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          className={optionClass(index)}
                          onClick={() => onClose()}
                        >
                          <Icon name={item.icon} className={iconClass} />
                          <span className="flex-1">{item.label}</span>
                        </a>
                      ) : (
                        <Link
                          ref={(element) => {
                            optionRefs.current[index] = element;
                          }}
                          href={item.href}
                          className={optionClass(index)}
                          onClick={() => onClose()}
                        >
                          <Icon name={item.icon} className={iconClass} />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      )
                    ) : (
                      <button
                        ref={(element) => {
                          optionRefs.current[index] = element;
                        }}
                        type="button"
                        className={optionClass(index)}
                        onClick={() => {
                          onClose();
                          item.action?.();
                        }}
                      >
                        <Icon name={item.icon} className={iconClass} />
                        <span className="flex-1">{item.label}</span>
                      </button>
                    )}
                  </li>
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

type CommandPaletteProviderProps = {
  labels: PaletteLabels;
  nav: NavLabels;
  locale: Locale;
  children: ReactNode;
};

export default function CommandPaletteProvider({
  labels,
  nav,
  locale,
  children,
}: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const items = useMemo(() => buildItems(labels, nav, locale), [labels, nav, locale]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!event.metaKey && !event.ctrlKey) return;
      if (event.shiftKey || event.altKey) return;
      if (event.key.toLowerCase() !== "k") return;

      const target = event.target;
      const inField =
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable);

      if (inField && !openRef.current) return;

      event.preventDefault();
      setOpen((value) => !value);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PaletteContext.Provider value={{ openPalette: () => setOpen(true) }}>
      {children}
      <PaletteDialog open={open} onClose={() => setOpen(false)} items={items} labels={labels} />
    </PaletteContext.Provider>
  );
}