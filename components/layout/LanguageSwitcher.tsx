import Link from 'next/link';
import Icon from '@/components/ui/Icon';

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
  className = '',
}: LanguageSwitcherProps) {
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface/50 px-3 text-sm font-medium text-light-text no-underline transition-colors duration-200 hover:border-secondary hover:text-secondary ${className}`}
    >
      <Icon name="globe" className="size-4" />
      <span>{label}</span>
    </Link>
  );
}
