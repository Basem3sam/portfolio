import type { CSSProperties } from "react";
import GitHubProjects from "@/components/github/GitHubProjects";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import Spotlight from "@/components/ui/Spotlight";
import {
  LARAVEL_REPO_URL,
  NEUROSCAN_REPO_URL,
  TROSC_REPO_URL,
  TROSC_URL,
  ZABTHALAHAK_URL,
} from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";

type WorkProps = {
  dict: Dictionary["work"];
  github: Dictionary["github"];
  locale: Locale;
};

const projectLinks: Record<string, { repo?: string; live?: string }> = {
  trosc: { repo: TROSC_REPO_URL, live: TROSC_URL },
  storeAdvisor: {},
  zabthalahak: { live: ZABTHALAHAK_URL },
  laravel: { repo: LARAVEL_REPO_URL },
  neuroscan: { repo: NEUROSCAN_REPO_URL },
};

const caseStudyLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-on-secondary no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-signal hover:shadow-md dark:shadow-[0_0_28px_color-mix(in_srgb,var(--c-secondary)_30%,transparent)]";

const repoLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md";

const liveLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md";

type Project = Dictionary["work"]["projects"][number];

// Status is a dot plus a word. Only "production" is coloured: colour means
// "this is live", so the other states stay neutral (hollow = still being
// built, solid grey = finished or academic).
const statusDot: Record<string, string> = {
  production: "bg-status",
  development: "border-[1.5px] border-muted-text",
  complete: "bg-muted-text",
  research: "bg-muted-text",
  academic: "bg-muted-text",
};

const cardBase =
  "spotlight rounded-lg border border-hairline bg-surface p-6 shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-rule-strong hover:shadow-md md:p-7";

function Status({ project, label }: { project: Project; label: string }) {
  return (
    <p className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wide uppercase">
      <span
        className={`size-2 shrink-0 rounded-full ${statusDot[project.status]}`}
        aria-hidden="true"
      ></span>
      <span className={project.status === "production" ? "text-status" : "text-light-text"}>
        {label}
      </span>
      {project.provenance && (
        <>
          <span className="text-muted-text" aria-hidden="true">
            ·
          </span>
          <span className="font-medium text-muted-text normal-case">{project.provenance}</span>
        </>
      )}
    </p>
  );
}

function TechChips({ tech }: { tech: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tech.map((name) => (
        <span
          key={name}
          dir="ltr"
          className="rounded-md border border-hairline px-2.5 py-1 font-mono text-[13px] text-light-text transition-colors duration-200 hover:border-signal hover:text-signal"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

function ProjectLinks({
  project,
  dict,
  locale,
}: {
  project: Project;
  dict: Dictionary["work"];
  locale: Locale;
}) {
  const links = projectLinks[project.id];
  const showLinks = project.id === "trosc" || Boolean(links && (links.repo || links.live));
  if (!showLinks) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {project.id === "trosc" && (
        <Link
          href={locale === "ar" ? "/ar/work/trosc" : "/work/trosc"}
          className={caseStudyLink}
        >
          {dict.caseStudy}
          <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
        </Link>
      )}
      {links?.repo && (
        <a href={links.repo} target="_blank" rel="noopener noreferrer" className={repoLink}>
          <Icon name="github" className="size-4" />
          {dict.viewRepo}
        </a>
      )}
      {links?.live && (
        <a href={links.live} target="_blank" rel="noopener noreferrer" className={liveLink}>
          <Icon name="externalLink" className="size-4" />
          {dict.viewLive}
        </a>
      )}
    </div>
  );
}

function ProjectBody({
  project,
  dict,
  locale,
  titleClass,
}: {
  project: Project;
  dict: Dictionary["work"];
  locale: Locale;
  titleClass: string;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className={titleClass}>{project.name}</h3>
        <Status project={project} label={dict.status[project.status]} />
      </div>

      <p className="mt-3 max-w-3xl leading-relaxed text-light-text">{project.description}</p>
      {project.detail && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-text">{project.detail}</p>
      )}

      <TechChips tech={project.tech} />
      <ProjectLinks project={project} dict={dict} locale={locale} />
    </>
  );
}

export default function Work({ dict, github, locale }: WorkProps) {
  const [featured, ...rest] = dict.projects;

  return (
    <section id="work" className="border-b border-hairline py-16 md:py-24">
      <div className="container">
        <SectionHeader number="01" title={dict.title} />

        <div className="space-y-4 stagger-80" data-reveal data-stagger>
          {featured && (
            <Spotlight
              style={{ "--stagger-index": 0 } as CSSProperties}
              className={`${cardBase} grid gap-8 md:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12`}
            >
              <div className="min-w-0">
                <p className="mb-3 font-mono text-sm font-medium text-note" dir="ltr" aria-hidden="true">
                  01
                </p>
                <ProjectBody
                  project={featured}
                  dict={dict}
                  locale={locale}
                  titleClass="font-mono text-h3 font-semibold break-words text-dark-text"
                />
              </div>

              {featured.stats && (
                <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-lg border border-hairline bg-hairline">
                  {featured.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse gap-1 bg-page p-5">
                      <dt className="font-mono text-xs tracking-wide text-light-text uppercase">
                        {stat.label}
                      </dt>
                      <dd className="font-mono text-3xl font-semibold text-note" dir="ltr">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </Spotlight>
          )}

          {rest.map((project, index) => (
            <Spotlight
              key={project.id}
              style={{ "--stagger-index": index + 1 } as CSSProperties}
              className={`${cardBase} grid gap-x-6 gap-y-1 md:grid-cols-[3rem_minmax(0,1fr)]`}
            >
              <p
                className="font-mono text-sm font-medium text-note max-md:mb-2 md:pt-1"
                dir="ltr"
                aria-hidden="true"
              >
                {String(index + 2).padStart(2, "0")}
              </p>
              <div className="min-w-0">
                <ProjectBody
                  project={project}
                  dict={dict}
                  locale={locale}
                  titleClass="font-mono text-lg font-semibold break-words text-dark-text"
                />
              </div>
            </Spotlight>
          ))}
        </div>

        <div className="mt-16 print:hidden">
          <div className="flex items-center gap-3">
            <p className="font-mono text-xs font-medium tracking-wide whitespace-nowrap text-signal uppercase">
              {dict.liveLabel}
            </p>
            <div className="h-px flex-1 bg-hairline" aria-hidden="true"></div>
          </div>
          <div className="mt-6">
            <GitHubProjects locale={locale} dict={github} />
          </div>
        </div>
      </div>
    </section>
  );
}
