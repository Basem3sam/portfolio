import type { Metadata } from 'next';
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Arabic,
} from 'next/font/google';
import type { ReactNode } from 'react';
import "@/app/globals.css";
import RevealOnScroll from '@/components/behavior/RevealOnScroll';
import ScrollManager from '@/components/behavior/ScrollManager';
import ThemeEffects from '@/components/behavior/ThemeEffects';
import ThemeScript from '@/components/behavior/ThemeScript';
import { PROFILE_IMAGE, SITE_URL } from '@/data/site';
import {
  getDictionary,
  getDirection,
  isLocale,
  locales,
  type Locale,
} from '@/lib/i18n';

const plexSans = IBM_Plex_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-sans',
});

const plexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-plex-arabic',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
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
  const locale: Locale = isLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);
  const shareImage = `${SITE_URL.replace(/\/$/, '')}${PROFILE_IMAGE}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: dict.metadata.title,
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
    authors: [{ name: 'Basem Esam' }],
    openGraph: {
      type: 'website',
      url: SITE_URL,
      title: dict.metadata.title,
      description: dict.metadata.shareDescription,
      images: [shareImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.metadata.title,
      description: dict.metadata.shareDescription,
      images: [shareImage],
    },
    icons: {
      apple: [
        { url: '/assets/icons/light/apple-touch-icon.png', sizes: '180x180' },
      ],
      icon: [
        {
          url: '/assets/icons/light/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/assets/icons/light/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
      ],
    },
    manifest: '/assets/icons/light/site.webmanifest',
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'en';
  const fontVariables =
    locale === 'ar'
      ? `${plexSansArabic.variable} ${plexMono.variable}`
      : `${plexSans.variable} ${plexMono.variable}`;

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
        <ThemeEffects />
        <ScrollManager />
        <RevealOnScroll />
      </body>
    </html>
  );
}
