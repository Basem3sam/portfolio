import { getDictionary, type Locale } from '@/lib/i18n';

type FooterProps = {
  locale?: Locale;
};

export default function Footer({ locale = 'en' }: FooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer className="relative w-full overflow-x-hidden bg-primary py-[30px] text-center text-white before:absolute before:top-0 before:left-0 before:h-0.5 before:w-full before:bg-[linear-gradient(90deg,transparent,var(--c-secondary),transparent)] before:content-[''] dark:border-t dark:border-hairline">
      <div className="container">
        <p className="opacity-90">
          &copy; 2025 Basem Esam. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
