import CairoClock from "@/components/ui/CairoClock";
import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  CV_PATH,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";

type ContactProps = {
  dict: Dictionary["contact"];
};

const primaryCta =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 text-sm font-semibold text-on-secondary no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7e3907] hover:shadow-md active:translate-y-0 max-sm:w-full dark:hover:bg-[#fcd34d] dark:shadow-[0_0_28px_rgba(251,191,36,0.22)]";

const ghostCta =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-5 text-sm font-semibold text-dark-text no-underline shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-md active:translate-y-0 max-sm:w-full";

const statusPill =
  "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-status uppercase shadow-xs";

const socialLink =
  "flex size-11 items-center justify-center rounded-md border border-hairline bg-surface text-light-text no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-xs";

const baseRow =
  "group relative flex min-h-16 items-center gap-4 border-b border-hairline px-5 py-4 last:border-b-0 md:px-6";

const interactiveRow = "no-underline transition-colors duration-200 hover:bg-light-bg";

const tile = "flex size-11 shrink-0 items-center justify-center rounded-md";

type Row = {
  icon: IconName;
  tint: string;
  label: string;
  value: string;
  href?: string;
  ltr?: boolean;
  clock?: boolean;
};

export default function Contact({ dict }: ContactProps) {
  const rows: Row[] = [
    {
      icon: "mail",
      tint: "bg-[rgba(163,72,9,0.08)] text-secondary dark:bg-[rgba(251,191,36,0.1)] dark:text-[#fbbf24]",
      label: dict.emailLabel,
      value: EMAIL,
      href: MAILTO,
      ltr: true,
    },
    {
      icon: "phone",
      tint: "bg-[rgba(12,106,132,0.08)] text-signal dark:bg-[rgba(45,212,191,0.1)] dark:text-[#2dd4bf]",
      label: dict.phoneLabel,
      value: PHONE_DISPLAY,
      href: PHONE_TEL,
      ltr: true,
    },
    {
      icon: "mapPin",
      tint: "bg-[rgba(22,101,52,0.08)] text-status dark:bg-[rgba(74,222,128,0.1)] dark:text-[#4ade80]",
      label: dict.locationLabel,
      value: dict.location,
    },
    {
      icon: "clock",
      tint: "bg-[rgba(111,97,73,0.1)] text-muted-text dark:bg-[rgba(146,152,165,0.12)] dark:text-[#9298a5]",
      label: dict.timeLabel,
      value: "",
      clock: true,
    },
  ];

  return (
    <section id="contact" className="bg-light-bg py-16 md:py-24">
      <div className="container">
        <SectionHeader number="06" title={dict.title} />

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div
            className="flex flex-col items-start gap-6 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
            data-reveal
          >
            <p className="max-w-md text-lg leading-relaxed text-light-text sm:text-xl">
              {dict.lead}
            </p>

            <span className={statusPill}>
              <span
                className="size-1.5 animate-pulse rounded-full bg-status motion-reduce:animate-none"
                aria-hidden="true"
              ></span>
              {dict.status}
            </span>

            <div className="flex flex-wrap gap-3">
              <a href={MAILTO} className={primaryCta}>
                {dict.sendEmail}
                <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
              </a>
              <a href={CV_PATH} download className={ghostCta}>
                <Icon name="fileDown" className="size-4" />
                {dict.downloadCv}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={socialLink}
                aria-label={dict.linkedin}
              >
                <Icon name="linkedIn" className="size-5" />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={socialLink}
                aria-label={dict.github}
              >
                <Icon name="github" className="size-5" />
              </a>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm stagger-60 data-[revealed=false]:opacity-0"
            data-reveal
            data-stagger
          >
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3.5 sm:px-5">
              <p className="font-mono text-[11px] font-semibold tracking-normal whitespace-nowrap text-secondary uppercase sm:text-xs sm:tracking-wide">
                <span className="font-bold" aria-hidden="true">
                  ${" "}
                </span>
                connection.methods
              </p>
              <p className="flex items-center gap-1.5 font-mono text-[9px] font-semibold tracking-normal whitespace-nowrap text-status uppercase sm:text-[10px] sm:tracking-wide">
                <span
                  className="size-1.5 animate-pulse rounded-full bg-status motion-reduce:animate-none"
                  aria-hidden="true"
                ></span>
                <span>
                  accepting<span className="max-[349px]:hidden"> connections</span>
                </span>
              </p>
            </div>

            {rows.map((row) => {
              const content = (
                <>
                  <span className={`${tile} ${row.tint}`}>
                    <Icon name={row.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] font-medium tracking-wide text-muted-text uppercase">
                      {row.label}
                    </span>
                    <span
                      className={`block truncate font-medium text-dark-text ${row.ltr ? "font-mono text-sm max-[400px]:text-[13px]" : ""} ${row.href ? "transition-colors duration-200 group-hover:text-signal" : ""}`}
                      dir={row.ltr ? "ltr" : undefined}
                      title={row.value}
                    >
                      {row.clock ? <CairoClock /> : row.value}
                    </span>
                  </span>
                  {row.href && (
                    <Icon
                      name="arrowRight"
                      className="size-4 shrink-0 -translate-x-1 text-signal opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 rtl:translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-0"
                    />
                  )}
                </>
              );

              return row.href ? (
                <a key={row.label} href={row.href} className={`${baseRow} ${interactiveRow}`}>
                  {content}
                </a>
              ) : (
                <div key={row.label} className={baseRow}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
