import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

type LinkCardProps = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  external?: boolean;
  download?: boolean;
  index?: number;
  ltr?: boolean;
};

const card =
  "group relative flex items-center gap-4 rounded-lg border border-hairline bg-surface p-4 no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:border-signal focus-visible:shadow-md motion-safe:animate-hero-in md:p-5";

export default function LinkCard({
  href,
  icon,
  title,
  description,
  external,
  download,
  index = 0,
  ltr = false,
}: LinkCardProps) {
  const style = { animationDelay: `${index * 70}ms` };

  const content = (
    <>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-hairline bg-light-bg text-light-text transition-colors duration-200 group-hover:border-signal group-hover:text-signal">
        <Icon name={icon} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-dark-text">{title}</span>
        <span
          className="block truncate text-sm text-light-text"
          dir={ltr ? "ltr" : undefined}
        >
          {description}
        </span>
      </span>
      <Icon
        name="arrowRight"
        className="size-5 shrink-0 text-muted-text transition-all duration-200 group-hover:translate-x-1 group-hover:text-signal rtl:rotate-180 rtl:group-hover:-translate-x-1"
      />
    </>
  );

  if (href.startsWith("/") && !download) {
    return (
      <Link href={href} className={card} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={card}
      style={style}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      download={download}
    >
      {content}
    </a>
  );
}