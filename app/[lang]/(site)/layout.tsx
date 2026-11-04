import type { ReactNode } from "react";
import EasterEgg from "@/components/easter-egg/EasterEgg";
import BackToTop from "@/components/layout/BackToTop";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SkipLink from "@/components/layout/SkipLink";
import LinkPeekHost from "@/components/ui/LinkPeek";
import CommandPaletteProvider from "@/components/palette/CommandPalette";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

type SiteLayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const languageSwitch =
    locale === "en"
      ? { href: "/ar", hrefLang: "ar", label: "العربية" }
      : { href: "/", hrefLang: "en", label: "English" };

  return (
    <CommandPaletteProvider labels={dict.palette} nav={dict.nav} locale={locale}>
      <SkipLink label={dict.nav.skipToContent} />
      <Navbar
        labels={dict.nav}
        theme={dict.theme}
        locale={locale}
        languageSwitch={languageSwitch}
        palette={dict.palette}
      />
      {children}
      <Footer locale={locale} />
      <BackToTop label={dict.nav.backToTop} />
      <EasterEgg locale={locale} />
      <LinkPeekHost />
    </CommandPaletteProvider>
  );
}
