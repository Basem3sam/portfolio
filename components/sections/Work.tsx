import type { CSSProperties } from "react";
import GitHubProjects from "@/components/github/GitHubProjects";
import Icon, { type IconName } from "@/components/ui/Icon";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import SitePreview from "@/components/ui/SitePreview";
import Spotlight from "@/components/ui/Spotlight";
import WorkDetails from "@/components/sections/WorkDetails";
import WorkScroll from "@/components/sections/WorkScroll";
import WorkStat from "@/components/sections/WorkStat";
import WorkTilt from "@/components/sections/WorkTilt";
import {
  GITHUB_URL,
  LARAVEL_REPO_URL,
  NEUROSCAN_REPO_URL,
  TROSC_REPO_URL,
  TROSC_URL,
  ZABTHALAHAK_BACKEND_REPO_URL,
  ZABTHALAHAK_FRONTEND_REPO_URL,
  ZABTHALAHAK_URL,
} from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import "./Work.css";

type WorkProps = {
  dict: Dictionary["work"];
  github: Dictionary["github"];
  locale: Locale;
};

type Project = Dictionary["work"]["projects"][number];

type Stop = { label: string; note?: string; tag?: string; hot?: boolean; live?: boolean };

type ProjectLinks = {
  repo?: string;
  /** Several repositories, each with its own label (split frontend / backend). */
  repos?: { href: string; label: "viewFrontend" | "viewBackend" }[];
  live?: string;
};

const projectLinks: Record<string, ProjectLinks> = {
  trosc: { repo: TROSC_REPO_URL, live: TROSC_URL },
  zabthalahak: {
    live: ZABTHALAHAK_URL,
    repos: [
      { href: ZABTHALAHAK_FRONTEND_REPO_URL, label: "viewFrontend" },
      { href: ZABTHALAHAK_BACKEND_REPO_URL, label: "viewBackend" },
    ],
  },
  laravel: { repo: LARAVEL_REPO_URL },
  neuroscan: { repo: NEUROSCAN_REPO_URL },
};

/** One glyph per state, so the status reads at a glance without a badge. */
const statusIcons: Record<Project["status"], IconName> = {
  production: "activity",
  development: "gitBranch",
  complete: "checkCircle",
  academic: "layers",
  research: "code",
};

/**
 * Where the project stands: a small glyph and a word, set as plain text. Only
 * "In production" carries the status colour (colour means "this is live").
 */
function Status({ project, dict }: { project: Project; dict: Dictionary["work"] }) {
  const live = project.status === "production";
  return (
    <span className={`status status-${project.status}`}>
      <Icon name={statusIcons[project.status]} className="status-ico size-4" />
      <span className={live ? "text-status" : undefined}>{dict.status[project.status]}</span>
    </span>
  );
}

/** Who it was for and when, or how it came about: short facts, one per line. */
function Meta({ project }: { project: Project }) {
  const parts = [project.org, project.period, project.provenance].filter(
    (part): part is string => Boolean(part),
  );
  if (parts.length === 0) return null;
  return (
    <p className="meta">
      {parts.map((part) => (
        <span key={part}>{part}</span>
      ))}
    </p>
  );
}

/**
 * A request's route through the system, one stop per layer, on a rail. A bright
 * packet travels down it on a loop and each stop glows as it passes. Decorative:
 * every fact here is also in the description, so it is hidden from assistive tech.
 */
function Trace({ project }: { project: Project }) {
  const plate = project.plate;
  const stops: Stop[] = plate?.path ?? [];
  if (!plate || stops.length === 0) return null;

  return (
    <figure
      className="trace"
      aria-hidden="true"
      data-reveal
      style={{ "--n": stops.length } as CSSProperties}
    >
      <figcaption className="trace-head">
        <span className="trace-ping" />
        {plate.caption}
      </figcaption>
      <div className="trace-run">
        <span className="packet" />
        <ol className="trace-list">
          {stops.map((stop, index) => {
            const kind = stop.hot ? "hot" : stop.live ? "live" : undefined;
            return (
              <li key={stop.label} className={kind} style={{ "--i": index } as CSSProperties}>
                <span className="t-dot" />
                <span className="t-name">{stop.label}</span>
                {stop.note && <span className="t-note">{stop.note}</span>}
                {stop.tag && <span className="t-tag">{stop.tag}</span>}
              </li>
            );
          })}
        </ol>
      </div>
      {plate.foot && (
        <div className="trace-foot">
          {plate.foot.map((fact) => (
            <div key={fact.label}>
              <b>{fact.value}</b>
              <span>{fact.label}</span>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}

/**
 * A system made of parts, not a path: each part is a tile (or, beside a live
 * preview, a floating pill). Decorative, like the trace.
 */
function Modules({ project, compact = false }: { project: Project; compact?: boolean }) {
  const plate = project.plate;
  const parts: Stop[] = plate?.group ?? [];
  if (!plate || parts.length === 0) return null;

  return (
    <figure
      className={`mods${compact ? " mods-pills" : ""}`}
      aria-hidden="true"
      data-reveal
      style={{ "--n": parts.length } as CSSProperties}
    >
      {!compact && (
        <figcaption className="trace-head">
          <span className="trace-ping" />
          {plate.groupCaption ?? plate.caption}
        </figcaption>
      )}
      <ul>
        {parts.map((part, index) => (
          <li
            key={part.label}
            className={part.hot ? "hot" : undefined}
            style={{ "--i": index } as CSSProperties}
          >
            <span className="m-top">
              <b>{part.label}</b>
              {part.tag && <span className="m-tag">{part.tag}</span>}
            </span>
            {!compact && part.note && <span className="m-note">{part.note}</span>}
          </li>
        ))}
      </ul>
    </figure>
  );
}

function TechList({ tech }: { tech: string[] }) {
  return (
    <ul className="stk" dir="ltr">
      {tech.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

/** First sentence leads the card; the rest waits in the details sheet. */
function splitLead(text: string) {
  const match = /^(.+?[.!?؟])\s+([\s\S]*)$/.exec(text);
  return match ? { lead: match[1], rest: match[2] } : { lead: text, rest: "" };
}

function Details({ rest, detail, label }: { rest: string; detail?: string; label: string }) {
  if (!rest && !detail) return null;
  return (
    <WorkDetails label={label}>
      {rest && <p>{rest}</p>}
      {detail && <p className="note">{detail}</p>}
    </WorkDetails>
  );
}

/** The link a whole card stretches over: the live site, else the repository. */
function cardHref(project: Project): string | undefined {
  const links = projectLinks[project.id] ?? {};
  return links.live ?? links.repo;
}

function ProjectActions({ project, dict }: { project: Project; dict: Dictionary["work"] }) {
  const links = projectLinks[project.id] ?? {};
  const items: { href: string; label: string; icon: IconName }[] = [];

  if (project.actions?.includes("repo") && links.repo) {
    items.push({ href: links.repo, label: dict.viewRepo, icon: "github" });
  }
  if (project.actions?.includes("repo")) {
    for (const repo of links.repos ?? []) {
      items.push({ href: repo.href, label: dict[repo.label], icon: "github" });
    }
  }
  if (project.actions?.includes("live") && links.live) {
    items.push({ href: links.live, label: dict.viewLive, icon: "externalLink" });
  }
  if (items.length === 0) return null;

  return (
    <div className="actions">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          data-peek={item.icon === "externalLink" ? "" : undefined}
        >
          <Icon name={item.icon} className="size-4" />
          {item.label}
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The flagship                                                        */
/* ------------------------------------------------------------------ */

function Featured({
  project,
  dict,
  locale,
}: {
  project: Project;
  dict: Dictionary["work"];
  locale: Locale;
}) {
  const links = projectLinks[project.id] ?? {};
  const { lead, rest } = splitLead(project.description);

  return (
    <div className="feat-wrap" data-px data-pause>
      <Spotlight className="feat spotlight">
        <div className="feat-aurora" aria-hidden="true" />
        <div className="feat-rings" aria-hidden="true" />
        <div className="feat-grain" aria-hidden="true" />

        <div className="feat-copy">
          <Status project={project} dict={dict} />
          <h3 className="feat-title">{project.title ?? project.name}</h3>
          <span className="slug">{project.name}</span>
          <Meta project={project} />
          <p className="desc">{lead}</p>
          <TechList tech={project.tech} />
          <div className="actions">
            <Link
              className="btn btn-primary"
              href={locale === "ar" ? "/ar/work/trosc" : "/work/trosc"}
            >
              {dict.caseStudy}
              <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
            </Link>
            {links.repo && (
              <a
                className="btn btn-ghost"
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="github" className="size-4" />
                {dict.viewRepo}
              </a>
            )}
            {links.live && (
              <a
                className="btn btn-ghost"
                href={links.live}
                target="_blank"
                rel="noopener noreferrer"
                data-peek=""
              >
                <Icon name="externalLink" className="size-4" />
                {dict.viewLive}
              </a>
            )}
          </div>
          <div className="feat-more">
            <Details rest={rest} detail={project.detail} label={dict.projectDetails} />
          </div>
        </div>

        <WorkTilt className="feat-art">
          {links.live && (
            <div className="depth depth-a">
              <div className="art-window">
                <SitePreview url={links.live} label={dict.viewLive} />
              </div>
            </div>
          )}
          <div className="depth depth-b">
            <div className="art-trace">
              <Trace project={project} />
            </div>
          </div>
        </WorkTilt>

        {project.stats && (
          <dl className="facts" data-n={project.stats.length}>
            {project.stats.map((stat) => (
              <div key={stat.label} className="fact">
                <dt>{stat.label}</dt>
                <dd>
                  <WorkStat value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Spotlight>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The other projects                                                  */
/* ------------------------------------------------------------------ */

function Visual({ project, dict }: { project: Project; dict: Dictionary["work"] }) {
  const live = projectLinks[project.id]?.live;
  if (live) {
    return (
      <>
        <SitePreview url={live} label={dict.viewLive} />
        <Modules project={project} compact />
      </>
    );
  }
  return project.plate?.group ? <Modules project={project} /> : <Trace project={project} />;
}

function Card({
  project,
  dict,
  index,
}: {
  project: Project;
  dict: Dictionary["work"];
  index: number;
}) {
  const href = cardHref(project);
  const { lead, rest } = splitLead(project.description);

  return (
    <div
      className="card-wrap"
      data-reveal
      data-px
      data-pause
      data-project={project.id}
      style={{ "--c": index } as CSSProperties}
    >
      <Spotlight className={`card spotlight${href ? " is-link" : ""}`}>
        <div className="stage">
          <Visual project={project} dict={dict} />
        </div>

        <div className="card-main">
          <div className="card-head">
            <Status project={project} dict={dict} />
            {href && (
              <span className="go" aria-hidden="true">
                <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
              </span>
            )}
          </div>
          <h3>
            {href ? (
              <a className="stretch" href={href} target="_blank" rel="noopener noreferrer">
                {project.name}
              </a>
            ) : (
              project.name
            )}
          </h3>
          <Meta project={project} />
          <p className="desc">{lead}</p>
          <TechList tech={project.tech} />
          <div className="card-bar">
            <ProjectActions project={project} dict={dict} />
            <Details rest={rest} detail={project.detail} label={dict.projectDetails} />
          </div>
        </div>
      </Spotlight>
    </div>
  );
}

export default function Work({ dict, github, locale }: WorkProps) {
  const [featured, ...rest] = dict.projects;

  return (
    <section id="work" className="sec sec-wash">
      <WorkScroll />
      <SectionHeader number="01" title={dict.title} lead={dict.lead} />

      {featured && <Featured project={featured} dict={dict} locale={locale} />}

      <div className="cards">
        {rest.map((project, index) => (
          <Card key={project.id} project={project} dict={dict} index={index} />
        ))}
      </div>

      <div className="live-block print:hidden">
        <div className="live-head">
          <h3 className="live-lbl">{dict.liveLabel}</h3>
          <a className="live-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <span>{dict.viewProfile}</span>
            <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
          </a>
        </div>
        <GitHubProjects locale={locale} dict={github} />
      </div>
    </section>
  );
}
