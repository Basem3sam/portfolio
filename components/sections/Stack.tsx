import type { CSSProperties } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";
import "./Stack.css";

type StackProps = {
  dict: Dictionary["stack"];
};

/**
 * Decorative "request lanes": thin horizontal traces with packets streaming
 * left to right at different speeds, replacing the old square grid. Pure SVG
 * + CSS; deterministic so server and client markup always agree.
 */
const DASHES = [
  { d: "44 356", p: 400 },
  { d: "24 236", p: 260 },
  { d: "64 436", p: 500 },
  { d: "18 182", p: 200 },
] as const;

const LANES = Array.from({ length: 18 }, (_, i) => {
  const dash = DASHES[(i * 3 + (i >> 2)) % DASHES.length];
  return {
    y: 34 + i * 41 + ((i * 37) % 19),
    dash: dash.d,
    period: dash.p,
    dur: 9 + ((i * 7) % 11) * 1.7,
    delay: -((i * 13) % 17),
    hot: i % 6 === 2,
  };
});

/**
 * Stack (section 03). Always-dark: the `--c-*` tokens are re-declared inside
 * `#stack` in Stack.css, so every Tailwind token utility used here inverts
 * automatically in both themes.
 *
 * The five stages read as one request travelling Edge → Gate → App → Data →
 * Ship (mockup lines 2645–2662). The decorative layers — the drifting mist,
 * the 3D plate stack and the packet comet — are all `aria-hidden`; the stages
 * themselves are real content (h3 per stage) and stay fully readable with JS
 * disabled or reduced motion on: the connector lines and lit nodes default to
 * their final state, and only snap back when RevealOnScroll has booted.
 */
export default function Stack({ dict }: StackProps) {
  const { stages } = dict;

  return (
    <section id="stack" className="py-16 md:py-24">
      {/* Drifting mist (mockup `.sec-mist` via the shared `.ag` primitive). */}
      <div className="ag" data-variant="mist" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
      </div>

      {/* Request lanes: replaces the square grid. Decorative, hidden < 992px. */}
      <svg className="stx-lanes" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        {LANES.map((lane, i) => (
          <line key={`t${i}`} className="trace" x1="0" x2="1200" y1={lane.y} y2={lane.y} />
        ))}
        {LANES.map((lane, i) => (
          <line
            key={i}
            x1="0"
            x2="1200"
            y1={lane.y}
            y2={lane.y}
            strokeDasharray={lane.dash}
            className={lane.hot ? "hot" : undefined}
            style={
              {
                "--p": `${lane.period}px`,
                animationDuration: `${lane.dur + 8}s`,
                animationDelay: `${lane.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </svg>

      {/* 3D plate stack + caption: a decorative echo of the five layers.
          Shown only on wide screens; static (fully drawn) without motion. */}
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

      <div className="container">
        <SectionHeader number="03" title={dict.title} lead={dict.lead} />

        <div className="sflow" data-story="read">
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
              >
                {/* Connector line + node: the request path through this layer. */}
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
