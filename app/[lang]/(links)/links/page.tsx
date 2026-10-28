import type { ComponentProps, CSSProperties } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import CardFx from "@/components/links/CardFx";
import LinksBackdrop from "@/components/links/LinksBackdrop";
import LinkCard from "@/components/links/LinkCard";
import LinksStage from "@/components/links/LinksStage";
import CairoClock from "@/components/ui/CairoClock";
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

/** The stack, as named on the home page; the same in both languages. */
const STACK_TAGS = ["Node.js", "Express", "MongoDB"] as const;

/** `https://trosc.vercel.app/` -> `trosc.vercel.app`, for the destination chips. */
const hostOf = (url: string) => new URL(url).host.replace(/^www\./, "");

/** `https://github.com/basem3sam` -> `/basem3sam`: the handle says more than the host. */
const handleOf = (url: string) => {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return `/${parts[parts.length - 1]}`;
};

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
 * sticky profile card beside a numbered, ruled ledger of grouped links. The
 * card leans toward the pointer (CardFx); phone and email rows can be copied.
 * Reuses `dict.links` for every string that already exists; new copy (status,
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

  const groups = [
    {
      label: lp.groupStart,
      rows: [
        {
          href: homeHref,
          icon: "briefcase",
          trailing: "arrowRight",
          primary: true,
          title: t.cards.portfolio,
          description: t.cards.portfolioDesc,
        },
        {
          href: CV_PATH,
          icon: "fileDown",
          trailing: "fileDown",
          download: true,
          host: "PDF",
          title: t.cards.cv,
          description: t.cards.cvDesc,
        },
      ],
    },
    {
      label: lp.groupReach,
      rows: [
        {
          href: PHONE_TEL,
          icon: "phone",
          trailing: "arrowRight",
          title: t.cards.phone,
          value: PHONE_DISPLAY,
          copy: { value: PHONE_DISPLAY, label: lp.copyPhone, tip: lp.copyTip, done: lp.copied },
        },
        {
          href: MAILTO,
          icon: "mail",
          trailing: "arrowRight",
          title: t.cards.email,
          value: EMAIL,
          copy: { value: EMAIL, label: lp.copyEmail, tip: lp.copyTip, done: lp.copied },
        },
        {
          href: LINKEDIN_URL,
          icon: "linkedIn",
          trailing: "externalLink",
          external: true,
          host: handleOf(LINKEDIN_URL),
          title: t.cards.linkedin,
          description: t.cards.linkedinDesc,
        },
      ],
    },
    {
      label: lp.groupCode,
      // The last two links are larger cards in a two-up grid, which breaks the
      // single-column rhythm of the ledger above them.
      layout: "tiles",
      rows: [
        {
          href: GITHUB_URL,
          icon: "github",
          trailing: "externalLink",
          external: true,
          tile: true,
          host: handleOf(GITHUB_URL),
          title: t.cards.github,
          description: t.cards.githubDesc,
        },
        {
          href: TROSC_URL,
          icon: "globe",
          trailing: "externalLink",
          external: true,
          tile: true,
          host: hostOf(TROSC_URL),
          title: t.cards.trosc,
          description: t.cards.troscDesc,
        },
      ],
    },
  ] satisfies {
    label: string;
    layout?: "tiles";
    rows: Omit<ComponentProps<typeof LinkCard>, "index">[];
  }[];

  // How many rows sit above each group, so the entrance reads as one cascade
  // down the whole ledger instead of three that start together.
  const rowsAbove = groups.map((_, index) =>
    groups.slice(0, index).reduce((total, group) => total + group.rows.length, 0),
  );

  return (
    <>
      <LinksBackdrop />
      <main id="main-content" className="lk-page">
        <div className="links-bar">
          <Link href={homeHref} className="lb-back">
            <span className="lb-arrow" aria-hidden="true">
              <Icon name="arrowLeft" className="size-4" />
            </span>
            <span className="lb-text">{t.backToPortfolio}</span>
          </Link>

          <div className="lb-ctl">
            <LanguageSwitcher {...languageSwitch} className="lb-lang" />
            <ThemeToggle id="linksThemeToggle" labels={dict.theme} className="lb-theme" />
          </div>
        </div>

        <div className="links2">
          <div className="lk-side">
            <aside className="lk-card" data-reveal>
              <CardFx />
              <LinksStage alt={t.name} />
              <div className="lk-body">
                <p className="status lk-status">
                  <span className="dot" aria-hidden="true"></span>
                  <span className="st st-live">{lp.chip}</span>
                </p>
                <h1>
                  <span className="nm">{t.name}</span>
                  <span className="cursor" aria-hidden="true"></span>
                </h1>
                <p className="lk-role">{t.role}</p>
                <ul className="lk-tags">
                  {STACK_TAGS.map((tag, index) => (
                    <li key={tag} style={{ "--i": index } as CSSProperties}>
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="lk-meta">
                  <span className="lbl">{t.location}</span>
                  <CairoClock className="lk-time" />
                </div>
              </div>
            </aside>
          </div>

          <div className="lk-list">
            {groups.map((group, groupIndex) => (
              <div
                key={group.label}
                className="lk-g stagger-60"
                role="group"
                aria-labelledby={`lk-group-${groupIndex}`}
                style={{ "--base": rowsAbove[groupIndex] } as CSSProperties}
                data-reveal
                data-stagger
              >
                <div className="sh-top lk-gh" style={{ "--stagger-index": 0 } as CSSProperties}>
                  <span className="idx" aria-hidden="true">
                    {String(groupIndex + 1).padStart(2, "0")}
                  </span>
                  <p className="lbl" id={`lk-group-${groupIndex}`}>
                    {group.label}
                  </p>
                  <span className="rule" aria-hidden="true"></span>
                </div>
                {group.layout === "tiles" ? (
                  <div className="lk-tiles">
                    {group.rows.map((row, rowIndex) => (
                      <LinkCard key={row.href} index={rowIndex + 1} {...row} />
                    ))}
                  </div>
                ) : (
                  group.rows.map((row, rowIndex) => (
                    <LinkCard key={row.href} index={rowIndex + 1} {...row} />
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lk-end">
          <footer className="lk-foot">
            <p>
              <span>
                &copy; {new Date().getFullYear()} {t.name}. {dict.footer.rights}
              </span>
            </p>
          </footer>
          {/* The site's big faded wordmark, cropped by the bottom edge. */}
          <div className="lk-word" aria-hidden="true">
            <span>basem.esam</span>
          </div>
        </div>
      </main>
    </>
  );
}
