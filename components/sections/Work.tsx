import type { CSSProperties } from "react";
import GitHubProjects from "@/components/github/GitHubProjects";
import Icon, { type IconName } from "@/components/ui/Icon";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import SitePreview from "@/components/ui/SitePreview";
import Spotlight from "@/components/ui/Spotlight";
import WorkKpis from "@/components/sections/WorkPlates";
import {
  GITHUB_URL,
  LARAVEL_REPO_URL,
  NEUROSCAN_REPO_URL,
  TROSC_REPO_URL,
  TROSC_URL,
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

const projectLinks: Record<string, { repo?: string; live?: string }> = {
  trosc: { repo: TROSC_REPO_URL, live: TROSC_URL },
  zabthalahak: { live: ZABTHALAHAK_URL },
  laravel: { repo: LARAVEL_REPO_URL },
  neuroscan: { repo: NEUROSCAN_REPO_URL },
};

// Status is a dot plus a word. Only "production" carries the status colour:
// colour means "this is live". The other states stay neutral (hollow = still
// being built, solid grey = finished or academic), and the academic row drops
// the dot entirely, exactly like the mockup template.
const STATUS_LABEL_CLASS: Record<Project["status"], string> = {
  production: "st st-live text-status",
  development: "st st-dev",
  complete: "st st-done",
  research: "st st-done",
  academic: "st st-done",
};

const STATUS_DOT_CLASS: Record<Project["status"], string> = {
  production: "dot",
  development: "dot dot-dev",
  complete: "dot dot-done",
  research: "dot dot-done",
  academic: "dot dot-done",
};

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

function Prov({
  project,
  dict,
  withDot,
  org,
  period,
}: {
  project: Project;
  dict: Dictionary["work"];
  withDot: boolean;
  org?: string;
  period?: string;
}) {
  const statusLabel = (
    <span className={STATUS_LABEL_CLASS[project.status]}>{dict.status[project.status]}</span>
  );

  return (
    <p className="prov">
      {withDot ? (
        <span className="status">
          <span className={STATUS_DOT_CLASS[project.status]} aria-hidden="true"></span>
          {statusLabel}
        </span>
      ) : (
        statusLabel
      )}
      {org && (
        <>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <span>{org}</span>
        </>
      )}
      {period && (
        <>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <span>{period}</span>
        </>
      )}
      {project.provenance && (
        <>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <span>{project.provenance}</span>
        </>
      )}
    </p>
  );
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

  return (
    <>
      <span className="rx" aria-hidden="true" dir="ltr">
        {String(index).padStart(2, "0")}
      </span>
      <div className="row-media">
        <Plate project={project} />
        {projectLinks[project.id]?.live && (
          <SitePreview url={projectLinks[project.id].live as string} label={dict.viewLive} />
        )}
      </div>
      <div>
        <Prov project={project} dict={dict} withDot={project.status !== "academic"} />
        <h3>
          {href ? (
            <a
              className="stretch"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-peek={href === projectLinks[project.id]?.live ? "" : undefined}
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h3>
        <p className="desc">{project.description}</p>
        {project.detail && <p className="sub">{project.detail}</p>}
        <TechList tech={project.tech} />
        <ProjectActions project={project} dict={dict} />
      </div>
      {href && (
        <span className="go" aria-hidden="true">
          <Icon name="arrowRight" className="size-4" />
        </span>
      )}
    </>
  );
}

export default function Work({ dict, github, locale }: WorkProps) {
  const [featured, ...rest] = dict.projects;

  return (
    <section id="work" className="sec sec-wash">
      <SectionHeader number="01" title={dict.title} lead={dict.lead} />

      {featured && (
        <div data-reveal className="spread-wrap">
          <Spotlight className="spread spotlight">
            <div>
              <Prov
                project={featured}
                dict={dict}
                withDot
                org={featured.org}
                period={featured.period}
              />
              <h3 className="spread-title">{featured.title ?? featured.name}</h3>
              <span className="slug">{featured.name}</span>
              <p className="desc">{featured.description}</p>

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
            </div>
            <div className="spread-media">
              <Plate project={featured} />
              {projectLinks[featured.id]?.live && (
                <SitePreview
                  url={projectLinks[featured.id].live as string}
                  label={dict.viewLive}
                />
              )}
            </div>
          </Spotlight>
        </div>
      )}

      <div className="rows stagger-80" data-reveal data-stagger>
        {rest.map((project, index) => (
          <Spotlight
            key={project.id}
            className="row spotlight"
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
