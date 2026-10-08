import type { CSSProperties } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";

type StackProps = {
  dict: Dictionary["stack"];
};

const GROUP_ICONS: IconName[] = ["server", "database", "box", "monitor", "shield", "layers"];

const tile =
  "flex size-11 shrink-0 items-center justify-center rounded-md bg-[rgba(163,72,9,0.08)] text-secondary dark:bg-[rgba(251,191,36,0.1)] dark:text-[#fbbf24]";

const chip =
  "rounded-md border border-hairline px-2.5 py-1 text-sm text-light-text transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:text-signal hover:shadow-xs";

export default function Stack({ dict }: StackProps) {
  return (
    <section id="stack" className="border-b border-hairline bg-light-bg py-16 md:py-24">
      <div className="container">
        <SectionHeader number="02" title={dict.title} />

        <dl
          className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface shadow-xs stagger-60"
          data-reveal
          data-stagger
        >
          {dict.groups.map((group, index) => (
            <div
              key={group.label}
              style={{ "--stagger-index": index } as CSSProperties}
              className="grid gap-3 p-5 transition-colors duration-200 hover:bg-light-bg md:grid-cols-[230px_1fr] md:gap-6 md:p-6"
            >
              <dt className="flex items-center gap-3">
                <span className={tile}>
                  <Icon
                    name={GROUP_ICONS[index % GROUP_ICONS.length]}
                    className="size-5"
                  />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-mono text-xs font-medium tracking-wide text-muted-text uppercase">
                    {group.label}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-secondary" dir="ltr">
                    ×{group.items.length}
                  </span>
                </span>
              </dt>
              <dd className="flex flex-wrap content-center gap-2">
                {group.items.map((item) => (
                  <span key={item} className={chip}>
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