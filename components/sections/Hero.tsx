import CountUp from "@/components/ui/CountUp";
import Icon, { type IconName } from "@/components/ui/Icon";
import ProfileImage from "@/components/ui/ProfileImage";
import { CV_PATH, GITHUB_URL, LINKEDIN_URL, MAILTO, PHONE_TEL } from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";

type HeroProps = {
  dict: Dictionary["hero"];
};

const socialLink =
  "flex size-11 items-center justify-center rounded-md border border-hairline bg-surface text-light-text no-underline transition-colors duration-200 hover:border-signal hover:text-signal";

const primaryCta =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-on-secondary no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7e3907] hover:shadow-md active:translate-y-0 max-sm:w-full dark:hover:bg-[#fcd34d]";

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
  const socials: Social[] = [
    { href: LINKEDIN_URL, icon: "linkedIn", label: dict.socials.linkedin, external: true },
    { href: GITHUB_URL, icon: "github", label: dict.socials.github, external: true },
    { href: MAILTO, icon: "mail", label: dict.socials.email },
    { href: PHONE_TEL, icon: "phone", label: dict.socials.phone },
  ];

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative border-b border-hairline bg-grid pt-28 pb-14 md:pt-32 md:pb-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-ember-glow" aria-hidden="true"></div>

      <div className="container relative z-[1]">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div className="max-lg:order-2 text-center lg:order-1 lg:text-start">
            <p className="font-mono text-sm font-medium text-secondary motion-safe:animate-hero-in-1">
              <span dir="ltr">{dict.whoami}</span>
              <span
                className="ms-1 inline-block h-4 w-2 animate-pulse bg-secondary align-middle motion-reduce:animate-none"
                aria-hidden="true"
              ></span>
            </p>
            <h1
              id="hero-title"
              className="mt-4 text-4xl leading-tight font-bold tracking-tight text-dark-text sm:text-5xl motion-safe:animate-hero-in-2"
            >
              {dict.name}
              <span className="text-secondary" aria-hidden="true">
                .
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-light-text sm:text-xl lg:mx-0 motion-safe:animate-hero-in-3">
              {dict.lead}
            </p>

            <dl className="mx-auto mt-8 grid max-w-lg auto-rows-fr grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-4 lg:mx-0">
              {dict.metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  style={{ animationDelay: `${900 + index * 120}ms` }}
                  className="flex flex-col-reverse items-center justify-between gap-1 bg-surface p-4 text-center transition-colors duration-200 hover:bg-light-bg motion-safe:animate-hero-in-1"
                >
                  <dt className="font-mono text-[11px] leading-snug tracking-wide text-light-text uppercase">
                    {metric.label}
                  </dt>
                  <dd
                    data-testid="metric-value"
                    className="font-mono text-2xl font-semibold text-secondary"
                    dir="ltr"
                  >
                    <CountUp value={metric.value} suffix={metric.suffix} />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-light-text lg:justify-start">
              <span className={statusPill}>
                <span
                  className="size-1.5 animate-pulse rounded-full bg-status motion-reduce:animate-none"
                  aria-hidden="true"
                ></span>
                {dict.status}
              </span>
              <span aria-hidden="true" className="text-muted-text">
                —
              </span>
              <span>{dict.statusDetail}</span>
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
              className="mt-8 flex items-center justify-center gap-2 lg:justify-start"
              aria-label={dict.socialsAria}
            >
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

          <div className="justify-self-center motion-safe:animate-hero-in-1 max-lg:order-1 lg:order-2">
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