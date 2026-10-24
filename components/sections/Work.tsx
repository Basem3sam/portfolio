import type { CSSProperties } from "react";
import GitHubProjects from "@/components/github/GitHubProjects";
import Icon, { type IconName } from "@/components/ui/Icon";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import SitePreview from "@/components/ui/SitePreview";
import Spotlight from "@/components/ui/Spotlight";
import WorkKpis from "@/components/sections/WorkPlates";
import WorkMotion from "@/components/sections/WorkMotion";
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
import "@/components/ui/KpiLedger.css";
import "./Work.css";

type WorkProps = {
  dict: Dictionary["work"];
  github: Dictionary["github"];
  locale: Locale;
};

type Project = Dictionary["work"]["projects"][number];

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

// Status is a four-segment meter plus a word. Only "production" carries the
// status colour (colour means "this is live"); the other states stay neutral:
// half lit while still being built, fully lit when finished, outlined for the
// academic project.
/** Splits "100+" into "100" and a honey-coloured "+" (or "%" — "94.8%"). */
function StatValue({ value }: { value: string }) {
  const match = /^(.*?)([+%])$/.exec(value);
  if (!match) return value;
  return (
    <>
      {match[1]}
      <em>{match[2]}</em>
    </>
  );
}

/**
 * Decorative micro-graphic at the foot of a KPI tile (mockup rev 21). The
 * shapes are bespoke per fact — HTTP verbs, a segment meter, avatars — so
 * they are keyed by tile position; the facts themselves always come from the
 * dictionary. Everything here is aria-hidden and informational text lives in
 * the tile's dt/dd.
 */
function KpiGraphic({ index }: { index: number }) {
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

  if (index === 4) {
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

  // Segment meters: collections (12) and services (17) light every segment;
  // statement coverage lights 19 of 20, which is 94.8% rounded to a twentieth.
  const segments = index === 1 ? 12 : index === 2 ? 17 : 20;
  const lit = index === 3 ? 19 : segments;
  return (
    <span className={`pt-v pv-s${index === 1 ? " pv-k" : ""}`} aria-hidden="true">
      {Array.from({ length: segments }, (_, k) => (
        <i key={k} className={k < lit ? "on" : undefined} style={{ "--k": k } as CSSProperties}></i>
      ))}
    </span>
  );
}

function StatusBadge({ project, dict }: { project: Project; dict: Dictionary["work"] }) {
  const live = project.status === "production";
  return (
    <span className={`status-tag status-${project.status}`}>
      {/* Four segments, like the KPI meters: how far along the project is. */}
      <span className="meter" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </span>
      <span className={live ? "text-status" : undefined}>{dict.status[project.status]}</span>
    </span>
  );
}

/** Index, status badge and (for cards that link out) the arrow, on one line. */
function Eyebrow({
  project,
  dict,
  index,
  arrow,
}: {
  project: Project;
  dict: Dictionary["work"];
  index: number;
  arrow?: boolean;
}) {
  return (
    <div className="eyebrow">
      <span className="rx" aria-hidden="true" dir="ltr">
        {String(index).padStart(2, "0")}
      </span>
      <StatusBadge project={project} dict={dict} />
      {arrow && (
        <span className="go" aria-hidden="true">
          <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
        </span>
      )}
    </div>
  );
}

/** Who it was for and when, or how it came about: one quiet line. */
function metaOf(project: Project) {
  return [project.org, project.period, project.provenance].filter(Boolean).join(" · ");
}

/**
 * The decorative plate: a dark-in-dark / recessed-in-light panel holding the
 * project's request path (numbered steps) or grouped services, plus an
 * optional caption and two figure facts. Hidden from assistive tech — the
 * same facts are readable in the description and KPI tiles.
 */
function Plate({ project }: { project: Project }) {
  const plate = project.plate;
  if (!plate) return null;

  return (
    <figure className="plate" aria-hidden="true">
      <div className="plate-head">
        <span className="slug">{project.name}</span>
      </div>
      <div className="plate-body">
        {plate.path && (
          <ol className="rpath">
            {plate.path.map((node, index) => (
              <li
                key={node.label}
                className={node.hot ? "hot" : node.live ? "live" : undefined}
                style={{ "--i": index } as CSSProperties}
              >
                {node.label}
              </li>
            ))}
          </ol>
        )}
        {plate.group && (
          <ul className="rgroup" data-cap={plate.groupCaption}>
            {plate.group.map((node) => (
              <li key={node.label} className={node.hot ? "hot" : undefined}>
                {node.label}
              </li>
            ))}
          </ul>
        )}
        <p className="plate-cap">{plate.caption}</p>
        {plate.foot && (
          <div className="plate-foot">
            {plate.foot.map((fact) => (
              <div key={fact.label}>
                <b>{fact.value}</b>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
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

/** The link a whole row stretches over: the live site, else the repository. */
function rowHref(project: Project): string | undefined {
  const links = projectLinks[project.id] ?? {};
  return links.live ?? links.repo;
}

/** First sentence leads the card; the rest waits behind "Details". */
function splitLead(text: string) {
  const match = /^(.+?[.!?؟])\s+([\s\S]*)$/.exec(text);
  return match ? { lead: match[1], rest: match[2] } : { lead: text, rest: "" };
}

function More({
  rest,
  detail,
  label,
}: {
  rest: string;
  detail?: string;
  label: string;
}) {
  if (!rest && !detail) return null;
  return (
    <details className="disc">
      <summary>
        <span>{label}</span>
        <span className="chev" aria-hidden="true">
          <Icon name="arrowDown" className="size-4" />
        </span>
      </summary>
      <div className="disc-body">
        {rest && <p>{rest}</p>}
        {detail && <p className="sub">{detail}</p>}
      </div>
    </details>
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

function Row({
  project,
  dict,
  index,
}: {
  project: Project;
  dict: Dictionary["work"];
  index: number;
}) {
  const href = rowHref(project);
  const live = projectLinks[project.id]?.live;
  const { lead, rest } = splitLead(project.description);
  const meta = metaOf(project);

  return (
    <>
      <div className="row-media">
        <div className="media-stack">
          {live && <SitePreview url={live} label={dict.viewLive} />}
          <Plate project={project} />
        </div>
      </div>
      <div className="row-body">
        <Eyebrow project={project} dict={dict} index={index} arrow={Boolean(href)} />
        <h3>
          {href ? (
            <a
              className="stretch"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h3>
        {meta && <p className="meta">{meta}</p>}
        <p className="desc">{lead}</p>
      </div>
      <div className="row-foot">
        <TechList tech={project.tech} />
        <ProjectActions project={project} dict={dict} />
      </div>
      <More rest={rest} detail={project.detail} label={dict.projectDetails} />
    </>
  );
}

export default function Work({ dict, github, locale }: WorkProps) {
  const [featured, ...rest] = dict.projects;
  const featuredText = splitLead(featured?.description ?? "");

  return (
    <section id="work" className="sec sec-wash">
      <WorkMotion />
      <SectionHeader number="01" title={dict.title} lead={dict.lead} />

      {featured && (
        <div data-reveal className="spread-wrap">
          <Spotlight className="spread spotlight">
            <div className="spread-copy">
              <Eyebrow project={featured} dict={dict} index={1} />
              <h3 className="spread-title">{featured.title ?? featured.name}</h3>
              <span className="slug">{featured.name}</span>
              <p className="meta">{metaOf(featured)}</p>
              <p className="desc">{featuredText.lead}</p>
              <TechList tech={featured.tech} />

              <div className="actions">
                <Link
                  className="btn btn-primary"
                  href={locale === "ar" ? "/ar/work/trosc" : "/work/trosc"}
                >
                  {dict.caseStudy}
                  <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
                </Link>
                {projectLinks[featured.id]?.repo && (
                  <a
                    className="btn btn-ghost"
                    href={projectLinks[featured.id].repo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="github" className="size-4" />
                    {dict.viewRepo}
                  </a>
                )}
                {projectLinks[featured.id]?.live && (
                  <a
                    className="btn btn-ghost"
                    href={projectLinks[featured.id].live}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-peek=""
                  >
                    <Icon name="externalLink" className="size-4" />
                    {dict.viewLive}
                  </a>
                )}
              </div>
              <More
                  rest={featuredText.rest}
                  detail={featured.detail}
                  label={dict.projectDetails}
                />
            </div>

            <div className="spread-media">
              <div className="media-stack">
                <Plate project={featured} />
                {projectLinks[featured.id]?.live && (
                  <SitePreview
                    url={projectLinks[featured.id].live as string}
                    label={dict.viewLive}
                  />
                )}
              </div>
            </div>

            {featured.stats && (
              <WorkKpis>
                {featured.stats.map((stat, index) => (
                  <div key={stat.label} className={`kpi${index === 3 ? " kpi-cov" : ""}`}>
                    <dt>{stat.label}</dt>
                    <dd>
                      <StatValue value={stat.value} />
                    </dd>
                    <KpiGraphic index={index} />
                  </div>
                ))}
              </WorkKpis>
            )}
          </Spotlight>
        </div>
      )}

      <div className="rows stagger-80" data-reveal data-stagger>
        {rest.map((project, index) => (
          <Spotlight
            key={project.id}
            className={`row spotlight${rowHref(project) ? " is-link" : ""}${
              rest
                .slice(Math.floor(index / 2) * 2, Math.floor(index / 2) * 2 + 2)
                .some((peer) => projectLinks[peer.id]?.live)
                ? " media-tall"
                : ""
            }`}
            style={{ "--stagger-index": index } as CSSProperties}
          >
            <Row project={project} dict={dict} index={index + 2} />
          </Spotlight>
        ))}
      </div>

      <div className="live-block print:hidden">
        <div className="live-head">
          <span className="lbl live-lbl">
            <span className="live-dot" aria-hidden="true"></span>
            {dict.liveLabel}
          </span>
          <span className="live-rule" aria-hidden="true"></span>
          <a className="pillbtn" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="github" className="size-4" />
            {dict.viewProfile}
            <Icon name="externalLink" className="size-4" />
          </a>
        </div>
        <GitHubProjects locale={locale} dict={github} />
        <p className="quiet">{dict.moreOnGithubText}</p>
      </div>
    </section>
  );
}
