import Icon from "@/components/ui/Icon";
import { getDictionary, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/data/site";

const OPEN_TERMINAL_EVENT = "open-secret-terminal";

type FooterProps = {
  locale?: Locale;
};

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

export default function Footer({ locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);
  const host = new URL(SITE_URL).host;
  const buildLabel = commitSha ? `build ${commitSha.slice(0, 7)}` : "build dev";

  return (
    <footer className="w-full bg-light-bg py-8 print:bg-white">
      <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-light-text">
        <p>&copy; {new Date().getFullYear()} Basem Esam. {dict.footer.rights}</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex size-11 cursor-pointer items-center justify-center rounded-md text-muted-text transition-colors duration-200 hover:text-signal print:hidden"
            aria-label={dict.footer.openTerminal}
            title={dict.footer.openTerminal}
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_TERMINAL_EVENT))}
          >
            <Icon name="terminal" className="size-4" />
          </button>
          <p className="font-mono text-xs text-muted-text">
            {host} · {buildLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}