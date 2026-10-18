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
    <ul
      className="flex shrink-0 items-center gap-10 pe-10 font-mono text-sm text-light-text"
      aria-hidden={hidden || undefined}
    >
      {TECH.map((name) => (
        <li key={name} className="whitespace-nowrap">
          {name}
        </li>
      ))}
    </ul>
  );
}

/**
 * "Built with" band under the hero. The track is two identical rows moved by
 * -50%, so the loop is seamless; the second row is hidden from assistive tech.
 * Forced LTR because the content is Latin and the loop direction must not flip
 * with the page. Reduced motion: no animation, the row scrolls by hand.
 */
export default function Marquee({ label }: MarqueeProps) {
  return (
    <div className="border-b border-hairline">
      <div className="container flex items-center gap-6 py-4">
        <span className="shrink-0 font-mono text-xs tracking-wider text-muted-text uppercase">
          {label}
        </span>
        <div className="min-w-0 flex-1 overflow-hidden marquee-mask motion-reduce:overflow-x-auto" dir="ltr">
          <div className="flex w-max motion-safe:animate-marquee">
            <Row />
            <Row hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
