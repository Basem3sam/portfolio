"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeAnchorHref } from "@/lib/scroll";
import type { Locale } from "@/lib/i18n";

type SectionLinkProps = {
  /** Raw section hash, e.g. `#work`. */
  hash: string;
  locale: Locale;
  className?: string;
  children: React.ReactNode;
};

/**
 * A link to a home-page section, rendered from anywhere.
 *
 * Same rule as the navbar's anchors: on the home route it is a plain
 * `<a href="#…">` so ScrollManager keeps smooth scroll, focus and history;
 * off the home route it becomes a route link to `/#…`, which ScrollManager
 * resolves once the destination has mounted. Without that prefix the hash
 * would resolve against the current page, where the section does not exist.
 */
export default function SectionLink({ hash, locale, className, children }: SectionLinkProps) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === `/${locale}`;

  if (isHome) {
    return (
      <a href={hash} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={homeAnchorHref(locale, hash)} className={className}>
      {children}
    </Link>
  );
}
