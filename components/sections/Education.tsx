import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";

type EducationProps = {
  dict: Dictionary["education"];
};

export default function Education({ dict }: EducationProps) {
  return (
    <section id="education" className="border-b border-hairline py-16 md:py-24">
      <div className="container">
        <SectionHeader number="05" title={dict.title} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <dl
            className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-lg border border-hairline bg-hairline data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
            data-reveal
          >
            {dict.facts.map((fact) => (
              <div key={fact.label} className="bg-surface p-4 md:p-5">
                <dt className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-dark-text">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div
            className="space-y-8 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
            data-reveal
            style={{ animationDelay: "100ms" }}
          >
            <div>
              <h3 className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                {dict.courseworkHeading}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {dict.coursework.map((course) => (
                  <span
                    key={course}
                    className="rounded-md border border-hairline px-2.5 py-1 text-sm text-light-text"
                  >
                    {course}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                {dict.achievementsHeading}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {dict.achievements.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-light-text"
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-status"
                      aria-hidden="true"
                    ></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                {dict.certificationsHeading}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {dict.certifications.map((cert) => (
                  <li
                    key={cert}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-light-text"
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary"
                      aria-hidden="true"
                    ></span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
