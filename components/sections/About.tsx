import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";

type AboutProps = {
  dict: Dictionary["about"];
};

export default function About({ dict }: AboutProps) {
  return (
    <section id="about" className="border-b border-hairline py-16 md:py-24">
      <div className="container">
        <SectionHeader number="03" title={dict.title} />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
          <div
            className="max-w-2xl space-y-4 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
            data-reveal
          >
            <p className="text-lg leading-relaxed text-dark-text">{dict.intro}</p>
            <p className="leading-relaxed text-light-text">{dict.story}</p>
            <p className="leading-relaxed text-light-text">{dict.community}</p>
            <p className="leading-relaxed text-light-text">{dict.today}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {dict.chips.map((chip) => (
                <Badge variant="primary" key={chip}>
                  {chip}
                </Badge>
              ))}
            </div>
          </div>

          <dl
            className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-lg border border-hairline bg-hairline data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up lg:grid-cols-1"
            data-reveal
            style={{ animationDelay: "100ms" }}
          >
            {dict.facts.map((fact) => (
              <div key={fact.label} className="bg-surface p-4">
                <dt className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-dark-text">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}