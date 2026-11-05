"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import type { PaletteDialogProps } from "./PaletteDialog";

/**
 * The palette's context and hotkey. The palette itself (items, dialog, CSS) is
 * in PaletteDialog.tsx and is loaded on demand, so it is not part of the
 * JavaScript every visitor downloads before the page can paint.
 *
 * It is fetched when the palette is first opened, and earlier when intent is
 * clear: hovering, focusing or touching an element marked
 * `data-palette-trigger`, or pressing Ctrl / Cmd (the start of Ctrl+K). In
 * practice the code is usually already there by the time it is needed.
 */

type PaletteLabels = Dictionary["palette"];
type NavLabels = Dictionary["nav"];

const PaletteContext = createContext<{ openPalette: () => void } | null>(null);

export function useCommandPalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used inside CommandPaletteProvider");
  }
  return context;
}

type DialogModule = typeof import("./PaletteDialog");

let dialogLoad: Promise<DialogModule> | null = null;

/** One shared request. A failed load is forgotten so the next attempt retries. */
function loadDialog(): Promise<DialogModule> {
  dialogLoad ??= import("./PaletteDialog").catch((error: unknown) => {
    dialogLoad = null;
    throw error;
  });
  return dialogLoad;
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
  const [Dialog, setDialog] = useState<ComponentType<PaletteDialogProps> | null>(null);
  // The dialog's open / close motion is a CSS transition, so it has to mount
  // closed, be painted once, and only then be told to open. Mounting it open
  // would make it appear with no motion at all.
  const [armed, setArmed] = useState(false);
  const openRef = useRef(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const context = useMemo(() => ({ openPalette }), [openPalette]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Fetch the dialog the first time the palette is wanted.
  useEffect(() => {
    if (!open || Dialog) return;
    let cancelled = false;
    loadDialog()
      .then((module) => {
        if (!cancelled) setDialog(() => module.default);
      })
      .catch(() => {
        // Offline or blocked: drop the request so a later try starts clean.
        if (!cancelled) setOpen(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, Dialog]);

  // Two frames after the dialog mounts closed, allow it to open.
  useEffect(() => {
    if (!Dialog || armed) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [Dialog, armed]);

  // Warm the download on intent, once, and mount the dialog (closed) as soon as
  // it arrives, so the real open has nothing left to wait for.
  useEffect(() => {
    const listen = { passive: true, capture: true } as const;
    const intents = ["pointerover", "focusin", "touchstart", "pointerdown"] as const;
    let alive = true;

    function stop() {
      for (const type of intents) document.removeEventListener(type, onIntent, listen);
      document.removeEventListener("keydown", onModifier, listen);
    }
    function warm() {
      stop();
      loadDialog()
        .then((module) => {
          if (alive) setDialog(() => module.default);
        })
        .catch(() => {
          // Retried on the real open.
        });
    }
    function onIntent(event: Event) {
      if (event.target instanceof Element && event.target.closest("[data-palette-trigger]")) {
        warm();
      }
    }
    function onModifier(event: globalThis.KeyboardEvent) {
      if (event.key === "Control" || event.key === "Meta") warm();
    }

    for (const type of intents) document.addEventListener(type, onIntent, listen);
    document.addEventListener("keydown", onModifier, listen);
    return () => {
      alive = false;
      stop();
    };
  }, []);

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
    <PaletteContext.Provider value={context}>
      {children}
      {Dialog ? (
        <Dialog
          open={open && armed}
          onClose={closePalette}
          labels={labels}
          nav={nav}
          locale={locale}
        />
      ) : null}
    </PaletteContext.Provider>
  );
}
