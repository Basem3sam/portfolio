import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import LinkCard from "@/components/links/LinkCard";
import LinksStage from "@/components/links/LinksStage";
import Icon from "@/components/ui/Icon";
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
import { linksPageStrings } from "@/lib/dictionaries/links-page";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import "@/components/links/LinksPage.css";

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

/**
 * The /links hub: navbar-less, one bar (back + language + theme), then a
 * sticky profile card beside grouped link rows (mockup lines 2804–2837).
 * Reuses `dict.links` for every string that already exists; new copy (chip,
 * group labels) comes from lib/dictionaries/links-page.ts. RTL mirrors via
 * logical properties; the GlassFold canvas lives in LinksStage.
 */
export default async function LinksPage({ params }: LinksPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const t = dict.links;
  const lp = linksPageStrings[locale];
  const homeHref = locale === "ar" ? "/ar" : "/";
  const languageSwitch =
    locale === "en"
      ? { href: "/ar/links", hrefLang: "ar", label: "العربية" }
      : { href: "/links", hrefLang: "en", label: "English" };

  return (
    <main id="main-content" className="lk-page">
      <div className="links-bar">
        <Link href={homeHref} className="lb-back">
          <span className="lb-arrow" aria-hidden="true">
            <Icon name="arrowLeft" className="size-4" />
          </span>
          <span>{t.backToPortfolio}</span>
        </Link>

        <div className="lb-ctl">
          <LanguageSwitcher {...languageSwitch} className="lb-lang" />
          <ThemeToggle id="linksThemeToggle" labels={dict.theme} className="lb-theme" />
        </div>
      </div>

      <div className="links2">
        <div className="lk-side">
          <aside className="lk-card" data-reveal>
            <LinksStage alt={t.name} />
            <div className="lk-body">
              <span className="lk-chip">
                <span className="dot" aria-hidden="true"></span>
                <span>{lp.chip}</span>
              </span>
              <h1>
                {t.name}
                <span className="cursor" aria-hidden="true"></span>
              </h1>
              <p>{t.role}</p>
              <p className="lbl">{t.location}</p>
            </div>
          </aside>
        </div>

        <div className="lk-list">
          <div className="lk-g" data-reveal>
            <p className="lbl">{lp.groupStart}</p>
            <LinkCard
              href={homeHref}
              icon="briefcase"
              trailing="arrowRight"
              primary
              title={t.cards.portfolio}
              description={t.cards.portfolioDesc}
            />
            <LinkCard
              href={CV_PATH}
              icon="fileDown"
              trailing="fileDown"
              download
              title={t.cards.cv}
              description={t.cards.cvDesc}
            />
          </div>

          <div className="lk-g" data-reveal>
            <p className="lbl">{lp.groupReach}</p>
            <LinkCard
              href={PHONE_TEL}
              icon="phone"
              trailing="arrowRight"
              title={t.cards.phone}
              value={PHONE_DISPLAY}
            />
            <LinkCard
              href={MAILTO}
              icon="mail"
              trailing="arrowRight"
              title={t.cards.email}
              value={EMAIL}
            />
            <LinkCard
              href={LINKEDIN_URL}
              icon="linkedIn"
              trailing="externalLink"
              external
              title={t.cards.linkedin}
              description={t.cards.linkedinDesc}
            />
          </div>

          <div className="lk-g" data-reveal>
            <p className="lbl">{lp.groupCode}</p>
            <LinkCard
              href={GITHUB_URL}
              icon="github"
              trailing="externalLink"
              external
              title={t.cards.github}
              description={t.cards.githubDesc}
            />
            <LinkCard
              href={TROSC_URL}
              icon="globe"
              trailing="externalLink"
              external
              title={t.cards.trosc}
              description={t.cards.troscDesc}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
