import type { CSSProperties } from "react";
import Link from "next/link";
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
  index?: number;
};

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
          <span className="val">{value}</span>
        ) : (
          <small className="sub">{description}</small>
        )}
      </span>
      <span className="go" aria-hidden="true">
        <Icon
          name={trailing}
          className={trailing === "arrowRight" ? "size-4 rtl:-scale-x-100" : "size-4"}
        />
      </span>
    </>
  );

  const shared = {
    className: primary ? "lk primary" : "lk",
    "data-trailing": trailing,
    style: { "--stagger-index": index } as CSSProperties,
  };

  if (external) {
    return (
      <a href={href} {...shared} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  if (download || !href.startsWith("/")) {
    return (
      <a href={href} {...shared} download={download || undefined}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} {...shared}>
      {content}
    </Link>
  );
}
