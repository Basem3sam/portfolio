import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import LinkCard from "@/components/links/LinkCard";
import CairoClock from "@/components/ui/CairoClock";
import Icon, { type IconName } from "@/components/ui/Icon";
import ProfileImage from "@/components/ui/ProfileImage";
import {
  CV_PATH,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
  TROSC_URL,
} from "@/data/site";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

type LinksPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: LinksPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const canonical = locale === "ar" ? "/ar/links" : "/links";

  return {
    title: dict.links.metadataTitle,
    description: dict.links.metadataDescription,
    alternates: {
      canonical,
      languages: {
        en: "/links",
        ar: "/ar/links",
        "x-default": "/links",
      },
    },
    openGraph: {
      url: canonical,
      title: dict.links.metadataTitle,
      description: dict.links.metadataDescription,
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
  };
}

type LinkItem = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  external?: boolean;
  download?: boolean;
};

export default async function LinksPage({ params }: LinksPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const t = dict.links;
  const homeHref = locale === "ar" ? "/ar" : "/";

  const links: LinkItem[] = [
    {
      href: homeHref,
      icon: "briefcase",
      title: t.cards.portfolio,
      description: t.cards.portfolioDesc,
    },
    {
      href: GITHUB_URL,
      icon: "github",
      title: t.cards.github,
      description: t.cards.githubDesc,
      external: true,
    },
    {
      href: LINKEDIN_URL,
      icon: "linkedIn",
      title: t.cards.linkedin,
      description: t.cards.linkedinDesc,
      external: true,
    },
    {
      href: MAILTO,
      icon: "mail",
      title: t.cards.email,
      description: EMAIL,
    },
    {
      href: PHONE_TEL,
      icon: "phone",
      title: t.cards.phone,
      description: PHONE_DISPLAY,
    },
    {
      href: TROSC_URL,
      icon: "globe",
      title: t.cards.trosc,
      description: t.cards.troscDesc,
      external: true,
    },
    {
      href: CV_PATH,
      icon: "fileDown",
      title: t.cards.cv,
      description: t.cards.cvDesc,
      download: true,
    },
  ];

  const floatingButton =
    "fixed top-4 z-[1030] flex size-11 items-center justify-center rounded-md border border-hairline bg-surface text-light-text no-underline shadow-xs transition-colors duration-200 hover:border-secondary hover:text-secondary print:hidden";

  return (
    <main className="flex min-h-screen flex-col">
      <Link
        href={homeHref}
        className={`${floatingButton} start-4`}
        aria-label={t.backToPortfolio}
      >
        <Icon name="arrowLeft" className="size-5 rtl:rotate-180" />
      </Link>

      <ThemeToggle id="themeToggle" className={`${floatingButton} end-4`} labels={dict.theme} />

      <div className="container flex flex-1 flex-col items-center justify-center py-24 text-center">
        <ProfileImage alt={t.name} imgClassName="size-[140px] max-xs:size-[110px]" />

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-dark-text">{t.name}</h1>
        <p className="mt-2 text-light-text">{t.role}</p>
        <p className="mt-1 text-sm text-muted-text">{t.tagline}</p>
        <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-light-text">
          <Icon name="mapPin" className="size-4" />
          {t.location}
          <span aria-hidden="true" className="text-muted-text">
            ·
          </span>
          <CairoClock className="text-sm" />
        </p>

        <div className="mt-10 flex w-full max-w-md flex-col gap-3">
          {links.map((link) => (
            <LinkCard key={link.title} {...link} />
          ))}
        </div>
      </div>

      <footer className="border-t border-hairline py-6 text-center text-sm text-light-text">
        <p>&copy; 2025 Basem Esam. {dict.footer.rights}</p>
      </footer>
    </main>
  );
}