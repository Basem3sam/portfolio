import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Instrument_Sans,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Readex_Pro,
} from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "@/app/globals.css";
import RevealOnScroll from "@/components/behavior/RevealOnScroll";
import ScrollManager from "@/components/behavior/ScrollManager";
import ThemeEffects from "@/components/behavior/ThemeEffects";
import ThemeScript from "@/components/behavior/ThemeScript";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/data/site";
import { getDictionary, getDirection, isLocale, locales, type Locale } from "@/lib/i18n";

// Variable fonts: no `weight` list, so Next serves one variable file per face.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

const jakartaDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  display: "swap",
  // English routes never render Arabic glyphs, but Next preloads every font
  // declared in this module. Without this, `/` downloads Arabic subsets it
  // cannot use. `/ar` still gets them via `font-display: swap`.
  preload: false,
  variable: "--font-readex",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const terminalFont = localFont({
  src: [
    { path: "../fonts/JetBrainsMonoNL-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/JetBrainsMonoNL-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  // Only the easter-egg terminal uses this face, and that overlay mounts after
  // the visitor starts the hunt. It still loads the moment the overlay renders;
  // it just no longer competes with the page's own assets on every route.
  preload: false,
  variable: "--font-terminal",
});

// The one hand-written accent in the design (the portrait note). Caveat has no
// Arabic glyphs, so it is only attached on English routes; there the note falls
// back to the Arabic body face instead of downloading a font it cannot use.
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

type RootLayoutProps = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const canonical = locale === "ar" ? "/ar" : "/";

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
    authors: [{ name: "Basem Esam" }],
    alternates: {
      canonical,
      languages: {
        en: "/",
        ar: "/ar",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Basem Esam",
      title: dict.metadata.title,
      description: dict.metadata.shareDescription,
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.shareDescription,
    },
    icons: {
      apple: [{ url: "/assets/icons/light/apple-touch-icon.png", sizes: "180x180" }],
      icon: [
        { url: "/assets/icons/light/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/assets/icons/light/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
    },
    manifest: "/assets/icons/light/site.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1522" },
  ],
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const fontVariables =
    locale === "ar"
      ? `${readexPro.variable} ${jetbrainsMono.variable} ${terminalFont.variable}`
      : `${instrumentSans.variable} ${jakartaDisplay.variable} ${caveat.variable} ${jetbrainsMono.variable} ${terminalFont.variable}`;

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={fontVariables}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        <ThemeScript />
        {children}
        <JsonLd />
        <ThemeEffects />
        <ScrollManager />
        <RevealOnScroll />
      </body>
    </html>
  );
}
