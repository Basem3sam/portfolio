import type { CSSProperties } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";

type ExperienceProps = {
  dict: Dictionary["experience"];
};

export default function Experience({ dict }: ExperienceProps) {
  return (
    <section id="experience" className="border-b border-hairline bg-light-bg py-16 md:py-24">
      <div className="container">
        <SectionHeader number="04" title={dict.title} />

        <ol className="divide-y divide-hairline stagger-80" data-reveal data-stagger>
          {dict.entries.map((entry, index) => (
            <li
              key={entry.role}
              style={{ "--stagger-index": index } as CSSProperties}
              className="grid gap-2 py-8 md:grid-cols-[170px_1fr] md:gap-6"
            >
              <p className="font-mono text-sm font-medium text-secondary">{entry.period}</p>
              <div>
                <h3 className="text-lg font-semibold text-dark-text">{entry.role}</h3>
                <p className="mt-0.5 text-sm font-medium text-light-text">{entry.org}</p>
                <p className="mt-3 max-w-2xl leading-relaxed text-light-text">{entry.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
