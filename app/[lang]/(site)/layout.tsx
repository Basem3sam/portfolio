import { preconnect, preload } from 'react-dom';
import type { ReactNode } from 'react';
import EasterEgg from '@/components/easter-egg/EasterEgg';
import BackToTop from '@/components/layout/BackToTop';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SkipLink from '@/components/layout/SkipLink';
import { PROFILE_IMAGE } from '@/data/site';
import { getDictionary, isLocale, type Locale } from '@/lib/i18n';

type SiteLayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);
  const languageSwitch =
    locale === 'en'
      ? { href: '/ar', hrefLang: 'ar', label: 'العربية' }
      : { href: '/', hrefLang: 'en', label: 'English' };

  preconnect('https://api.github.com', { crossOrigin: 'anonymous' });
  preload(PROFILE_IMAGE, { as: 'image', fetchPriority: 'high' });

  return (
    <>
      <SkipLink label={dict.nav.skipToContent} />
      <Navbar
        labels={dict.nav}
        theme={dict.theme}
        locale={locale}
        languageSwitch={languageSwitch}
      />
      {children}
      <Footer locale={locale} />
      <BackToTop label={dict.nav.backToTop} />
      <EasterEgg />
    </>
  );
}
