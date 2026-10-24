import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import EndpointExplorer from "@/components/case-study/EndpointExplorer";
import LiveSiteFrame from "@/components/case-study/LiveSiteFrame";
import WorkKpis from "@/components/sections/WorkPlates";
import TideCanvas from "@/components/sections/TideCanvas";
import CountUp from "@/components/ui/CountUp";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import { TROSC_API_DOCS_URL, TROSC_REPO_URL, TROSC_URL } from "@/data/site";
import { getTroscDictionary } from "@/lib/dictionaries/trosc";
import { isLocale, type Locale } from "@/lib/i18n";
import "@/components/ui/KpiLedger.css";
import "@/components/sections/TideBand.css";
import "@/components/case-study/CaseStudy.css";

type CaseStudyPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? "en" : "ar";
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

/**
 * The decorative micro-graphic at the foot of each KPI tile. The shapes are
 * bespoke per fact — HTTP verbs, segment meters, avatars — so they are keyed
 * by tile position, exactly like the home work section. Everything here is
 * aria-hidden; the numbers live in the tile's `dd`.
 */
function CaseKpiGraphic({ index }: { index: number }) {
  if (index === 0) {
    return (
      <span className="pt-v pv-m" aria-hidden="true">
        <b>GET</b>
        <b>POST</b>
        <b>PUT</b>
        <b>DEL</b>
      </span>
    );
  }

  if (index === 5) {
    return (
      <span className="pt-v pv-a" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <i></i>
        <em>+</em>
      </span>
    );
  }

  // Segment meters: 12 collections and 17 services light every segment,
  // 60+ test suites light six of seven, and statement coverage lights 19 of
  // 20 — 94.8% rounded to a twentieth.
  const segments = index === 1 ? 12 : index === 2 ? 17 : index === 3 ? 7 : 20;
  const lit = index === 3 ? 6 : index === 4 ? 19 : segments;
  const variant = index === 1 ? " pv-k" : index === 3 ? " pv-t" : "";

  return (
    <span className={`pt-v pv-s${variant}`} aria-hidden="true">
      {Array.from({ length: segments }, (_, k) => (
        <i key={k} className={k < lit ? "on" : undefined} style={{ "--k": k } as CSSProperties}></i>
      ))}
    </span>
  );
}

export default async function TroscCaseStudyPage({ params }: CaseStudyPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const t = getTroscDictionary(locale);
  const backHref = locale === "ar" ? "/ar#work" : "/#work";

  return (
    <main id="main-content" data-page="case">
      <section className="case-hero tide" aria-labelledby="h-case">
        <TideCanvas />

        <div className="container">
          <Link href={backHref} className="back">
            <Icon name="arrowLeft" className="size-4 rtl:rotate-180" />
            {t.back.label}
          </Link>

          <div className="case-hero-grid">
            <div className="case-hero-copy">
              <p className="lbl">{t.hero.label}</p>

              <h1 className="cs-title" id="h-case">
                {t.hero.title}
              </h1>

              <p className="prov">
                <span className="slug">{t.hero.slug}</span>
                <span className="sep" aria-hidden="true">
                  ·
                </span>
                <span className="status">
                  <span className="dot" aria-hidden="true"></span>
                  <span className="st st-live">{t.hero.status}</span>
                </span>
              </p>

              <p className="cs-intro">{t.hero.intro}</p>

              <div className="actions">
                <a
                  className="btn btn-primary"
                  href={TROSC_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" className="size-4" />
                  {t.actions.repository}
                </a>
                <a
                  className="btn btn-ghost"
                  href={TROSC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-peek=""
                >
                  <Icon name="externalLink" className="size-4" />
                  {t.actions.liveSite}
                </a>
                <a
                  className="btn btn-ghost"
                  href={TROSC_API_DOCS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="code" className="size-4" />
                  {t.actions.apiReference}
                </a>
              </div>
            </div>

            <div className="case-hero-wall">
              <WorkKpis>
                {t.metrics.map((metric, index) => (
                  <div key={metric.label} className={index === 4 ? "kpi kpi-cov" : "kpi"}>
                    <dt>{metric.label}</dt>
                    <dd>
                      <CountUp value={metric.value} />
                      {metric.suffix ? <em>{metric.suffix}</em> : null}
                    </dd>
                    <CaseKpiGraphic index={index} />
                  </div>
                ))}
              </WorkKpis>

              <p className="lbl note">{t.metricsNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="case-sec" aria-labelledby="h-path">
        <div className="container">
          <SectionHeader
            number="01"
            title={t.sections.requestPath.title}
            lead={t.sections.requestPath.lead}
            headingId="h-path"
          />

          <ol className="flow" data-reveal>
            {t.sections.requestPath.stages.map((stage) => (
              <li key={stage.n} className="stage">
                <div className={stage.n === "7" ? "node node-live" : "node"}>
                  <span className="n">{stage.n}</span>
                  <span>{stage.name}</span>
                </div>
                <p>{stage.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="case-sec sec-panel" aria-labelledby="h-arch">
        <div className="container">
          <div className="two">
            <div>
              <SectionHeader number="02" title={t.sections.architecture.title} headingId="h-arch" />
              <ul className="list-r" data-reveal>
                {t.sections.architecture.entries.map((entry) => (
                  <li key={entry.title}>
                    <b>{entry.title}</b>
                    <span>{entry.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeader number="03" title={t.sections.security.title} headingId="h-security" />
              <ul className="list-r" data-reveal>
                {t.sections.security.items.map((item) => (
                  <li key={item.title}>
                    <b>{item.title}</b>
                    <span>{item.desc}</span>
                  </li>
                ))}
              </ul>
              <p className="lbl note">{t.sections.security.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="case-sec" aria-labelledby="h-ex">
        <div className="container">
          <SectionHeader
            number="04"
            title={t.sections.explorer.title}
            lead={t.sections.explorer.lead}
            headingId="h-ex"
          />

          <EndpointExplorer dict={t.sections.explorer} />
        </div>
      </section>

      <section className="case-sec sec-panel" aria-labelledby="h-fe">
        <div className="container">
          <SectionHeader
            number="05"
            title={t.sections.frontend.title}
            lead={t.sections.frontend.lead}
            headingId="h-fe"
          />

          <LiveSiteFrame
            url={TROSC_URL}
            host={t.sections.frontend.addr}
            dict={t.sections.frontend}
          />
        </div>
      </section>
    </main>
  );
}
