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

export default function Footer({ locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);
  const host = new URL(SITE_URL).host;
  const buildLabel = commitSha ? `build ${commitSha.slice(0, 7)}` : "build dev";
  const nav = dict.nav;

  return (
    <footer className="w-full bg-light-bg print:bg-white">
      <div className="container pt-10 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <p className="flex items-center gap-2 font-mono text-base font-semibold text-dark-text">
              <span className="size-2 rounded-full bg-status" aria-hidden="true"></span>
              basem.esam
            </p>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-light-text">
              {dict.links.tagline}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {quickLinks.map(({ href, key }) => (
              <a
                key={href}
                href={href}
                className="font-mono text-sm text-light-text no-underline transition-colors duration-200 hover:text-signal"
              >
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

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-hairline pt-6">
          <p className="text-sm text-light-text">
            &copy; {new Date().getFullYear()} Basem Esam. {dict.footer.rights}
          </p>
          <div className="flex items-center gap-4">
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