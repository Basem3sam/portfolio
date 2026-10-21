import Link from "next/link";
import Icon from "@/components/ui/Icon";

type LanguageSwitcherProps = {
  href: string;
  hrefLang: string;
  label: string;
  className?: string;
};

export default function LanguageSwitcher({
  href,
  hrefLang,
  label,
  className = "",
}: LanguageSwitcherProps) {
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium no-underline ${className || "lang-ctl"}`}
    >
      <Icon name="globe" className="size-4" />
      <span>{label}</span>
    </Link>
  );
}
