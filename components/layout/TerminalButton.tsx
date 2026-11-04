"use client";

import Icon from "@/components/ui/Icon";

const OPEN_TERMINAL_EVENT = "open-secret-terminal";

type TerminalButtonProps = {
  label: string;
  /** Extra classes; the footer passes its circular glyph treatment. */
  className?: string;
};

export default function TerminalButton({ label, className = "" }: TerminalButtonProps) {
  return (
    <button
      type="button"
      className={`flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-text transition-colors duration-200 hover:text-signal print:hidden ${className}`}
      aria-label={label}
      title={label}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT))}
    >
      <Icon name="terminal" className="size-4" />
    </button>
  );
}
