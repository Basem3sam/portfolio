import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

type LinkCardProps = {
  href: string;
  icon: IconName;
  title: string;
  /** Row subcopy under the title (mockup `<small>`). */
  description?: string;
  /** Mono contact value (phone / email) instead of the description. */
  value?: string;
  /** Icon in the trailing circle: arrow for internal, ext/download otherwise. */
  trailing: IconName;
  external?: boolean;
  download?: boolean;
  /** The one primary row (Portfolio website): signal border and wash. */
  primary?: boolean;
};

/**
 * One grouped link row on /links (mockup `.lk`, lines 2822–2832): icon tile,
 * title + subcopy (or a mono contact value), trailing circle. Hover and
 * focus-visible share the same states (edge bar, tile fill, circle fill);
 * the markup mirrors the reference and stays readable to assistive tech —
 * both icon slots are decorative and hidden from it.
 */
export default function LinkCard({
  href,
  icon,
  title,
  description,
  value,
  trailing,
  external,
  download,
  primary,
}: LinkCardProps) {
  const content = (
    <>
      <span className="ico" aria-hidden="true">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="txt">
        <b>{title}</b>
        {value ? (
          <span className="val">{value}</span>
        ) : (
          <small className="sub">{description}</small>
        )}
      </span>
      <span className="go" aria-hidden="true">
        <Icon name={trailing} className="size-4" />
      </span>
    </>
  );

  const className = primary ? "lk primary" : "lk";

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  if (download) {
    return (
      <a href={href} className={className} download>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
