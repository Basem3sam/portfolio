/**
 * The flagship card's signature backdrop: a bundle of fine strands that flows
 * down the whole card like silk, twisting as it goes (narrow, then wide, then
 * narrow again). It is deliberately NOT concentric circles: the project cards
 * below use rings, so the flagship has a line of its own.
 *
 * Built once at module load into plain SVG path data (deterministic, so it is
 * safe in a server component) and drawn as one static SVG: a single paint, no
 * filters, no masks.
 */
export type SilkStrand = { d: string; stroke: string; width: number; opacity: number };

export const SILK_VIEWBOX = { w: 390, h: 1200 };

const STRANDS = 24;
const POINTS = 18;
/** Strands run past both ends of the drawing (-8% .. 108%), so the card's own edge does the clipping and no strand ever stops short of it. */
const OVERSHOOT = 0.08;

const round = (n: number) => Math.round(n * 10) / 10;

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smooth(points: [number, number][]) {
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

function build(): SilkStrand[] {
  const { w, h } = SILK_VIEWBOX;
  const out: SilkStrand[] = [];
  for (let k = 0; k < STRANDS; k++) {
    const u = k - (STRANDS - 1) / 2;
    const pts: [number, number][] = [];
    for (let i = 0; i <= POINTS; i++) {
      const t = -OVERSHOOT + ((1 + 2 * OVERSHOOT) * i) / POINTS;
      const centre = w / 2 + 165 * Math.sin(2 * Math.PI * 0.85 * t + 0.7);
      const spread = 7 + 5 * Math.sin(2 * Math.PI * 1.3 * t + 0.4);
      const x = centre + u * spread;
      const y = t * h + u * 2.5 * Math.cos(2 * Math.PI * 1.1 * t);
      pts.push([x, y]);
    }
    const warm = k % 7 === 3;
    const fall = 1 - Math.abs(u) / (STRANDS / 2);
    out.push({
      d: smooth(pts),
      stroke: warm ? "#f4bd68" : k % 2 ? "#a9c2ff" : "#6f90ff",
      width: warm ? 1.25 : 1,
      opacity: round((0.12 + 0.55 * Math.pow(fall, 1.2)) * (warm ? 1.15 : 1)),
    });
  }
  return out;
}

export const SILK: SilkStrand[] = build();
