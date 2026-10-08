import CairoClock from "@/components/ui/CairoClock";
import Icon from "@/components/ui/Icon";
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

const labelClass = "font-mono text-xs font-medium tracking-wide text-muted-text uppercase";
const valueClass = "text-base font-medium text-dark-text";

const linkCell =
  "group flex flex-col gap-1.5 bg-surface p-5 no-underline transition-colors duration-200 hover:bg-light-bg md:p-6";

const plainCell = "flex flex-col gap-1.5 bg-surface p-5 md:p-6";

const socialLink =
  "flex size-11 items-center justify-center rounded-md border border-hairline bg-surface text-light-text no-underline transition-colors duration-200 hover:border-signal hover:text-signal";

const cvButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-hairline bg-surface px-5 text-sm font-semibold text-dark-text no-underline transition-colors duration-200 hover:border-signal hover:text-signal";

export default function Contact({ dict }: ContactProps) {
  return (
    <section id="contact" className="bg-light-bg py-16 md:py-24">
      <div className="container">
        <SectionHeader number="06" title={dict.title} />

        <p className="max-w-2xl text-lg leading-relaxed text-light-text" data-reveal>
          {dict.lead}
        </p>

        <div
          className="mt-10 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
          data-reveal
        >
          <a href={MAILTO} className={linkCell}>
            <span className={labelClass}>{dict.emailLabel}</span>
            <span
              className={`${valueClass} break-all transition-colors duration-200 group-hover:text-signal`}
            >
              {EMAIL}
            </span>
          </a>

          <a href={PHONE_TEL} className={linkCell}>
            <span className={labelClass}>{dict.phoneLabel}</span>
            <span
              className={`${valueClass} transition-colors duration-200 group-hover:text-signal`}
              dir="ltr"
            >
              {PHONE_DISPLAY}
            </span>
          </a>

          <div className={plainCell}>
            <span className={labelClass}>{dict.locationLabel}</span>
            <span className={valueClass}>{dict.location}</span>
          </div>

          <div className={plainCell}>
            <span className={labelClass}>{dict.timeLabel}</span>
            <CairoClock />
          </div>
        </div>

        <div
          className="mt-8 flex flex-wrap items-center gap-3 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
          data-reveal
        >
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
          <a href={CV_PATH} download className={cvButton}>
            <Icon name="fileDown" className="size-4" />
            {dict.downloadCv}
          </a>
        </div>
      </div>
    </section>
  );
}