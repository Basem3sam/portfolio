import { expect, test } from "@playwright/test";
import {
  BASH_HISTORY_OUTPUT,
  CLUES,
  COMMAND_OUTPUT,
  DISCOVERIES,
  HIRE_BARE,
  REPLAY_LINES,
  SOURCES,
  SUDO_DENIED,
  SUDO_LIST,
  TOTAL_DISCOVERIES,
  helpOutput,
  hireOutput,
  neofetchOutput,
  sudoReply,
  whoamiOutput,
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

/*
 * The finale (sudo hire basem) must be findable without being handed over.
 * Pointers: the visitor should meet the idea from several directions, and each
 * one has to say where to look, never the command itself.
 */
test.describe("the finale is pointed to, not spelled out", () => {
  const SPELLED_OUT = /sudo\s+hire|hire\s+basem|hire\s+me\b/i;

  const neofetch = plain(neofetchOutput({ rank: "guest", count: 0, theme: "amber", uptime: "1s" }));
  const whoami = plain(whoamiOutput("guest", "guest", 0));
  const sudoList = plain(SUDO_LIST);

  test("at least five different places lead toward it", () => {
    const pointers: Record<string, boolean> = {
      "contact names the word sudo": /sudo/.test(plain(COMMAND_OUTPUT.contact)),
      "whoami says a guest may still ask": /may still ask/i.test(whoami),
      "neofetch says the machine is open to work": /open to work/i.test(neofetch),
      "todo.md says someone else has to run the last item": /someone else/i.test(plain(COMMAND_OUTPUT.todo)),
      "the history points at todo.md": /todo\.md/.test(plain(BASH_HISTORY_OUTPUT)),
      "sudo -l says where the verb is printed": /\.env/.test(sudoList),
      "sudo -l says where the name is printed": /neofetch/.test(sudoList),
    };
    const missing = Object.entries(pointers).filter(([, ok]) => !ok).map(([name]) => name);
    expect(missing, `missing pointers:\n${missing.join("\n")}`).toEqual([]);
  });

  test("nothing before the answer is typed prints the whole command", () => {
    const texts = [
      COMMAND_OUTPUT.contact,
      COMMAND_OUTPUT.todo,
      COMMAND_OUTPUT.about,
      BASH_HISTORY_OUTPUT,
      SUDO_LIST,
      SUDO_DENIED,
      HIRE_BARE,
      neofetch,
      whoami,
      ...CLUES.map((c) => c.text),
      ...SOURCES.map((s) => s.text()),
    ].map(plain);
    for (const text of texts) expect(text).not.toMatch(SPELLED_OUT);
    // The opt-in hint ladder is the one place that may say it, and only last.
    const hire = DISCOVERIES.find((d) => d.id === "hire")!;
    expect(hire.clues[0]).not.toMatch(SPELLED_OUT);
    expect(hire.clues[1]).toContain("sudo hire basem");
  });

  test("the sudo -l clue gives a definition, a count and a place to look for both words", () => {
    expect(sudoList).toMatch(/VERB[\s\S]*\(4\)/);
    expect(sudoList).toMatch(/NAME[\s\S]*\(5\)/);
    expect(sudoList).toMatch(/first key in \.env/);
    expect(sudoList).toMatch(/neofetch/);
    for (const row of sudoList.split("\n")) expect(row.length, row).toBeLessThanOrEqual(40);
  });

  test("the answer works, and so does the name the .env key itself suggests", () => {
    expect(sudoReply(["hire", "basem"]).kind).toBe("hire");
    expect(sudoReply(["hire", "me"]).kind).toBe("hire");
    expect(sudoReply(["-l"]).kind).toBe("list");
  });

  test("a near miss is told how it missed, never what the answer is", () => {
    const replies = [
      sudoReply(["employ", "basem"], ["employ", "basem"]),
      sudoReply(["fire", "basem"], ["fire", "basem"]),
      sudoReply(["hire"], ["hire"]),
      sudoReply(["hire", "bob"], ["hire", "bob"]),
      sudoReply(["hire", "alice"], ["hire", "alice"]),
      sudoReply([], []),
    ];
    for (const reply of replies) {
      expect(reply.kind).not.toBe("hire");
      const said = "error" in reply ? [reply.error, ...reply.info] : "info" in reply ? reply.info : [];
      for (const line of said) {
        expect(line).not.toMatch(SPELLED_OUT);
        expect(line.length, line).toBeLessThanOrEqual(38);
      }
    }
    const wrongLength = sudoReply(["employ", "basem"], ["employ", "basem"]);
    expect(wrongLength.kind === "denied" && wrongLength.info.join(" ")).toMatch(/6 letters, not 4/);
    const rightLength = sudoReply(["fire", "basem"], ["fire", "basem"]);
    expect(rightLength.kind === "denied" && rightLength.info.join(" ")).toMatch(/right length/i);
    const wrongName = sudoReply(["hire", "bob"], ["hire", "bob"]);
    expect(wrongName.kind === "hire-help" && wrongName.info.join(" ")).toMatch(/neofetch/);
  });

  test("the recap of the trail appears only after the command is right", () => {
    expect(plain(hireOutput("guest"))).toMatch(/How the trail led here/);
    for (const text of [COMMAND_OUTPUT.contact, SUDO_LIST, BASH_HISTORY_OUTPUT]) {
      expect(plain(text)).not.toMatch(/How the trail led here/);
    }
  });
});
