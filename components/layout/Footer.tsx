import TerminalButton from "@/components/layout/TerminalButton";
import { getDictionary, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/data/site";

type FooterProps = {
  locale?: Locale;
};

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

export default function Footer({ locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);
  const host = new URL(SITE_URL).host;
  const buildLabel = commitSha ? `build ${commitSha.slice(0, 7)}` : "build dev";

  return (
    <footer className="w-full bg-light-bg pt-10 pb-8 print:bg-white">
      <div className="container flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-0.5 w-10 rounded-full bg-secondary"></span>
          <span className="h-0.5 w-2.5 rounded-full bg-signal"></span>
          <span className="h-0.5 w-10 rounded-full bg-secondary"></span>
        </div>

        <p className="text-sm text-light-text">
          &copy; {new Date().getFullYear()} Basem Esam. {dict.footer.rights}
        </p>

        <div className="flex items-center gap-1.5">
          <TerminalButton label={dict.footer.openTerminal} />
          <p className="font-mono text-xs text-muted-text">
            {host} · {buildLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}