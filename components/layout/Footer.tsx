import { getDictionary, type Locale } from '@/lib/i18n';
import { SITE_URL } from '@/data/site';

type FooterProps = {
  locale?: Locale;
};

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

export default function Footer({ locale = 'en' }: FooterProps) {
  const dict = getDictionary(locale);
  const host = new URL(SITE_URL).host;
  const buildLabel = commitSha ? `build ${commitSha.slice(0, 7)}` : 'build dev';

  return (
    <footer className="w-full border-t border-hairline bg-(--c-page) py-8">
      <div className="container flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-light-text">
        <p>&copy; 2025 Basem Esam. {dict.footer.rights}</p>
        <p className="font-mono text-xs text-muted-text">
          {host} · {buildLabel}
        </p>
      </div>
    </footer>
  );
}
