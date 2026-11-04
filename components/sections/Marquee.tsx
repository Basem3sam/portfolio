import "./Marquee.css";
import MarqueeScrollDrive from "./MarqueeScrollDrive";

// Technologies are proper nouns, so the list is not translated.
const TECH = [
  "Node.js",
  "Express",
  "NestJS",
  "MongoDB",
  "PostgreSQL",
  "Redis",
  "Docker",
  "JWT",
  "Swagger / OpenAPI",
];

type MarqueeProps = {
  label: string;
};

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="mq-list" aria-hidden={hidden || undefined}>
      {TECH.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

/**
 * "Built with" band under the hero: an always-dark strip carrying one looping
 * row of technologies. The track holds two identical rows moved by -50%, so the
 * loop is seamless; the second row is hidden from assistive tech. Forced LTR
 * because the content is Latin and the loop direction must not flip with the
 * page. Reduced motion: no animation, the row scrolls by hand.
 */
export default function Marquee({ label }: MarqueeProps) {
  return (
    <div className="mq">
      <MarqueeScrollDrive />
      <span className="lbl">{label}</span>
      <div className="mq-view">
        <div className="mq-row">
          <Row />
          <Row hidden />
        </div>
      </div>
    </div>
  );
}
