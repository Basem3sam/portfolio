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
  "inline-flex min-h-11 items-center justify-center rounded-md px-3 font-mono text-sm text-light-text no-underline transition-colors duration-200 hover:text-signal max-md:border max-md:border-hairline max-md:bg-surface max-md:active:bg-light-bg";

export default function Footer({ locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);
  const host = new URL(SITE_URL).host;
  const buildLabel = commitSha ? `build ${commitSha.slice(0, 7)}` : "build dev";
  const nav = dict.nav;

  return (
    <footer className="w-full bg-light-bg print:bg-white">
      <div className="container pt-12 pb-24 md:pt-10 md:pb-10">
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
            aria-label={dict.footer.navLabel}
            className="grid w-full max-w-sm grid-cols-2 gap-2 sm:max-w-none sm:grid-cols-4 md:flex md:w-auto md:grid-cols-none md:flex-wrap md:items-center md:gap-x-6 md:gap-y-2"
          >
            {quickLinks.map(({ href, key }) => (
              <a key={href} href={href} className={linkClass}>
                {nav[key]}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-10 text-center font-mono text-sm text-muted-text md:mt-8 md:text-start">
          <span className="font-bold text-secondary">$</span> session end — thanks for visiting
          <span
            className="ms-1 inline-block h-3.5 w-2 animate-pulse bg-secondary align-middle motion-reduce:animate-none"
            aria-hidden="true"
          ></span>
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-hairline pt-6 text-center md:mt-4 md:flex-row md:justify-between md:text-start">
          <p className="order-2 text-sm text-light-text md:order-1">
            &copy; {new Date().getFullYear()} Basem Esam. {dict.footer.rights}
          </p>
          <div className="order-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:order-2">
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
