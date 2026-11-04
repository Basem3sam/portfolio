/**
 * Packs tech chips into rows of a 12-column grid so every row is exactly full.
 *
 * Each chip needs a minimum number of columns for its name (estimated from the
 * character count and the reference row width). We then search every way of
 * grouping the chips into rows (a subset DP, fine for <= 10 chips) and keep the
 * grouping that wastes the least space, with a small penalty per extra row.
 * Any slack left in a row is handed out one column at a time to the chip that
 * has grown the least relative to its need, so no chip ends up with a big empty
 * bar after a short word.
 *
 * Pure and deterministic, so it is safe in a server component.
 */
export type PackedChip = { span: number; order: number };

const COLS = 12;
const GAP = 6;
/** tile + gaps + paddings + border, in px (see Stack.css chip sizes) */
const CHROME = 46;
/** average glyph advance at ~13px, in px */
const GLYPH = 6.7;
/** a chip may be this many columns tighter than its estimate (padding gives) */
const SQUEEZE = 0.2;

/** Hand the free columns of a full row to the chips that have grown least. */
function distribute(items: number[], need: number[], exact: number[]): number[] {
  const spans = items.map((i) => need[i]);
  let extra = COLS - spans.reduce((a, b) => a + b, 0);
  while (extra > 0) {
    let pick = 0;
    for (let k = 1; k < items.length; k++) {
      if (spans[k] / exact[items[k]] < spans[pick] / exact[items[pick]]) pick = k;
    }
    spans[pick]++;
    extra--;
  }
  return spans;
}

export function packChips(names: string[], refWidth: number): PackedChip[] {
  const n = names.length;
  if (n === 0) return [];

  const step = (refWidth - GAP * (COLS - 1)) / COLS + GAP;
  const exact = names.map((name) => (CHROME + name.length * GLYPH + GAP) / step);
  const need = exact.map((e) => Math.min(COLS, Math.max(1, Math.ceil(e - SQUEEZE))));

  const memo = new Map<number, { cost: number; rows: number[] }>();
  const solve = (mask: number): { cost: number; rows: number[] } => {
    if (mask === 0) return { cost: 0, rows: [] };
    const hit = memo.get(mask);
    if (hit) return hit;
    const low = mask & -mask;
    let best = { cost: Infinity, rows: [] as number[] };
    for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
      if (!(sub & low)) continue;
      let sum = 0;
      for (let i = 0; i < n; i++) if (sub & (1 << i)) sum += need[i];
      if (sum > COLS) continue;
      const items = [...Array(n).keys()].filter((i) => sub & (1 << i));
      const spans = distribute(items, need, exact);
      // waste = how far each chip ends up wider than its text needs
      const waste = spans.reduce((a, sp, k) => a + (sp - exact[items[k]]) ** 2, 0);
      const rest = solve(mask ^ sub);
      const cost = waste + 1 + rest.cost;
      if (cost < best.cost) best = { cost, rows: [sub, ...rest.rows] };
    }
    memo.set(mask, best);
    return best;
  };

  const { rows } = solve((1 << n) - 1);
  const members = rows
    .map((sub) => [...Array(n).keys()].filter((i) => sub & (1 << i)))
    .sort((a, b) => a[0] - b[0]);

  const out: PackedChip[] = new Array(n);
  let order = 0;
  for (const row of members) {
    const spans = distribute(row, need, exact);
    row.forEach((i, k) => {
      out[i] = { span: spans[k], order: order++ };
    });
  }
  return out;
}
