"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import TideCanvas from "@/components/sections/TideCanvas";
import "@/components/easter-egg/Egg.css";

type OverlayShellProps = {
  /** The mono eyebrow in the card header (mockup `.egk`, "Restricted"). */
  chip: string;
  /** Accessible name for the dialog. */
  title: string;
  visible: boolean;
  containerVisible: boolean;
  onClose: () => void;
  closeLabel: string;
  /** Extra class for card variants (`.master`, `.good`, `.bad`). */
  cardClassName?: string;
  /** Paint the tide behind the card (the prompt and keypad overlays). */
  tide?: boolean;
  /** Extra header controls, before the close button (sound toggle). */
  headerActions?: ReactNode;
  children: ReactNode;
};

/**
 * The shared shell behind every easter-egg overlay: a fixed backdrop (the
 * tide, dimmed) holding one calm glass card. Behaviour from the mockup's
 * spec page: Esc closes, focus is trapped inside the card while it is open
 * and returns to the opener on close, clicking the backdrop closes.
 */
export default function OverlayShell({
  chip,
  title,
  visible,
  containerVisible,
  onClose,
  closeLabel,
  cardClassName,
  tide,
  headerActions,
  children,
}: OverlayShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Remember the opener once, on mount: focus moves into the card so the
  // keyboard starts inside the dialog.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();
    return () => restoreRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!containerVisible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Focus trap: the card has no other focusable surfaces than the ones
      // it renders, so cycling within it is enough.
      const focusable = cardRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === cardRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [containerVisible, onClose]);

  if (!containerVisible) return null;

  return (
    <div dir="ltr" className="egg">
      <div
        className={`eov${tide ? " tide" : " dim"}${visible ? " show" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        {tide && <TideCanvas />}
        <div
          ref={cardRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`egc${cardClassName ? ` ${cardClassName}` : ""}`}
        >
          <div className="egh">
            <span className="egk">{chip}</span>
            <span className="egh-actions">
              {headerActions}
              <button type="button" className="egx" aria-label={closeLabel} onClick={onClose}>
                <Icon name="x" className="i" />
              </button>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
