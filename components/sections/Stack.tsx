import type { CSSProperties } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";

type StackProps = {
  dict: Dictionary["stack"];
};

export default function Stack({ dict }: StackProps) {
  return (
    <section id="stack" className="border-b border-hairline bg-light-bg py-16 md:py-24">
      <div className="container">
        <SectionHeader number="02" title={dict.title} />

        <dl
          className="divide-y divide-hairline overflow-hidden rounded-lg border border-hairline bg-surface stagger-60"
          data-reveal
          data-stagger
        >
          {dict.groups.map((group, index) => (
            <div
              key={group.label}
              style={{ "--stagger-index": index } as CSSProperties}
              className="grid gap-3 p-5 transition-colors duration-200 hover:bg-light-bg md:grid-cols-[170px_1fr] md:gap-6 md:p-6"
            >
              <dt className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                {group.label}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-hairline px-2.5 py-1 text-sm text-light-text"
                  >
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}