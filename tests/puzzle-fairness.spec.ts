import { expect, test } from "@playwright/test";
import {
  CLUES,
  DISCOVERIES,
  REPLAY_LINES,
  SOURCES,
  TOTAL_DISCOVERIES,
  helpOutput,
} from "@/lib/terminalCommands";

/*
 * Fair-play check for the terminal puzzle. No browser needed.
 *
 * The rule: every word a player must type was printed by the machine before
 * they need it. A "source" (a command's output) only becomes available once
 * every word of the command that produces it has been printed; a trophy is
 * fair only if every word of its answer has been printed by then. So nothing
 * depends on knowing a film, Unix lore, or a lucky guess.
 */

const plain = (html: string) => html.replace(/<[^>]*>/g, "");

/** Lower-case words as a player reads them. A name like .bash_history counts
    whole, and its underscore parts count too, so HIRE_ME also gives "hire". */
const words = (text: string) =>
  (
    plain(text)
      .toLowerCase()
      .match(/[a-z0-9._!/-]+/g) ?? []
  ).flatMap((w) => [w, w.replace(/[.]+$/, ""), ...w.split("_").filter(Boolean)]);

const tokensOf = (typed: string) => typed.toLowerCase().split(/\s+/).filter(Boolean);

function closure() {
  const seen = new Set<string>();
  /** Which pass of reading each source first became available in. */
  const wave = new Map<string, number>();
  const add = (text: string) => {
    words(text).forEach((w) => seen.add(w));
    // A file stem counts only when the machine says to drop the extension
    // ("without .txt"): that is a printed instruction, not outside knowledge.
    const drop = plain(text).match(/without \.(\w+)/i);
    if (drop) {
      const ext = `.${drop[1].toLowerCase()}`;
      for (const w of [...seen])
        if (w.endsWith(ext) && w.length > ext.length) seen.add(w.slice(0, -ext.length));
    }
  };
  const available = (typed: string) => tokensOf(typed).every((t) => seen.has(t));

  let pending = [...SOURCES];
  for (let pass = 0; pending.length > 0; pass++) {
    const ready = pending.filter((source) => available(source.typed));
    if (ready.length === 0) break;
    for (const source of ready) {
      add(source.text());
      wave.set(source.typed || "(boot)", pass);
    }
    pending = pending.filter((source) => !ready.includes(source));
  }
  return { seen, wave, stuck: pending.map((p) => p.typed), available };
}

test.describe("terminal puzzle fair play", () => {
  test("there are exactly 22 trophies with unique ids", () => {
    expect(TOTAL_DISCOVERIES).toBe(22);
    expect(new Set(DISCOVERIES.map((d) => d.id)).size).toBe(22);
  });

  test("every source of evidence can be reached by words already seen", () => {
    const { stuck } = closure();
    expect(stuck, `unreachable sources: ${stuck.join(", ")}`).toEqual([]);
  });

  test("every trophy's answer is made only of words the machine printed first", () => {
    const { available } = closure();
    const unfair = DISCOVERIES.filter((d) => !available(d.typed)).map((d) => `${d.id}: ${d.typed}`);
    expect(unfair, `unfair trophies:\n${unfair.join("\n")}`).toEqual([]);
  });

  test("the hidden chain is ordered: ls shows the count, ls -a shows the files, then they read", () => {
    const { wave } = closure();
    const at = (c: string) => wave.get(c) ?? Number.POSITIVE_INFINITY;
    expect(at("ls")).toBeLessThan(Number.POSITIVE_INFINITY);
    // ls -a lists .env and .bash_history, so both become readable right after it.
    expect(at("ls -a")).toBeLessThan(at("cat .env"));
    expect(at("ls -a")).toBeLessThan(at("cat .bash_history"));
    // sudo explains itself before sudo -l can be asked.
    expect(at("sudo")).toBeLessThan(at("sudo -l"));
    // the secret's answer exists only after the refusal that explains the lock.
    expect(at("cat secret.txt")).toBeLessThan(at("secret"));
  });

  test("locked hints are plain: no lore, no riddle words", () => {
    const lore = /\b(film|movie|1986|konami|unix|pill|neo|morpheus|wake up|cheat code)\b/i;
    for (const d of DISCOVERIES) {
      expect(`${d.hint} ${d.clues[0]}`, d.id).not.toMatch(lore);
    }
    for (const c of CLUES) expect(c.text, c.id).not.toMatch(lore);
  });

  test("the answer clue always contains the real answer", () => {
    for (const d of DISCOVERIES) {
      expect(d.clues[1].toLowerCase(), d.id).toContain(d.typed.split(" ")[0].toLowerCase());
    }
  });

  test("every clue points at a real trophy and every replay line exists", () => {
    const ids = new Set(DISCOVERIES.map((d) => d.id));
    for (const c of CLUES) expect(ids.has(c.target), c.id).toBe(true);
    for (let n = 1; n <= 9; n++) expect(REPLAY_LINES[n], `line ${n}`).toBeDefined();
  });

  test("help grows as the player learns tools", () => {
    expect(plain(helpOutput([]))).not.toContain("replay");
    expect(plain(helpOutput(["history"]))).toContain("replay");
    expect(plain(helpOutput(["sudo"]))).toContain("sudo -l");
  });

  test("no help line exceeds the 40-column grid", () => {
    for (const row of plain(helpOutput(["history", "sudo"])).split("\n")) {
      expect(row.length, row).toBeLessThanOrEqual(40);
    }
  });
});
