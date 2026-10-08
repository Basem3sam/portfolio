import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

type LinkCardProps = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  external?: boolean;
  download?: boolean;
};

const card =
  "group flex items-center gap-4 rounded-lg border border-hairline bg-surface p-4 no-underline transition-colors duration-200 hover:border-secondary md:p-5";

export default function LinkCard({
  href,
  icon,
  title,
  description,
  external,
  download,
}: LinkCardProps) {
  const content = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-hairline text-light-text transition-colors duration-200 group-hover:text-secondary">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-dark-text">{title}</span>
        <span className="block truncate text-sm text-light-text">{description}</span>
      </span>
      <Icon
        name="arrowRight"
        className="size-5 shrink-0 text-muted-text transition-colors duration-200 group-hover:text-secondary rtl:rotate-180"
      />
    </>
  );

  if (href.startsWith("/") && !download) {
    return (
      <Link href={href} className={card}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={card}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download}
    >
      {content}
    </a>
  );
}