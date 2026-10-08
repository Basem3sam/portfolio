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

const statusDot: Record<string, string> = {
  production: "bg-status",
  development: "bg-secondary animate-pulse motion-reduce:animate-none",
  complete: "bg-secondary",
  research: "bg-muted-text",
  academic: "bg-muted-text",
};

const caseStudyLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-on-secondary no-underline transition-colors duration-200 hover:bg-[#8a3f06] dark:hover:bg-[#fcd34d]";

const repoLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline transition-colors duration-200 hover:border-secondary hover:text-secondary";

const liveLink =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-4 text-sm font-medium text-dark-text no-underline transition-colors duration-200 hover:border-secondary hover:text-secondary";

export default function Work({ dict, github, locale }: WorkProps) {
  return (
    <section id="work" className="border-b border-hairline py-16 md:py-24">
      <div className="container">
        <SectionHeader number="01" title={dict.title} />

        <div className="space-y-4">
          {dict.projects.map((project, index) => {
            const links = projectLinks[project.id];
            const showLinks =
              project.id === "trosc" || Boolean(links && (links.repo || links.live));
            return (
              <article
                key={project.id}
                data-reveal
                style={{ animationDelay: `${index * 100}ms` }}
                className="rounded-lg border border-hairline bg-surface p-6 md:p-7 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h3 className="font-mono text-lg font-semibold break-all text-dark-text">
                    {project.name}
                  </h3>
                  <p className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tracking-wide text-light-text uppercase">
                    <span
                      className={`size-2 rounded-full ${statusDot[project.status]}`}
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
                      className="rounded-md border border-hairline px-2.5 py-1 text-sm text-light-text"
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
            <p className="font-mono text-xs font-medium tracking-wide whitespace-nowrap text-muted-text uppercase">
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