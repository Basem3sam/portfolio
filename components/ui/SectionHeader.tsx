import SectionTitle from "./SectionTitle";

type SectionHeaderProps = {
  /** Two-digit section index shown above the title, e.g. "01". */
  number: string;
  title: string;
  /** Optional lead line under the title (max 60ch). */
  lead?: string;
  /**
   * Optional id for the heading, so a wrapping section can point
   * `aria-labelledby` at it.
   */
  headingId?: string;
};

/**
 * Section header: mono index + hairline rule, then the title with its
 * hand-drawn underline (the `.sh` primitives in globals.css). The index is
 * decorative, so the top row is hidden from assistive tech; the h2 carries
 * the section's accessible name.
 */
export default function SectionHeader({
  number,
  title,
  lead,
  headingId,
}: SectionHeaderProps) {
  return (
    <div className="sh" data-reveal>
      <div className="sh-top" aria-hidden="true">
        <span className="idx" dir="ltr">
          {number}
        </span>
        <span className="rule"></span>
      </div>
      <SectionTitle id={headingId}>{title}</SectionTitle>
      {lead ? <p>{lead}</p> : null}
    </div>
  );
}
