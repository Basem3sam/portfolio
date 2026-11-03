import type { CSSProperties } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";
import "./Stack.css";

type StackProps = {
  dict: Dictionary["stack"];
};

/**
 * Stack (section 03). Always-dark: the `--c-*` tokens are re-declared inside
 * `#stack` in Stack.css, so every Tailwind token utility used here inverts
 * automatically in both themes.
 *
 * The five stages read as one request travelling Edge → Gate → App → Data →
 * Ship (mockup lines 2645–2662). The connector, the packet, the nodes, the slabs
 * and the 3D plates are all driven by one scroll value (`data-story="trace"`
 * on `.sflow`), so they always agree about where the request is. The background is that idea drawn as a
 * cross-section: each stage owns a tonal slab (cold at the Edge, warm at Ship)
 * that fills downward from its node and brightens as the comet passes, over a
 * ruler under the connector line. The decorative layers — the slabs, the ruler,
 * the 3D plate stack and the packet comet — are all `aria-hidden`; the stages
 * themselves are real content (h3 per stage) and stay fully readable with JS
 * disabled or reduced motion on: the connector lines and lit nodes default to
 * their final state, and only snap back when RevealOnScroll has booted.
 */
export default function Stack({ dict }: StackProps) {
  const { stages } = dict;

  return (
    <section id="stack" className="sec">
      <div>
        <SectionHeader number="03" title={dict.title} lead={dict.lead} />

        <div className="sflow" data-story="trace">
          {/* 3D plate stack + caption: a decorative echo of the five layers,
              placed inside the flow so it shares the flow's scroll value.
              Shown only on wide screens; static (finished) without motion. */}
          <div className="xl" aria-hidden="true">
            <div className="xl-s">
              {stages.map((stage, i) => (
                <i key={stage.key} style={{ "--n": i } as CSSProperties}>
                  <b>{stage.key}</b>
                </i>
              ))}
              <span className="xl-p"></span>
            </div>
            <p className="xl-c">{dict.caption}</p>
          </div>

          {/* Honey comet that rides the connector line (decorative). */}
          <span className="stx-pkt" aria-hidden="true"></span>

          <ol className="fl-stages">
            {stages.map((stage, index) => (
              <li
                key={stage.key}
                className="stx"
                style={{ "--i": index } as CSSProperties}
                aria-labelledby={`st-${stage.key}`}
                data-reveal
                data-story="line"
              >
                {/* Connector line + node: the request path through this layer. */}
                <span className="stx-slab" aria-hidden="true"></span>
                <span className="stx-seg" aria-hidden="true"></span>
                <span className="stx-node" aria-hidden="true"></span>

                <p className="stx-k">
                  <span className="stx-n" dir="ltr">
                    {stage.n}
                  </span>
                  <span>{stage.key}</span>
                </p>
                <h3 id={`st-${stage.key}`}>{stage.title}</h3>
                <p className="stx-c">{stage.cap}</p>

                <ul className="chips">
                  {stage.techs.map((tech) => (
                    <li key={tech.name} className="chip" dir="ltr">
                      <b aria-hidden="true">{tech.abbr}</b>
                      {tech.name}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="stx-also" data-reveal>
            <span className="lbl">{dict.alsoLabel}</span>
            <ul className="chips">
              {dict.also.map((tech) => (
                <li key={tech.name} className="chip" dir="ltr">
                  <b aria-hidden="true">{tech.abbr}</b>
                  {tech.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
