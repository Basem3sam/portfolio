import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import CopyButton from "@/components/links/CopyButton";
import Icon, { type IconName } from "@/components/ui/Icon";

type LinkCardProps = {
  href: string;
  icon: IconName;
  title: string;
  description?: string;
  value?: string;
  trailing: IconName;
  external?: boolean;
  download?: boolean;
  primary?: boolean;
  /** A larger, square-ish card for the grid layout instead of a ruled row. */
  tile?: boolean;
  /** Where it goes (a host, or a file type), shown as a small mono chip. */
  host?: string;
  /** Adds a copy-to-clipboard button beside the row's arrow. */
  copy?: { value: string; label: string; tip: string; done: string };
  index?: number;
};

/**
 * Lets an email address wrap before the "@" (a clean "name" / "@domain" break)
 * instead of mid-domain ("...@gmail." / "com") when the column is narrow.
 */
function breakable(value: string): ReactNode {
  const at = value.indexOf("@");
  if (at < 1) return value;
  return (
    <>
      {value.slice(0, at)}
      <wbr />
      {value.slice(at)}
    </>
  );
}

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
  tile,
  host,
  copy,
  index = 0,
}: LinkCardProps) {
  const content = (
    <>
      <span className="ico" aria-hidden="true">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="txt">
        <b>{title}</b>
        {value ? (
          <span className="val">{breakable(value)}</span>
        ) : (
          <small className="sub">{description}</small>
        )}
      </span>
      {host && (
        <span className="host" dir="ltr" aria-hidden="true">
          {host}
        </span>
      )}
      <span className="go" aria-hidden="true">
        <Icon
          name={trailing}
          className={trailing === "arrowRight" ? "size-4 rtl:-scale-x-100" : "size-4"}
        />
      </span>
      {/* A large, faint copy of the icon in the tile's corner, for depth. */}
      {tile && <Icon name={icon} className="wm" strokeWidth={1.1} />}
    </>
  );

  const shared = {
    className: primary ? "lk primary" : tile ? "lk lk--tile" : "lk",
    "data-trailing": trailing,
    "data-has-copy": copy ? "true" : undefined,
  };

  let anchor;
  if (external) {
    anchor = (
      <a href={href} {...shared} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  } else if (download || !href.startsWith("/")) {
    anchor = (
      <a href={href} {...shared} download={download || undefined}>
        {content}
      </a>
    );
  } else {
    anchor = (
      <Link href={href} {...shared}>
        {content}
      </Link>
    );
  }

  // The wrapper owns the stagger index and the hairline under the row, and is
  // what the hover state is read from, so the wash stays on while the pointer
  // is over the copy button.
  return (
    <div
      className={primary ? "lk-row lk-row--primary" : tile ? "lk-row lk-row--tile" : "lk-row"}
      style={{ "--stagger-index": index } as CSSProperties}
    >
      {anchor}
      {copy && (
        <CopyButton value={copy.value} label={copy.label} tip={copy.tip} doneLabel={copy.done} />
      )}
    </div>
  );
}
