import Link from "next/link";
import type { CSSProperties } from "react";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";

type ExperienceProps = {
  dict: Dictionary["experience"];
  locale: Locale;
};

const moreLink =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-4 text-sm font-semibold text-dark-text no-underline transition-colors duration-200 hover:border-dark-text hover:bg-dark-text hover:text-page";

export default function Experience({ dict, locale }: ExperienceProps) {
  return (
    <section id="experience" className="border-b border-hairline bg-light-bg py-16 md:py-24">
      <div className="container">
        <SectionHeader number="04" title={dict.title} />

        {/* The rail is the ol's ::before, centred under the dots (18px from the start edge). */}
        <ol
          className="relative flex flex-col gap-4 ps-9 before:absolute before:inset-y-6 before:start-[17px] before:w-0.5 before:rounded-full before:bg-linear-to-b before:from-note before:via-rule-strong before:to-hairline before:content-[''] stagger-80"
          data-reveal
          data-stagger
        >
          {dict.entries.map((entry, index) => (
            <li
              key={entry.role}
              style={{ "--stagger-index": index } as CSSProperties}
              className={`group/entry relative grid gap-3 rounded-xl border p-6 transition-colors duration-200 md:grid-cols-[170px_minmax(0,1fr)] md:gap-6 md:p-7 ${
                entry.current
                  ? "border-note/45 bg-surface bg-linear-to-r from-note/8 to-transparent rtl:bg-linear-to-l"
                  : "border-hairline bg-surface hover:border-rule-strong"
              }`}
            >
              <span
                className={`absolute top-8 -start-[25px] size-3.5 rounded-full border-2 transition-colors duration-200 ${
                  entry.current
                    ? "border-note bg-note ring-4 ring-note/20"
                    : "border-muted-text bg-page group-hover/entry:border-note"
                }`}
                aria-hidden="true"
              ></span>

              <div className="flex flex-col items-start gap-3">
                <p className="font-mono text-sm font-medium text-note">{entry.period}</p>
                {entry.current && (
                  <p className="inline-flex items-center gap-2 rounded-full border border-note/60 px-3 py-1 font-mono text-xs font-semibold text-note">
                    <span
                      className="size-1.5 rounded-full bg-note"
                      aria-hidden="true"
                    ></span>
                    {dict.currentLabel}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-h3 font-semibold text-dark-text">{entry.role}</h3>
                <p className="mt-0.5 text-sm font-medium text-light-text">{entry.org}</p>
                <p className="mt-3 max-w-2xl leading-relaxed text-light-text">{entry.text}</p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {entry.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-md border border-hairline px-2.5 py-1 font-mono text-[13px] text-light-text"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>

                {entry.current && (
                  <Link
                    href={locale === "ar" ? "/ar/work/trosc" : "/work/trosc"}
                    className={`${moreLink} mt-4`}
                  >
                    {dict.caseStudy}
                    <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
