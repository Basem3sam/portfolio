import { Fragment } from "react";
import CountUp from "@/components/ui/CountUp";
import Icon, { type IconName } from "@/components/ui/Icon";
import ProfileImage from "@/components/ui/ProfileImage";
import {
  CV_PATH,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";

type HeroProps = {
  dict: Dictionary["hero"];
};

const socialLink =
  "flex size-11 items-center justify-center rounded-md border border-hairline bg-surface text-light-text no-underline transition-colors duration-200 hover:border-signal hover:text-signal";

const primaryCta =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-on-secondary no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-signal hover:shadow-md active:translate-y-0 max-sm:w-full dark:shadow-[0_0_28px_color-mix(in_srgb,var(--c-secondary)_30%,transparent)]";

const ghostCta =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-5 text-sm font-semibold text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md active:translate-y-0 max-sm:w-full";

const statusPill =
  "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-status uppercase shadow-xs";

type Social = {
  href: string;
  icon: IconName;
  label: string;
  external?: boolean;
};

export default function Hero({ dict }: HeroProps) {
  // Two stacked lines. A real space stays between the spans so the h1 still
  // reads "Basem Esam" to assistive tech, search and tests.
  const nameParts = dict.name.split(" ");

  const socials: Social[] = [
    { href: LINKEDIN_URL, icon: "linkedIn", label: dict.socials.linkedin, external: true },
    { href: GITHUB_URL, icon: "github", label: dict.socials.github, external: true },
    { href: MAILTO, icon: "mail", label: dict.socials.email },
  ];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative border-b border-hairline bg-grid pt-28 pb-14 md:pt-32 md:pb-20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-ember-glow motion-safe:animate-glow-breathe"
        aria-hidden="true"
      ></div>

      <div className="relative z-[1] container">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div className="text-center max-lg:order-2 lg:order-1 lg:text-start">
            <p className="flex items-center gap-3 font-mono text-sm font-medium text-note motion-safe:animate-hero-in-1 max-lg:justify-center">
              <span dir="ltr">{dict.whoami}</span>
              <span className="h-px w-10 bg-rule-strong" aria-hidden="true"></span>
              <span className="inline-flex items-center gap-1.5 text-light-text">
                <span className="size-1.5 rounded-full bg-note" aria-hidden="true"></span>
                {dict.location}
              </span>
            </p>
            <h1
              id="hero-title"
              className="mt-4 text-wordmark font-bold tracking-tighter text-dark-text motion-safe:animate-hero-in-2"
            >
              {nameParts.map((part, index) => (
                <Fragment key={part}>
                  {index > 0 && " "}
                  <span className="block">
                    {part}
                    {index === nameParts.length - 1 && (
                      <span
                        className="ms-[0.12em] inline-block h-[0.72em] w-[0.1em] animate-pulse bg-note align-baseline motion-reduce:animate-none"
                        aria-hidden="true"
                      ></span>
                    )}
                  </span>
                </Fragment>
              ))}
            </h1>
            <p className="mt-3 text-h3 font-medium text-light-text motion-safe:animate-hero-in-2">
              {dict.role}
            </p>
            <p className="mx-auto mt-6 max-w-xl text-lead text-light-text motion-safe:animate-hero-in-3 lg:mx-0">
              {dict.lead}
            </p>

            <dl className="mx-auto mt-8 grid max-w-lg auto-rows-fr grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-4 lg:mx-0">
              {dict.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  // Metric tiles are the largest painted hero block, so they are
                  // frequently the LCP element. Keeping this cascade just behind
                  // the lead paragraph (320ms) preserves the stagger without
                  // parking them in an opacity:0 state long enough to cost LCP.
                  style={{ animationDelay: `${440 + index * 70}ms` }}
                  className="flex flex-col-reverse items-center justify-between gap-1 bg-surface p-4 text-center transition-colors duration-200 hover:bg-light-bg motion-safe:animate-hero-in-1"
                >
                  <dt className="font-mono text-[11px] leading-snug tracking-wide text-light-text uppercase">
                    {metric.label}
                  </dt>
                  <dd
                    data-testid="metric-value"
                    className="font-mono text-2xl font-semibold text-note"
                    dir="ltr"
                  >
                    <CountUp value={metric.value} suffix={metric.suffix} />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 flex flex-col items-center gap-2 text-sm text-light-text lg:items-start xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-3">
              <span className={statusPill}>
                <span
                  className="size-1.5 animate-pulse rounded-full bg-status motion-reduce:animate-none"
                  aria-hidden="true"
                ></span>
                {dict.status}
              </span>
              <span aria-hidden="true" className="hidden text-muted-text xl:inline">
                —
              </span>
              {/* Split on the dictionary's " · " so a wrap never starts a line with the dot. */}
              <span className="flex flex-col items-center gap-0.5 text-center lg:items-start lg:text-start xl:flex-row xl:gap-x-2">
                {dict.statusDetail.split(" · ").map((part, index) => (
                  <Fragment key={part}>
                    {index > 0 && (
                      <span aria-hidden="true" className="hidden text-muted-text xl:inline">
                        ·
                      </span>
                    )}
                    <span className="text-balance">{part}</span>
                  </Fragment>
                ))}
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a href="#work" className={`${primaryCta} group`}>
                {dict.viewWork}
                <Icon
                  name="arrowRight"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </a>
              <a href={CV_PATH} download className={ghostCta}>
                <Icon name="fileDown" className="size-4" />
                {dict.downloadCv}
              </a>
            </div>

            <ul
              className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
              aria-label={dict.socialsAria}
            >
              <li>
                <a
                  href={PHONE_TEL}
                  aria-label={dict.socials.phone}
                  dir="ltr"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md pe-3 font-mono text-sm font-medium text-dark-text no-underline transition-colors duration-200 hover:text-signal"
                >
                  <Icon name="phone" className="size-4 text-note" />
                  {PHONE_DISPLAY}
                </a>
              </li>
              {socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noopener noreferrer" : undefined}
                    className={socialLink}
                  >
                    <Icon name={social.icon} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-halo justify-self-center motion-safe:animate-hero-in-1 max-lg:order-1 lg:order-2">
            <ProfileImage
              alt="Basem Esam — Backend Developer"
              imgClassName="size-[240px] max-lg:size-[184px] max-md:size-[168px] max-xs:size-[140px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
