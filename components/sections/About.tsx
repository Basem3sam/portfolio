import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";
import "./About.css";

type AboutProps = {
  dict: Dictionary["about"];
};

/**
 * About (04): statement, timeline rail, then the education ledger — the
 * mockup's `sec-about` markup (Portfolio Design Mockup.html, lines
 * 2663–2690). The old standalone Education section lives on as the
 * `.ab-edu` ledger at the bottom.
 */
export default function About({ dict }: AboutProps) {
  return (
    <section id="about" className="sec sec-panel sec-wash">
      <div className="ag" data-variant="mist" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <SectionHeader number="04" title={dict.title} />

      <div className="ab3">
        <div className="ab-main" data-reveal>
          <p className="ab-lead">{dict.lead}</p>
          <p className="ab-body">{dict.body}</p>
        </div>

        <ol className="ab-rail" data-reveal aria-label={dict.timelineLabel}>
          {dict.timeline.map((entry) => (
            <li key={entry.year} className={entry.next ? "next" : undefined}>
              <span className="yr">{entry.year}</span>
              <b>{entry.title}</b>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>

        <div className="ab-edu" data-reveal>
          <div className="ed-deg">
            <p className="lbl">{dict.educationLabel}</p>
            <h3>{dict.degree}</h3>
            <p className="uni">{dict.university}</p>
            <div className="pills">
              {dict.degreePills.map((pill, index) => (
                <span key={pill} className={index === 0 ? "pill fill" : "pill"}>
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className="ed-cw">
            <p className="lbl">{dict.courseworkLabel}</p>
            <ul className="plain">
              {dict.coursework.map((course) => (
                <li key={course}>{course}</li>
              ))}
            </ul>
          </div>

          <div className="ed-ct">
            <p className="lbl">{dict.certificationsLabel}</p>
            <ul className="certs">
              {dict.certifications.map((cert) => (
                <li key={cert.name}>
                  <span>{cert.name}</span>
                  <em dir="ltr">{cert.org}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
