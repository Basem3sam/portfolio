import type { CSSProperties } from "react";
import GitHubProjects from "@/components/github/GitHubProjects";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import Link from "next/link";
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

const statusPill: Record<string, string> = {
  production:
    "bg-[rgba(22,101,52,0.1)] text-[#166534] dark:bg-[rgba(74,222,128,0.12)] dark:text-[#4ade80]",
  development:
    "bg-[rgba(163,72,9,0.08)] text-[#a34809] dark:bg-[rgba(251,191,36,0.1)] dark:text-[#fbbf24]",
  complete:
    "bg-[rgba(163,72,9,0.14)] text-[#7e3907] dark:bg-[rgba(251,191,36,0.16)] dark:text-[#fde68a]",
  research:
    "bg-[rgba(106,98,82,0.12)] text-[#5a5244] dark:bg-[rgba(184,188,199,0.12)] dark:text-[#b8bcc7]",
  academic:
    "bg-[rgba(106,98,82,0.12)] text-[#5a5244] dark:bg-[rgba(184,188,199,0.12)] dark:text-[#b8bcc7]",
};

const statusDot: Record<string, string> = {
  production: "bg-status",
  development: "animate-pulse motion-reduce:animate-none",
  complete: "",
  research: "",
  academic: "",
};

const caseStudyLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-on-secondary no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7e3907] hover:shadow-md dark:hover:bg-[#fcd34d] dark:shadow-[0_0_28px_rgba(251,191,36,0.22)]";

const repoLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md";

const liveLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md";

export default function Work({ dict, github, locale }: WorkProps) {
  return (
    <section id="work" className="border-b border-hairline py-16 md:py-24">
      <div className="container">
        <SectionHeader number="01" title={dict.title} />

        <div className="space-y-4 stagger-80" data-reveal data-stagger>
          {dict.projects.map((project, index) => {
            const links = projectLinks[project.id];
            const showLinks =
              project.id === "trosc" || Boolean(links && (links.repo || links.live));
            return (
              <article
                key={project.id}
                style={{ "--stagger-index": index } as CSSProperties}
                className="rounded-lg border border-hairline bg-surface p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:border-signal focus-visible:shadow-md md:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h3 className="font-mono text-lg font-semibold break-words text-dark-text">
                    {project.name}
                  </h3>
                  <p
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide uppercase ${statusPill[project.status]}`}
                  >
                    <span
                      className={`size-1.5 rounded-full bg-current ${statusDot[project.status]}`}
                      aria-hidden="true"
                    ></span>
                    {dict.status[project.status]}
                  </p>
                </div>

                <p className="mt-3 max-w-3xl leading-relaxed text-light-text">
                  {project.description}
                </p>
                {project.detail && (
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-text">
                    {project.detail}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-hairline px-2.5 py-1 text-sm text-light-text transition-colors duration-200 hover:border-signal hover:text-signal"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {showLinks && (
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
                      <a
                        href={links.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={repoLink}
                      >
                        <Icon name="github" className="size-4" />
                        {dict.viewRepo}
                      </a>
                    )}
                    {links?.live && (
                      <a
                        href={links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={liveLink}
                      >
                        <Icon name="externalLink" className="size-4" />
                        {dict.viewLive}
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
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