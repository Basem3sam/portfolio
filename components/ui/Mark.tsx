type MarkProps = {
  className?: string;
  /** Sets an accessible name; otherwise the mark is decorative. */
  title?: string;
};

/**
 * The brand mark: a terminal prompt chevron with a short bar, taken from the
 * mockup's `#i-mark` symbol (`M6 6l7 6-7 6` + `M14.5 19H20`).
 *
 * It inherits `currentColor` and the base `svg.i` stroke settings from
 * globals.css, so callers only size it and colour it.
 */
export default function Mark({ className = "size-[22px]", title }: MarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M6 6l7 6-7 6" />
      <path d="M14.5 19H20" />
    </svg>
  );
}
