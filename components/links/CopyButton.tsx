"use client";

import { useEffect, useRef, useState } from "react";

type CopyButtonProps = {
  /** The text that lands on the clipboard. */
  value: string;
  /** Accessible name, e.g. "Copy email address". */
  label: string;
  /** Tooltip before copying ("Copy") and after ("Copied"). */
  tip: string;
  doneLabel: string;
};

/**
 * `navigator.clipboard` needs a secure context and a user gesture; the
 * textarea fallback covers older browsers and non-HTTPS previews. Resolves to
 * whether anything was actually copied, so the button only claims success when
 * it is true.
 */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Copy-to-clipboard for a ledger row. It is a sibling of the row's link, not a
 * child: a button inside an anchor is invalid, and keeping them separate means
 * the row still opens the mail or phone app when you click anywhere else.
 */
export default function CopyButton({ value, label, tip, doneLabel }: CopyButtonProps) {
  const [done, setDone] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    if (!(await writeClipboard(value))) return;
    setDone(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDone(false), 1800);
  };

  // The live region is a sibling, not a child: a button's children are
  // presentational for assistive tech, so a status inside it is never announced.
  return (
    <>
      <button
        type="button"
        className="lk-copy"
        data-state={done ? "done" : "idle"}
        aria-label={label}
        onClick={copy}
      >
        <svg
          className="ci"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="13" height="13" x="9" y="9" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          className="ck"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span className="tip" aria-hidden="true">
          {done ? doneLabel : tip}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {done ? doneLabel : ""}
      </span>
    </>
  );
}
