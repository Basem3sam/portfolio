import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import EndpointExplorer from "@/components/case-study/EndpointExplorer";
import CountUp from "@/components/ui/CountUp";
import Icon, { type IconName } from "@/components/ui/Icon";
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
    alternates: {
      canonical: locale === "ar" ? "/ar/work/trosc" : "/work/trosc",
      languages: {
        en: "/work/trosc",
        ar: "/ar/work/trosc",
        "x-default": "/work/trosc",
      },
    },
    openGraph: {
      type: "article",
      url: locale === "ar" ? "/ar/work/trosc" : "/work/trosc",
      title: t.metadata.title,
      description: t.metadata.description,
      locale: locale === "ar" ? "ar_EG" : "en_US",
    },
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

const sectionIcons: Record<keyof typeof sectionLabels, IconName> = {
  architecture: "layers",
  security: "shield",
  media: "globe",
  operations: "activity",
  testing: "checkCircle",
  explorer: "terminal",
};

const revealClass =
  "data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up";

const linkButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md";

function CaseSection({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: IconName;
  children: ReactNode;
}) {
  const id = label.replace(/[^a-z]/g, "");
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="border-t border-hairline py-12 md:py-16">
      <p className="flex items-center gap-2 font-mono text-xs font-medium tracking-wide text-secondary uppercase">
        <Icon name={icon} className="size-3.5" />
        <span dir="ltr">{label}</span>
      </p>
      <h2
        id={headingId}
        className="mt-1.5 text-2xl font-semibold tracking-tight text-dark-text md:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-3 flex items-center gap-2" aria-hidden="true">
        <span className="h-0.5 w-12 rounded-full bg-secondary motion-safe:animate-rule-grow"></span>
        <span className="h-0.5 w-3 rounded-full bg-signal motion-safe:animate-rule-grow [animation-delay:250ms]"></span>
        <span className="h-px flex-1 bg-hairline"></span>
      </div>
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
      <div className="relative container bg-grid pt-28 pb-4 md:pt-32">
        <div
          className="pointer-events-none absolute inset-0 bg-ember-glow motion-safe:animate-glow-breathe"
          aria-hidden="true"
        ></div>
        <Link
          href={backHref}
          className="group/back inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-4 font-mono text-sm font-medium text-light-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md active:translate-y-0"
        >
          <Icon
            name="arrowLeft"
            className="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5 rtl:rotate-180 rtl:group-hover/back:translate-x-0.5"
          />
          {t.back}
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h1
            className="font-mono text-3xl font-semibold tracking-tight text-dark-text md:text-4xl"
            dir="ltr"
          >
            trosc-backend
          </h1>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,101,52,0.1)] px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-[#166534] uppercase dark:bg-[rgba(74,222,128,0.12)] dark:text-[#4ade80]">
            <span className="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
            {t.statusLabel}
          </p>
        </div>
        <p className="mt-2 text-sm font-medium text-light-text">{t.role}</p>
        <div className="mt-6 max-w-3xl rounded-xl border border-hairline bg-surface p-6 shadow-sm md:p-7">
          <p className="text-lg leading-relaxed text-dark-text">{t.brief}</p>
        </div>

        <dl
          className={`mx-auto mt-10 grid auto-rows-fr grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-3 lg:mx-0 lg:grid-cols-6 ${revealClass}`}
          data-reveal
        >
          {t.metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col-reverse items-center justify-between gap-1 bg-surface p-4 text-center transition-colors duration-200 hover:bg-light-bg"
            >
              <dt className="text-xs leading-snug text-light-text">{metric.label}</dt>
              <dd className="font-mono text-2xl font-semibold text-secondary" dir="ltr">
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
          <a href={TROSC_URL} target="_blank" rel="noopener noreferrer" className={linkButton}>
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
          icon={sectionIcons.architecture}
          label={sectionLabels.architecture}
          title={t.sections.architecture.title}
        >
          <div className="grid gap-4 stagger-60 md:grid-cols-2" data-reveal data-stagger>
            {t.sections.architecture.entries.map((entry, index) => (
              <div
                key={entry.title}
                style={{ "--stagger-index": index } as CSSProperties}
                className="rounded-xl border border-hairline bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:shadow-md md:p-6"
              >
                <p className="flex items-baseline gap-2.5">
                  <span className="font-mono text-sm font-semibold text-secondary" dir="ltr">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-lg font-semibold text-dark-text">{entry.title}</span>
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-light-text">{entry.text}</p>
              </div>
            ))}
          </div>
        </CaseSection>

        <CaseSection
          icon={sectionIcons.security}
          label={sectionLabels.security}
          title={t.sections.security.title}
        >
          <p className="max-w-3xl text-light-text">{t.sections.security.intro}</p>
          <ol
            className={`mt-6 overflow-hidden rounded-xl border border-hairline bg-surface shadow-xs ${revealClass}`}
            data-reveal
          >
            {t.sections.security.layers.map((layer, index) => (
              <li
                key={layer}
                className="flex items-center gap-4 border-b border-hairline px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-light-bg"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[rgba(163,72,9,0.08)] font-mono text-xs font-semibold text-secondary dark:bg-[rgba(251,191,36,0.1)] dark:text-[#fbbf24]"
                  dir="ltr"
                >
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

        <CaseSection icon={sectionIcons.media} label={sectionLabels.media} title={t.sections.media.title}>
          <div className={`max-w-3xl space-y-4 ${revealClass}`} data-reveal>
            {t.sections.media.paragraphs.map((paragraph, index) => (
              <p key={index} className="leading-relaxed text-light-text">
                {paragraph}
              </p>
            ))}
          </div>
        </CaseSection>

        <CaseSection
          icon={sectionIcons.operations}
          label={sectionLabels.operations}
          title={t.sections.operations.title}
        >
          <ul className={`max-w-3xl space-y-6 ${revealClass}`} data-reveal>
            {t.sections.operations.entries.map((entry) => (
              <li key={entry.title} className="flex items-start gap-2.5">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-status"
                  aria-hidden="true"
                ></span>
                <div>
                  <h3 className="font-semibold text-dark-text">{entry.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-light-text">{entry.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection
          icon={sectionIcons.testing}
          label={sectionLabels.testing}
          title={t.sections.testing.title}
        >
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
                <dd className="font-mono text-xl font-semibold text-secondary" dir="ltr">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-light-text">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </CaseSection>

        <CaseSection
          icon={sectionIcons.explorer}
          label={sectionLabels.explorer}
          title={t.sections.explorer.title}
        >
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
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-signal no-underline transition-colors duration-200 hover:text-dark-text"
          >
            {t.sections.explorer.apiReference}
            <Icon name="externalLink" className="size-4" />
          </a>
        </CaseSection>
        <div classname="mt-16 border-t border-hairline pt-8">
          <div classname="flex flex-wrap items-center justify-between gap-4">
            <link
              href={backhref}
              classname="group/back inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-4 font-mono text-sm font-medium text-light-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md active:translate-y-0"
            >
              <icon
                name="arrowleft"
                classname="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5 rtl:rotate-180 rtl:group-hover/back:translate-x-0.5"
              />
              {t.back}
            </link>
            <div classname="flex flex-wrap gap-3">
              <a
                href={trosc_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                classname={linkbutton}
              >
                <icon name="github" classname="size-4" />
                {t.links.repo}
              </a>
              <a href={trosc_url} target="_blank" rel="noopener noreferrer" classname={linkbutton}>
                <icon name="externallink" classname="size-4" />
                {t.links.live}
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}