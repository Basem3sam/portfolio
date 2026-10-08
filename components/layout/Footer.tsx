import TerminalButton from "@/components/layout/TerminalButton";
import { getDictionary, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/data/site";

type FooterProps = {
  locale?: Locale;
};

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

const quickLinks = [
  { href: "#work", key: "work" },
  { href: "#stack", key: "stack" },
  { href: "#about", key: "about" },
  { href: "#contact", key: "contact" },
] as const;

const linkClass =
  "inline-flex min-h-11 items-center justify-center rounded-md px-3 font-mono text-sm text-light-text no-underline transition-colors duration-200 hover:text-signal";

export default function Footer({ locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);
  const host = new URL(SITE_URL).host;
  const buildLabel = commitSha ? `build ${commitSha.slice(0, 7)}` : "build dev";
  const nav = dict.nav;

  return (
    <footer className="w-full bg-light-bg print:bg-white">
      <div className="container pt-10 pb-24 md:pb-10">
        {/* Mobile: one centered column. Desktop: brand left, links right. */}
        <div className="flex flex-col items-center gap-x-10 gap-y-6 text-center md:flex-row md:items-end md:justify-between md:text-start">
          <div>
            <p className="flex items-center justify-center gap-2 font-mono text-base font-semibold text-dark-text md:justify-start">
              <span className="size-2 rounded-full bg-status" aria-hidden="true"></span>
              basem.esam
            </p>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-light-text">
              {dict.links.tagline}
            </p>
          </div>

          <nav
            aria-label={dict.nav.mainNavigation}
            className="grid w-full grid-cols-3 gap-1.5 sm:grid-cols-6 md:w-auto md:grid-cols-none md:flex md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2"
          >
            {quickLinks.map(({ href, key }) => (
              <a key={href} href={href} className={linkClass}>
                {nav[key]}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-8 font-mono text-sm text-muted-text">
          <span className="font-bold text-secondary">$</span> session end — thanks for visiting
          <span
            className="ms-1 inline-block h-3.5 w-2 animate-pulse bg-secondary align-middle motion-reduce:animate-none"
            aria-hidden="true"
          ></span>
        </p>

        <div className="mt-4 flex flex-col items-center gap-3 border-t border-hairline pt-6 md:flex-row md:justify-between">
          <p className="order-2 text-sm text-light-text md:order-1">
            &copy; {new Date().getFullYear()} Basem Esam. {dict.footer.rights}
          </p>
          <div className="order-1 flex items-center gap-3 md:order-2">
            <TerminalButton label={dict.footer.openTerminal} />
            <p className="font-mono text-xs text-muted-text">
              {host} · {buildLabel}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}