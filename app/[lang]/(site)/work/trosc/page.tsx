import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import EndpointExplorer from "@/components/case-study/EndpointExplorer";
import CountUp from "@/components/ui/CountUp";
import Icon from "@/components/ui/Icon";
import { TROSC_API_DOCS_URL, TROSC_REPO_URL, TROSC_URL } from "@/data/site";
import { getTroscDictionary } from "@/lib/dictionaries/trosc";
import { isLocale, type Locale } from "@/lib/i18n";

type CaseStudyPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getTroscDictionary(locale);

  return {
    title: t.metadata.title,
    description: t.metadata.description,
  };
}

const sectionLabels = {
  architecture: "// architecture",
  security: "// security",
  media: "// media",
  operations: "// operations",
  testing: "// testing",
  explorer: "// api",
} as const;

const revealClass =
  "data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up";

const linkButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline transition-colors duration-200 hover:border-secondary hover:text-secondary";

function CaseSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-hairline py-12 md:py-16">
      <p className="font-mono text-xs font-medium tracking-wide text-secondary uppercase" dir="ltr">
        {label}
      </p>
      <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-dark-text md:text-3xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function TroscCaseStudyPage({ params }: CaseStudyPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const t = getTroscDictionary(locale);
  const backHref = locale === "ar" ? "/ar#work" : "/#work";

  return (
    <main id="main-content">
      <div className="container pt-28 pb-4 md:pt-32">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 font-mono text-sm text-light-text no-underline transition-colors duration-200 hover:text-secondary"
        >
          <Icon name="arrowLeft" className="size-4 rtl:rotate-180" />
          {t.back}
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h1
            className="font-mono text-3xl font-semibold tracking-tight text-dark-text md:text-4xl"
            dir="ltr"
          >
            trosc-backend
          </h1>
          <p className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-light-text uppercase">
            <span className="size-2 rounded-full bg-status" aria-hidden="true"></span>
            {t.statusLabel}
          </p>
        </div>
        <p className="mt-2 text-sm font-medium text-light-text">{t.role}</p>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-light-text">{t.brief}</p>

        <dl
          className={`mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3 lg:grid-cols-6 ${revealClass}`}
          data-reveal
        >
          {t.metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col-reverse bg-surface p-4 text-center">
              <dt className="mt-1 text-xs leading-snug text-light-text">{metric.label}</dt>
              <dd className="font-mono text-2xl font-semibold text-dark-text" dir="ltr">
                <CountUp value={metric.value} suffix={metric.suffix} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-mono text-xs text-muted-text">{t.metricsNote}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={TROSC_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButton}
          >
            <Icon name="github" className="size-4" />
            {t.links.repo}
          </a>
          <a
            href={TROSC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButton}
          >
            <Icon name="externalLink" className="size-4" />
            {t.links.live}
          </a>
          <a
            href={TROSC_API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButton}
          >
            <Icon name="code" className="size-4" />
            {t.links.api}
          </a>
        </div>
      </div>

      <div className="container pb-16 md:pb-24">
        <CaseSection
          label={sectionLabels.architecture}
          title={t.sections.architecture.title}
        >
          <div className={`grid gap-x-10 gap-y-8 md:grid-cols-2 ${revealClass}`} data-reveal>
            {t.sections.architecture.entries.map((entry) => (
              <div key={entry.title}>
                <h3 className="font-semibold text-dark-text">{entry.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-light-text">{entry.text}</p>
              </div>
            ))}
          </div>
        </CaseSection>

        <CaseSection label={sectionLabels.security} title={t.sections.security.title}>
          <p className="max-w-3xl text-light-text">{t.sections.security.intro}</p>
          <ol
            className={`mt-6 divide-y divide-hairline border-y border-hairline ${revealClass}`}
            data-reveal
          >
            {t.sections.security.layers.map((layer, index) => (
              <li key={layer} className="flex gap-4 py-3.5">
                <span className="font-mono text-sm font-semibold text-secondary" dir="ltr">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-light-text">{layer}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-text">
            {t.sections.security.extra}
          </p>
        </CaseSection>

        <CaseSection label={sectionLabels.media} title={t.sections.media.title}>
          <div className={`max-w-3xl space-y-4 ${revealClass}`} data-reveal>
            {t.sections.media.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed text-light-text">
                {paragraph}
              </p>
            ))}
          </div>
        </CaseSection>

        <CaseSection label={sectionLabels.operations} title={t.sections.operations.title}>
          <ul className={`max-w-3xl space-y-6 ${revealClass}`} data-reveal>
            {t.sections.operations.entries.map((entry) => (
              <li key={entry.title}>
                <h3 className="font-semibold text-dark-text">{entry.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-light-text">{entry.text}</p>
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection label={sectionLabels.testing} title={t.sections.testing.title}>
          <div className={`max-w-3xl space-y-4 ${revealClass}`} data-reveal>
            {t.sections.testing.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed text-light-text">
                {paragraph}
              </p>
            ))}
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline">
            {t.sections.testing.stats.map((stat) => (
              <div key={stat.label} className="bg-surface p-4 text-center">
                <dd className="font-mono text-xl font-semibold text-dark-text" dir="ltr">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-light-text">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </CaseSection>

        <CaseSection label={sectionLabels.explorer} title={t.sections.explorer.title}>
          <p className="max-w-3xl text-light-text">{t.sections.explorer.subtitle}</p>
          <div className="mt-6 print:hidden">
            <EndpointExplorer dict={t.sections.explorer} />
          </div>
          <p className="mt-4 max-w-3xl text-sm text-muted-text">
            {t.sections.explorer.simulatedNote}
          </p>
          <a
            href={TROSC_API_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary no-underline transition-colors duration-200 hover:text-dark-text"
          >
            {t.sections.explorer.apiReference}
            <Icon name="externalLink" className="size-4" />
          </a>
        </CaseSection>
      </div>
    </main>
  );
}