import {
  CV_PATH,
  EMAIL,
  GITHUB_URL,
  LARAVEL_REPO_URL,
  LINKEDIN_URL,
  MAILTO,
  NEUROSCAN_REPO_URL,
  TROSC_REPO_URL,
  TROSC_URL,
} from "@/data/site";

/* ----------------------------------------------------------------
   Terminal content.

   Every line is written for a 40-column grid. The terminal scales its
   font so 40 columns always fit the card (see `.etb` in Egg.css), which
   is why all alignment here is plain padding in a true monospace face.
   `visibleLength` measures a line without its markup; no line may be
   longer than COLS.
   ---------------------------------------------------------------- */

export const COLS = 40;

/** Markup helpers. Only <span class> and <a class href> are allowed - the
    typing renderer in Terminal.tsx understands exactly those. */
const rule = (name: string) =>
  `<span class="dim">──</span> <span class="hd">${name}</span> <span class="dim">${"─".repeat(
    COLS - 4 - name.length,
  )}</span>`;

const key = (name: string, width = 9) => `<span class="key">${name.padEnd(width)}</span>`;
const bright = (text: string) => `<span class="wl">${text}</span>`;
const dim = (text: string) => `<span class="dim">${text}</span>`;
const hint = (text: string) => `<span class="info">${text}</span>`;

const link = (href: string, label: string) => {
  const external = href.startsWith("https://");
  return `<a class="elk" href="${href}"${
    external ? ' target="_blank" rel="noopener noreferrer"' : ""
  }>${label}</a>`;
};

const badge = (text: string) => `<span class="badge">${text}</span>`;

/** Visible characters of a markup line (tags removed). Used by tests/tools. */
export const visibleLength = (line: string) => line.replace(/<[^>]*>/g, "").length;

/* ---------------------------------------------------------------- banner */

/** Six rows, 43 columns. Rendered in the terminal font so every glyph is
    exactly one cell wide; the tagline lives outside the <pre>. */
export const ASCII_BANNER = [
  "██████╗  █████╗ ███████╗███████╗███╗   ███╗",
  "██╔══██╗██╔══██╗██╔════╝██╔════╝████╗ ████║",
  "██████╔╝███████║███████╗█████╗  ██╔████╔██║",
  "██╔══██╗██╔══██║╚════██║██╔══╝  ██║╚██╔╝██║",
  "██████╔╝██║  ██║███████║███████╗██║ ╚═╝ ██║",
  "╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝",
].join("\n");

export const BANNER_TAGLINE = "secret developer terminal";

/* ----------------------------------------------------------- trophies */

export type Chapter = "orient" | "explore" | "investigate" | "replay" | "escalate";

export type Discovery = {
  id: string;
  chapter: Chapter;
  /** Shown once earned. */
  label: string;
  /** Shown while locked: plain words saying WHAT to do or WHERE to look.
      Never a riddle, never a film or a joke that needs outside knowledge. */
  hint: string;
  /** What a player types to earn it. Every word of it must have been printed
      by the machine before it is needed (checked by puzzle-fairness.spec). */
  typed: string;
  /** Clue 2 (where the evidence is) and clue 3 (the answer, shown by `hint`). */
  clues: readonly [string, string];
};

/** Order matters: `hint` points at the first trophy not yet found, so this is
    the path that teaches every tool, easiest first. Five chapters:
    orient (read the profile), explore (learn the shell), investigate (read the
    config and the log), replay (run what the log shows), escalate (ask). */
export const DISCOVERIES: readonly Discovery[] = [
  { id: "about", chapter: "orient", label: "Met the developer", hint: "Find out who built this", typed: "about", clues: ["The first command under 'about basem' in help.", "Type: about"] },
  { id: "skills", chapter: "orient", label: "Checked the toolkit", hint: "See what is in the toolbox", typed: "skills", clues: ["Second under 'about basem' in help.", "Type: skills"] },
  { id: "projects", chapter: "orient", label: "Browsed the projects", hint: "See what has been shipped", typed: "projects", clues: ["Third under 'about basem' in help.", "Type: projects"] },
  { id: "contact", chapter: "orient", label: "Found the contact details", hint: "Find a way to reach Basem", typed: "contact", clues: ["Fourth under 'about basem' in help.", "Type: contact"] },
  { id: "neofetch", chapter: "orient", label: "Ran a system check", hint: "Get the one-screen summary", typed: "neofetch", clues: ["Last under 'about basem' in help: 'quick system summary'.", "Type: neofetch"] },
  { id: "ls", chapter: "explore", label: "Looked around", hint: "List the files in the folder", typed: "ls", clues: ["Under 'files and links' in help.", "Type: ls"] },
  { id: "cat", chapter: "explore", label: "Opened a file", hint: "Read one file from the list", typed: "cat about.md", clues: ["help shows the form: cat, a space, a file name from ls.", "Type: cat about.md"] },
  { id: "open", chapter: "explore", label: "Followed a link", hint: "Open a real page outside the terminal", typed: "open github", clues: ["help lists the targets after 'open NAME'.", "Type: open github"] },
  { id: "theme", chapter: "explore", label: "Picked a colour", hint: "Change the accent colour", typed: "theme ice", clues: ["help lists the colour names after 'theme NAME'.", "Type: theme ice"] },
  { id: "fortune", chapter: "explore", label: "Took a fortune", hint: "Ask for a line of wisdom", typed: "fortune", clues: ["Under 'fun' in help. Every second one is a clue.", "Type: fortune"] },
  { id: "whoami", chapter: "explore", label: "Checked who you are", hint: "Ask the terminal who you are", typed: "whoami", clues: ["Under 'your session' in help.", "Type: whoami"] },
  { id: "date", chapter: "explore", label: "Checked the time in Cairo", hint: "Ask what time it is in Cairo", typed: "date", clues: ["Under 'fun' in help: the time in Cairo.", "Type: date"] },
  { id: "env", chapter: "investigate", label: "Read the .env file", hint: "Read a file that ls does not show", typed: "cat .env", clues: ["ls counts what it hides, and help says which flag shows it.", "Type: ls -a, then cat .env"] },
  { id: "history", chapter: "investigate", label: "Read the shell history", hint: "Read the log that .env points to", typed: "cat .bash_history", clues: [".env has a HISTFILE line. That is a file name.", "Type: cat .bash_history"] },
  { id: "secret", chapter: "investigate", label: "Found the secret", hint: "Open the file that refuses to open", typed: "secret", clues: ["cat secret.txt is refused and says what the lock wants: a 6-letter word from the file's own name.", "Type: secret"] },
  { id: "coffee", chapter: "replay", label: "Brewed a coffee", hint: "Run line 3 of the shell history", typed: "coffee", clues: ["The history numbers its lines and says how to run one again.", "Type: coffee, or replay 3"] },
  { id: "vim", chapter: "replay", label: "Got stuck in vim", hint: "Run line 4 of the shell history", typed: "vim todo.md", clues: ["Line 4 opens todo.md in an editor. Leaving it is part of the joke.", "Type: vim todo.md, then :q to leave"] },
  { id: "rm", chapter: "replay", label: "Tried to delete everything", hint: "Run line 5 of the shell history", typed: "rm -rf ./cache", clues: ["Line 5 removes files. It is safe here.", "Type: rm -rf ./cache, or replay 5"] },
  { id: "matrix", chapter: "replay", label: "Took the red pill", hint: "Run line 6 of the shell history", typed: "matrix", clues: ["Line 6 is one word. You do not need to know what it does.", "Type: matrix, or replay 6"] },
  { id: "hack", chapter: "replay", label: "Tried to hack in", hint: "Run line 7 of the shell history", typed: "hack", clues: ["Line 7 is one word, four letters.", "Type: hack, or replay 7"] },
  { id: "sudo", chapter: "escalate", label: "Asked for more power", hint: "Use the word that line 8 of the history starts with", typed: "sudo", clues: ["whoami says you are not in the sudoers file. Run sudo on its own to see how it works.", "Type: sudo"] },
  { id: "hire", chapter: "escalate", label: "Hired the developer", hint: "Ask for the one thing a guest may ask", typed: "sudo hire basem", clues: ["sudo -l gives a definition and a letter count for each word, and says where each is printed. History line 8 has the same counts.", "Type: sudo hire basem"] },
];

export const TOTAL_DISCOVERIES = DISCOVERIES.length;

/** Commands that are not in `help`. They are found by following clues. */
export const UNLISTED_NAMES = ["secret", "matrix", "hack", "coffee", "vim", "sudo", "hire", "replay"] as const;
const UNLISTED_TROPHIES = ["secret", "matrix", "hack", "coffee", "vim", "rm", "sudo", "hire"];

export type Clue = { id: string; target: string; text: string };

/** Clues are OBSERVATIONS: what the machine printed, and the loose end it
    leaves. They never say what to type. `notes` lists them; a clue shows as
    solved once its trophy is found. */
export const CLUES: readonly Clue[] = [
  { id: "c_hidden", target: "env", text: "ls says some items are hidden. help says which flag shows them." },
  { id: "c_histfile", target: "history", text: ".env has a HISTFILE line. That is a file name, and it starts with a dot." },
  { id: "c_pill", target: "matrix", text: "History line 6 is one word. It is a command, and you can run it." },
  { id: "c_hack", target: "hack", text: "History line 7 is one word, four letters. Run it." },
  { id: "c_editor", target: "vim", text: "History line 4 opens todo.md in an editor." },
  { id: "c_delete", target: "rm", text: "History line 5 removes files. The terminal is safe." },
  { id: "c_fuel", target: "coffee", text: "History line 3 is one word. neofetch shows a line named fuel." },
  { id: "c_locked", target: "secret", text: "cat secret.txt is refused. The lock wants a 6-letter word from the file name." },
  { id: "c_sudoers", target: "sudo", text: "whoami: not in the sudoers file. History line 8 starts with sudo." },
  { id: "c_shape", target: "hire", text: "History line 8 is scrubbed: a verb (4 letters) and a name (5 letters). todo.md has the same gap." },
];

export const RANKS = [
  { id: "guest", at: 0 },
  { id: "explorer", at: 5 },
  { id: "hacker", at: 15 },
  { id: "root", at: TOTAL_DISCOVERIES },
] as const;

export type RankId = (typeof RANKS)[number]["id"];

export const rankFor = (count: number): RankId => {
  let rank: RankId = "guest";
  for (const step of RANKS) if (count >= step.at) rank = step.id;
  return rank;
};

/** Root gets a # prompt, like a real shell. */
export const promptSymbol = (rank: RankId) => (rank === "root" ? "#" : "$");

const meter = (count: number, width = 16) => {
  const filled = Math.round((count / TOTAL_DISCOVERIES) * width);
  return `<span class="hl">${"█".repeat(filled)}</span>${dim("░".repeat(width - filled))}`;
};

export function trophiesOutput(found: readonly string[]) {
  const have = new Set(found);
  const count = DISCOVERIES.filter((item) => have.has(item.id)).length;
  const rank = rankFor(count);
  const next = RANKS.find((step) => step.at > count);

  const rows = DISCOVERIES.map((item) =>
    have.has(item.id)
      ? `  <span class="ok">✓</span> ${bright(item.label)}`
      : `  ${dim("·")} ${dim(item.hint)}`,
  );

  return [
    rule("trophies"),
    `  ${key("rank")}<span class="hl">${rank}</span>`,
    `  ${key("found")}${count} of ${TOTAL_DISCOVERIES}`,
    `  ${meter(count)}`,
    `  ${RANKS.map((step) =>
      step.id === rank ? `<span class="hl">${step.id}</span>` : step.at < count ? bright(step.id) : dim(step.id),
    ).join(dim(" › "))}`,
    next
      ? `  ${dim(`${next.at - count} more to reach ${next.id}`)}`
      : `  ${dim("Everything found. You have root.")}`,
    "",
    ...rows,
    "",
    count === TOTAL_DISCOVERIES
      ? `  ${hint("certificate")} ${dim("shows your stats")}`
      : `  ${hint("hint")} ${dim("gives a nudge for the next one")}`,
  ].join("\n");
}

export const rankUpOutput = (rank: RankId) => {
  const lines: Record<Exclude<RankId, "guest">, string[]> = {
    explorer: [
      `<span class="hl">Rank up: explorer</span>`,
      dim("Your prompt now shows your new name."),
      `${hint("Stuck?")} Type ${hint("hint")}. It points, it does not tell.`,
      `${hint("Clues")} you find are saved: ${hint("notes")}.`,
      dim("ls counts what it hides."),
    ],
    hacker: [
      `<span class="hl">Rank up: hacker</span>`,
      dim("Fifteen trophies. You read the config"),
      dim("and the log. Now run what the log shows,"),
      dim("then ask for the one thing a guest may."),
    ],
    root: [],
  };
  return rank === "guest" ? "" : lines[rank].join("\n");
};

/* ------------------------------------------------------------- themes */

export const THEMES = ["amber", "ice", "moss", "iris", "rose", "gold"] as const;
export type ThemeId = (typeof THEMES)[number];

export function themeOutput(current: ThemeId, root: boolean) {
  return [
    rule("theme"),
    ...THEMES.map((id) => {
      const note =
        id === current
          ? `<span class="ok">active</span>`
          : id === "gold" && !root
            ? dim("locked until root")
            : "";
      return `  <span class="sw sw-${id}">██</span> ${id.padEnd(8)}${note}`;
    }),
    "",
    `  ${hint("theme ice")} ${dim("to switch")}`,
  ].join("\n");
}

/* ---------------------------------------------------- files and links */

export const FILES = [
  "about.md",
  "skills.txt",
  "projects.md",
  "contact.md",
  "secret.txt",
  "cv.pdf",
  "todo.md",
] as const;

export const FILE_COMMAND: Record<string, string> = {
  "about.md": "about",
  "skills.txt": "skills",
  "projects.md": "projects",
  "contact.md": "contact",
  "secret.txt": "secret",
  "todo.md": "todo",
};

export function lsOutput(all: boolean) {
  const cell = (name: string, cls: string) =>
    `<span class="${cls}">${name.padEnd(12)}</span>`;
  const rows = [
    cell("about.md", "info") + cell("skills.txt", "info") + cell("projects.md", "info"),
    cell("contact.md", "info") + cell("secret.txt", "info") + cell("cv.pdf", "warn"),
    cell("todo.md", "info"),
  ];
  if (all) rows.push(cell(".env", "dim") + cell(".bash_history", "dim"));
  const list = rows.join("\n").replace(/ +(<\/span>)$/gm, "$1");
  return all ? list : `${list}\n${dim("7 items shown, 2 hidden. ls -a shows all.")}`;
}

/** What `cat .bash_history` prints: Basem's last session, numbered. Line 8
    was scrubbed; the block counts are the letter counts of the verb and the
    name. The footer teaches `replay`, so every line is a command the player
    has been shown and can run without knowing what it does. */
export const BASH_HISTORY_OUTPUT = [
  `  ${dim("1")}  cd portfolio`,
  `  ${dim("2")}  git commit -m "ship it"`,
  `  ${dim("3")}  coffee`,
  `  ${dim("4")}  vim todo.md`,
  `  ${dim("5")}  rm -rf ./cache`,
  `  ${dim("6")}  matrix`,
  `  ${dim("7")}  hack`,
  `  ${dim("8")}  sudo ${dim("████ █████")}`,
  `  ${dim("9")}  exit`,
  "",
  `  ${dim("Line 8 was scrubbed: a verb (4) and")}`,
  `  ${dim("a name (5). todo.md has the same gap:")}`,
  `  ${dim("someone else has to run it.")}`,
  `  ${dim("Run any line again:")} ${hint("replay 6")}`,
].join("\n");

/** `replay N`: what each history line does when run again. A line that is a
    real command is handed back to the shell; the rest answer in place. */
export const REPLAY_LINES: Record<number, { run?: string; say?: string }> = {
  1: { say: "cd: you are already in portfolio" },
  2: { say: 'git: nothing to commit. "ship it" already shipped.' },
  3: { run: "coffee" },
  4: { run: "vim todo.md" },
  5: { run: "rm -rf ./cache" },
  6: { run: "matrix" },
  7: { run: "hack" },
  8: { say: "line 8 was scrubbed. Nothing to replay.\nsudo -l says what a guest may ask." },
  9: { say: "exit: not replaying that one. It would close this." },
};

/** Clues the history gives away just by being read. */
export const HISTORY_CLUES = ["c_fuel", "c_pill", "c_hack", "c_editor", "c_delete", "c_sudoers", "c_shape"];

export const ENV_OUTPUT = [
  `${key("HIRE_ME", 12)}true`,
  `${key("AVAILABLE", 12)}true`,
  `${key("COFFEE", 12)}required`,
  `${key("HISTFILE", 12)}.bash_history`,
  `${key("API_KEY", 12)}${dim("not here, nice try")}`,
  `${key("PRIVILEGE", 12)}sudo VERB NAME`,
].join("\n");

export const OPEN_TARGETS: Record<string, { label: string; url: string }> = {
  github: { label: "GitHub profile", url: GITHUB_URL },
  linkedin: { label: "LinkedIn profile", url: LINKEDIN_URL },
  email: { label: "your mail app", url: MAILTO },
  cv: { label: "the CV (PDF)", url: CV_PATH },
  trosc: { label: "the Trosc platform", url: TROSC_URL },
  repo: { label: "the Trosc backend repo", url: TROSC_REPO_URL },
  laravel: { label: "the Laravel shop repo", url: LARAVEL_REPO_URL },
  neuroscan: { label: "the NeuroScan-AI repo", url: NEUROSCAN_REPO_URL },
};

export const OPEN_NAMES = Object.keys(OPEN_TARGETS);

export function openListOutput() {
  return [
    rule("open"),
    ...OPEN_NAMES.map((name) => `  ${key(name, 11)}${dim(OPEN_TARGETS[name].label)}`),
    "",
    `  ${hint("open github")} ${dim("to jump out")}`,
  ].join("\n");
}

/* ------------------------------------------------------ dynamic output */

type Fortune = { text: string; clue?: string };

/** Half the cookies are clues, written as riddles. `nextFortune` serves an
    uncollected clue on every second call, so the jar always has something to
    teach and never repeats a clue you already hold. */
const FORTUNES: Fortune[] = [
  { text: "Some folders show less than they hold.", clue: "c_hidden" },
  { text: "A slow query is a feature request for an index." },
  { text: "Old commands leave footprints in a dotfile.", clue: "c_histfile" },
  { text: "Every outage is a test you did not write." },
  { text: "A log line is a command you can run again.", clue: "c_pill" },
  { text: "Read the logs first. Then read them again." },
  { text: "Line 7 of the log is four letters. Run it.", clue: "c_hack" },
  { text: "Clean architecture is mostly saying no." },
  { text: "Line 4 of the log opens a file in an editor.", clue: "c_editor" },
  { text: "Comments age. Good names do not." },
  { text: "Line 5 of the log removes files. It is safe.", clue: "c_delete" },
  { text: "Cache invalidation: ask again later." },
  { text: "Line 3 of the log is what Basem runs on.", clue: "c_fuel" },
  { text: "The best endpoint is the one you deleted." },
  { text: "A locked file opens for its own name.", clue: "c_locked" },
  { text: "Staging is where optimism goes to be tested." },
  { text: "Guests ask. sudo on its own explains how.", clue: "c_sudoers" },
  { text: "Ship small. Rollback is a feature." },
  { text: "Line 8 of the log is scrubbed. Count the blocks.", clue: "c_shape" },
  { text: "If it has no owner, it has no tests." },
];

export function nextFortune(calls: number, have: readonly string[], shift: number): Fortune {
  if (calls % 2 === 1) {
    const clue = FORTUNES.find((item) => item.clue && !have.includes(item.clue));
    if (clue) return clue;
  }
  const plain = FORTUNES.filter((item) => !item.clue);
  return plain[(calls + shift) % plain.length];
}

/** The fortune as plain text, for the line that decodes out of noise. */
export const fortuneLine = (text: string) => `  "${text}"`;

/** "4m 12s", "38s". */
export const uptimeText = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  return minutes > 0 ? `${minutes}m ${String(total % 60).padStart(2, "0")}s` : `${total}s`;
};

export type SessionInfo = { uptime: string; commands: number; theme: string };

export function whoamiOutput(user: string, rank: RankId, count: number, session?: SessionInfo) {
  return [
    rule("whoami"),
    `  ${key("user", 10)}${user}`,
    `  ${key("rank", 10)}<span class="hl">${rank}</span>`,
    `  ${key("sudoers", 10)}<span class="err">not listed</span>`,
    `  ${key("trophies", 10)}${count} of ${TOTAL_DISCOVERIES}  ${meter(count, 10)}`,
    ...(session
      ? [
          `  ${key("session", 10)}${session.uptime}`,
          `  ${key("commands", 10)}${session.commands}`,
          `  ${key("accent", 10)}<span class="sw sw-${session.theme}">██</span> ${session.theme}`,
        ]
      : []),
    `  ${key("status", 10)}<span class="ok">impressed</span>`,
    "",
    `  ${dim("Curious people find the good stuff.")}`,
    `  ${dim("A guest may still ask for one thing.")}`,
  ].join("\n");
}

export function dateOutput(now: Date) {
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", ...options }).format(now);
  return [
    `  ${key("cairo", 7)}${bright(fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" }))}`,
    `  ${key("time", 7)}${bright(fmt({ hour: "2-digit", minute: "2-digit", hour12: false }))}`,
    `  ${dim("Basem is on Egypt time.")}`,
  ].join("\n");
}

export function historyOutput(entries: readonly string[]) {
  if (entries.length === 0) return dim("  Nothing yet. Type help to start.");
  return entries
    .slice(-12)
    .map((entry, index, list) => {
      const n = entries.length - list.length + index + 1;
      return `  ${dim(String(n).padStart(3))}  ${entry.replace(/[<>&]/g, "")}`;
    })
    .join("\n");
}

export function hireOutput(user: string) {
  return [
    `[sudo] password for ${user}: ********`,
    `<span class="ok">Permission granted.</span>`,
    "",
    "  Basem is open to backend roles,",
    "  remote collaborations and freelance",
    "  work.",
    "",
    `  ${key("email", 10)}${link(MAILTO, EMAIL)}`,
    `  ${key("linkedin", 10)}${link(LINKEDIN_URL, "linkedin.com/in/BasemEsam")}`,
    `  ${key("cv", 10)}${link(CV_PATH, "basem-esam-cv.pdf")}`,
    "",
    `  ${dim("How the trail led here:")}`,
    `  ${dim(".env      HIRE_ME=true")}`,
    `  ${dim("todo.md   someone else has to run it")}`,
    `  ${dim("neofetch  basem@portfolio")}`,
    "",
    `  ${badge("Achievement unlocked: good hire")}`,
  ].join("\n");
}

export const SUDO_DENIED = [
  `<span class="err">%USER% is not in the sudoers file.</span>`,
  "This incident will be reported.",
  dim("usage: sudo VERB NAME"),
  `${dim("       ")}${hint("sudo -l")} ${dim("what may a guest ask?")}`,
].join("\n");

/** `sudo -l`: the real flag that lists what a user may run. Each word comes
    with a plain definition and a letter count, like a crossword clue. */
export const SUDO_LIST = [
  rule("sudo -l"),
  "  A guest may ask for one thing:",
  `    ${bright("sudo VERB NAME")}`,
  "",
  `  ${key("VERB", 7)}what a company does to`,
  `  ${key("", 7)}the person it takes on ${dim("(4)")}`,
  `  ${key("", 7)}${dim("The first key in .env says it.")}`,
  `  ${key("NAME", 7)}whose machine this is ${dim("(5)")}`,
  `  ${key("", 7)}${dim("neofetch prints it before @.")}`,
  "",
  `  ${dim("Same shape as line 8 of the history,")}`,
  `  ${dim("and the last open item in todo.md.")}`,
].join("\n");

/** `cat secret.txt`: refused, but the refusal says what the lock wants. */
export const SECRET_DENIED = [
  "cat: secret.txt: permission denied",
  "The lock wants a word: its own name,",
  "without .txt (6 letters).",
];

/** The line under the boot banner. It is the contract with the player. */
export const HOUSE_RULE = "House rule: anything this machine prints, you may try.";

export const HIRE_BARE = [
  `<span class="err">hire: permission denied</span>`,
  dim("Admin only. sudo borrows admin power."),
].join("\n");

/* ------------------------------------------------------------- sudo logic */

export type SudoReply =
  | { kind: "list" }
  | { kind: "rm" }
  | { kind: "hire" }
  | { kind: "hire-help"; error: string; info: string[] }
  | { kind: "denied"; info: string[] };

const NAME_NUDGE = ["5 letters. Whose machine is this?", "neofetch prints it before @."];

/** What `sudo ARGS` does. Pure, so the fair-play test can read every reply and
    Terminal.tsx only has to show it. A near miss is told how it missed (wrong
    length, wrong word, wrong name) and where to look. No reply ever spells the
    answer out. `args` is lower-cased, `shown` is what the player typed. */
export function sudoReply(args: readonly string[], shown: readonly string[] = args): SudoReply {
  const verb = args[0];
  if (verb === "-l") return { kind: "list" };
  if (verb === "rm") return { kind: "rm" };

  if (verb === "hire") {
    const name = args[1];
    if (!name) return { kind: "hire-help", error: "hire: who? A verb needs a name.", info: NAME_NUDGE };
    // "me" is what the .env key says (HIRE_ME), so it is a fair thing to try.
    if (name === "basem" || name === "me") return { kind: "hire" };
    return { kind: "hire-help", error: `hire: no candidate named "${shown[1]}" here`, info: NAME_NUDGE };
  }

  const info: string[] = [];
  if (verb && !verb.startsWith("-")) {
    info.push(
      verb.length === 4
        ? "Right length, wrong word. See .env."
        : `"${(shown[0] ?? verb).slice(0, 12)}": ${verb.length} letters, not 4.`,
    );
  }
  return { kind: "denied", info };
}

/** Wrap prose to the terminal grid with a hanging two-space indent. */
export function wrapText(text: string, width = COLS - 4): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && line.length + 1 + word.length > width) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out.map((row) => `  ${row}`);
}

export function hintOutput(item: Discovery, level: 1 | 2 | 3, remaining: number) {
  const body =
    level === 1
      ? wrapText(item.hint)
      : level === 2
        ? wrapText(item.clues[0])
        : [`  <span class="hl">${item.clues[1]}</span>`];
  return [
    rule("hint"),
    `  ${key("next", 7)}${remaining} trophies to go`,
    `  ${key("clue", 7)}${level} of 3`,
    "",
    ...body,
    "",
    level < 3
      ? `  ${dim("Try it, then ask again. A hint points.")}`
      : `  ${dim("The answer. It is counted on your certificate.")}`,
  ].join("\n");
}

/* ------------------------------------------------------------- finale */

const GLYPHS = {
  R: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
  O: [" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  T: ["████████╗", "╚══██╔══╝", "   ██║   ", "   ██║   ", "   ██║   ", "   ╚═╝   "],
} as const;

const glyphRows = (letters: (keyof typeof GLYPHS)[]) =>
  Array.from({ length: 6 }, (_, row) => letters.map((l) => GLYPHS[l][row]).join(""));

export const ROOT_BANNER = glyphRows(["R", "O", "O", "T"]).join("\n");
export const ROOT_BANNER_COLS = glyphRows(["R", "O", "O", "T"])[0].length;

const duration = (ms: number) => {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ${minutes % 60}m`;
  return `${Math.round(hours / 24)} days`;
};

export type CertificateStats = { hints: number; answers: number; since: number | null; now: Date };

export function certificateOutput({ hints, answers, since, now }: CertificateStats) {
  const inner = COLS - 2;
  const row = (content = "") =>
    `<span class="hl">║</span>${content}${" ".repeat(Math.max(0, inner - visibleLength(content)))}<span class="hl">║</span>`;
  const field = (name: string, value: string) => row(`  ${key(name, 12)}${value}`);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(now);

  return [
    `<span class="hl">╔${"═".repeat(inner)}╗</span>`,
    row(`  <span class="hd">certificate of curiosity</span>`),
    row(),
    field("awarded to", bright("a very curious visitor")),
    field("trophies", `${TOTAL_DISCOVERIES} of ${TOTAL_DISCOVERIES}`),
    field("hints used", String(hints)),
    field("journey", since ? duration(now.getTime() - since) : "one sitting"),
    field("date", date),
    field(
      "honour",
      answers === 0
        ? `<span class="ok">no answers shown</span>`
        : dim(`${answers} answers shown`),
    ),
    row(),
    field("signed", bright("Basem Esam")),
    `<span class="hl">╚${"═".repeat(inner)}╝</span>`,
  ].join("\n");
}

export const FINALE_BOOT = [
  `[<span class="ok"> OK </span>] ${TOTAL_DISCOVERIES} of ${TOTAL_DISCOVERIES} trophies verified`,
  `[<span class="ok"> OK </span>] escalating privileges`,
  `[<span class="ok"> OK </span>] root shell ready`,
];

export const FINALE_TEXT = [
  `<span class="hl">Every trophy found.</span>`,
  "",
  "Most visitors read the page and leave.",
  "You read the files, the fortunes and the",
  "error messages, and you asked for what",
  "was not on the list. That is the habit",
  "of a good engineer.",
  "",
  `Basem is open to backend roles, remote`,
  `work and freelance projects.`,
  `Say hello: ${link(MAILTO, EMAIL)}`,
];

export const FINALE_REWARDS = [
  `${key("unlocked", 12)}${dim("prompt ends in #")}`,
  `${key("", 12)}${dim("theme gold")}`,
  `${key("", 12)}${dim("certificate, your stats")}`,
];

export const RM_OUTPUT = [
  `<span class="err">rm: it is dangerous to operate</span>`,
  `<span class="err">recursively on '/'</span>`,
  "",
  dim("Just kidding. Nothing was deleted."),
].join("\n");

export type RmStep = {
  at: number;
  bar?: { label: string; ms: number };
  html?: string;
  tone?: "error";
  glitch?: boolean;
  cue?: "denied";
};

/** `rm -rf /`: three directories "go", then the shell refuses. */
export const RM_SEQUENCE: RmStep[] = [
  { at: 0, bar: { label: "/usr", ms: 500 } },
  { at: 600, bar: { label: "/etc", ms: 450 } },
  { at: 1150, bar: { label: "/home", ms: 450 } },
  { at: 1800, html: "rm: it is dangerous to operate", tone: "error", glitch: true, cue: "denied" },
  { at: 2000, html: "recursively on '/'", tone: "error" },
];
export const RM_DONE_AT = 2900;
export const RM_CLOSING = dim("Just kidding. Nothing was deleted.");

export const VIM_OUTPUT = [
  dim("~"),
  `${dim("~")}      Welcome to vim.`,
  `${dim("~")}      There is no easy way out.`,
  dim("~"),
  dim("~"),
  `<span class="hl">-- INSERT --</span>  ${dim("1,1  All  type :q to leave")}`,
].join("\n");

export const VIM_EXIT = "Escaped. Most people need a search engine.";

/* ---------------------------------------------------- static outputs */

/** The help screen. Commands the machine has already shown the player join
    it as they are earned, so every tool is reachable from here. */
export const helpOutput = (found: readonly string[]) => {
  const untried = DISCOVERIES.find(
    (item) => !found.includes(item.id) && (COMMAND_NAMES as readonly string[]).includes(item.id),
  );
  const left = UNLISTED_TROPHIES.filter((id) => !found.includes(id)).length;
  const learned: string[] = [];
  if (found.includes("history")) learned.push(`  ${key("replay N", 11)}run a history line again`);
  if (found.includes("sudo")) learned.push(`  ${key("sudo -l", 11)}what a guest may ask`);
  const tail = [
    ...(learned.length ? ["", dim("  found on this machine"), ...learned] : []),
    "",
    ...(untried ? [`  ${dim("Not tried yet:")} ${hint(untried.id)}`] : []),
    left > 0
      ? `  ${dim(`${left} trophies need commands that are`)}\n  ${dim("not listed. The machine names them:")}\n  ${dim("read what it prints, then try it.")}`
      : `  ${dim("Nothing unlisted left. You found it all.")}`,
  ];
  return `${COMMAND_OUTPUT.help}\n${tail.join("\n")}`;
};

export const COMMAND_OUTPUT: Record<string, string> = {
  help: (() => {
    const row = (name: string, text: string) => `  ${key(name, 11)}${text}`;
    const group = (name: string) => dim(`  ${name}`);
    return [
      rule("help"),
      group("about basem"),
      row("about", "who built this"),
      row("skills", "the technical toolkit"),
      row("projects", "what has been shipped"),
      row("contact", "ways to reach Basem"),
      row("neofetch", "quick system summary"),
      "",
      group("files and links"),
      row("ls", "list files (-a shows all)"),
      row("cat FILE", "read one: cat about.md"),
      row("open NAME", "github, linkedin, email,"),
      row("", "cv, trosc, repo, laravel,"),
      row("", "neuroscan"),
      row("cv", "open the CV"),
      "",
      group("fun"),
      row("fortune", "a line, sometimes a clue"),
      row("date", "the time in Cairo"),
      row("notes", "clues you have collected"),
      "",
      group("your session"),
      row("whoami", "who you are here"),
      row("trophies", "progress and rank"),
      row("hint", "a nudge for the next trophy"),
      row("theme NAME", "amber ice moss iris rose"),
      row("history", "commands you have run"),
      row("crt on|off", "retro screen effect"),
      row("reset", "erase progress, start over"),
      row("echo TEXT", "repeat text back"),
      row("clear", "empty the screen"),
      row("exit", "close the terminal"),
      "",
      `  ${hint("Tab")} completes ${hint("↑")} recalls ${hint("^L")} clears`,
    ].join("\n");
  })(),

  about: [
    rule("about"),
    `  ${key("name")}Basem Esam`,
    `  ${key("role")}Backend Engineer, CS student`,
    `  ${key("based")}Port Said, Egypt`,
    "",
    "  Builds and runs a 100+ endpoint",
    "  production API for 200+ users.",
    "  Active in competitive programming",
    "  (ICPC) and tech communities (GDG,",
    "  Mech Hackers).",
    "",
    "  Started building websites at age 11,",
    "  inspired by a teacher who believed in",
    "  potential.",
    "",
    `  ${dim(`"Code is poetry written in logic"`)}`,
  ].join("\n"),

  skills: [
    rule("skills"),
    `  ${key("backend")}Node.js, Express, NestJS`,
    `  ${key("")}PHP, Laravel`,
    `  ${key("data")}MongoDB (Mongoose), MySQL`,
    `  ${key("")}PostgreSQL, Redis`,
    `  ${key("devops")}Docker, Kubernetes, Git`,
    `  ${key("")}Linux admin, Bash`,
    `  ${key("design")}OOP, clean architecture`,
    `  ${key("")}REST API design, RBAC`,
    `  ${key("people")}Problem solving, leadership`,
    `  ${key("")}Teaching and mentoring`,
    `  ${key("")}Competitive programming`,
  ].join("\n"),

  projects: [
    rule("projects"),
    `  <span class="hl">▸</span> ${bright("Trosc Student Club Platform")}`,
    `    <span class="ok">live</span> ${dim("Node, Express, MongoDB")}`,
    "    12 collections, 17 services,",
    "    100+ endpoints, 200+ members",
    `    ${link(TROSC_URL, "trosc.vercel.app")}`,
    `    ${link(TROSC_REPO_URL, "Basem3sam/trosc-backend")}`,
    "",
    `  <span class="hl">▸</span> ${bright("Laravel E-commerce Platform")}`,
    `    ${dim("PHP, Laravel, MySQL, completed")}`,
    `    ${link(LARAVEL_REPO_URL, "Basem3sam/laravel-ecommerce-app")}`,
    "",
    `  <span class="hl">▸</span> ${bright("NeuroScan-AI")}`,
    `    ${dim("Team project, 3rd-year exam")}`,
    "    Brain-tumor detection pipeline:",
    "    CNN, KNN and K-Means ensembles",
    `    ${link(NEUROSCAN_REPO_URL, "Basem3sam/neuroscan-ai")}`,
    "",
    `  More on ${link(GITHUB_URL, "github.com/basem3sam")}`,
  ].join("\n"),

  contact: [
    rule("contact"),
    `  ${key("email")}${link(MAILTO, EMAIL)}`,
    `  ${key("linkedin")}${link(LINKEDIN_URL, "linkedin.com/in/BasemEsam")}`,
    `  ${key("github")}${link(GITHUB_URL, "github.com/basem3sam")}`,
    `  ${key("based")}Port Said, Egypt`,
    "",
    `  ${key("status")}<span class="ok">available for opportunities</span>`,
    "  Open to backend projects, remote",
    "  collaborations and freelance work.",
    "",
    `  ${hint("open email")} ${dim("starts a message")}`,
    "",
    `  ${dim("A guest may ask this machine for")}`,
    `  ${dim("one more thing. The word is sudo.")}`,
  ].join("\n"),

  todo: [
    rule("todo.md"),
    `  ${dim("[x]")} ship the portfolio`,
    `  ${dim("[x]")} clear ./cache`,
    `  ${dim("[x]")} coffee`,
    `  ${dim("[ ]")} sleep`,
    `  ${dim("[ ]")} sudo ____ _____`,
    `      ${dim("not me. Someone else has to run it.")}`,
    `      ${dim("It takes a team that wants me.")}`,
  ].join("\n"),

  secret: [
    rule("classified"),
    `  ${badge("CLEARANCE: ROOT-LEVEL")}`,
    "",
    "  Most visitors never get this far.",
    "  You did not stumble in. You looked.",
    "",
    `  ${dim("The terminal only opens for people who")}`,
    `  ${dim("try the thing nobody told them to try.")}`,
    "",
    `  ${dim(`"Every system has a back door.`)}`,
    `  ${dim(`The good engineers check for it first."`)}`,
    `  ${dim("- Basem Esam")}`,
    "",
    `  ${hint("Whisper:")} some files are hidden on purpose.`,
    `  ${dim("Try")} ${hint("ls -a")} ${dim("and read what you find.")}`,
  ].join("\n"),

};

/** Commands offered as quick chips and tab completion. Hidden ones
    (sudo, vim, rm, .env) are deliberately absent. */
export const COMMAND_NAMES = [
  "help",
  "about",
  "skills",
  "projects",
  "contact",
  "neofetch",
  "ls",
  "cat",
  "open",
  "cv",
  "theme",
  "trophies",
  "hint",
  "fortune",
  "notes",
  "whoami",
  "date",
  "history",
  "crt",
  "reset",
  "clear",
  "exit",
];

/** Commands that take an argument, with the values Tab can complete. */
/** The staged build-up before the secret message is revealed. */
export const SECRET_SEQUENCE: { at: number; html: string; tone?: "error" | "info" | "success" }[] = [
  { at: 0, html: "ACCESS RESTRICTED", tone: "error" },
  { at: 700, html: `  <span class="dim">scanning for credentials...</span>` },
  { at: 1400, html: `  <span class="dim">no credentials found</span>` },
  { at: 2100, html: `  <span class="wl">intrusion detected. you are not supposed to be here.</span>` },
  { at: 3000, html: `  <span class="dim">bypassing lock</span> <span class="ok">████████████</span> <span class="dim">100%</span>` },
  { at: 3800, html: `  <span class="dim">decrypting</span> <span class="key">basem.secret</span><span class="dim">...</span>` },
];

export const COMMAND_ARGS: Record<string, readonly string[]> = {
  open: OPEN_NAMES,
  theme: THEMES,
  cat: [...Object.keys(FILE_COMMAND)],
  crt: ["on", "off"],
};

export const COMMAND_ALIASES: Record<string, string> = {
  مساعدة: "help",
  عني: "about",
  نبذة: "about",
  مهارات: "skills",
  مشاريع: "projects",
  تواصل: "contact",
  اتصال: "contact",
  سر: "secret",
  "secret.txt": "secret",
  ماتريكس: "matrix",
  اختراق: "hack",
  قهوة: "coffee",
  من: "whoami",
  مسح: "clear",
  خروج: "exit",
  clues: "notes",
  clue: "notes",
  journal: "notes",
  trophy: "trophies",
  achievements: "trophies",
  stats: "trophies",
  cls: "clear",
  quit: "exit",
  time: "date",
  "?": "help",
};


const COFFEE_QUOTES: string[][] = [
  ["Developers run on coffee and", "semicolons."],
  ["while (!coffee) { sleep(); }"],
  ['git commit -m "fixed it. coffee."'],
  ["It works on my machine. And on", "my second cup."],
  ["Debugging: turning coffee into", "fewer bugs, one cup at a time."],
  ["null pointer? No. Null coffee."],
];

/** What prints once a cup is ready. `index` rotates the line so two cups in a
    row never say the same thing; `cups` is the count for this visit. */
export function coffeeOutput(index: number, cups: number) {
  const quote = COFFEE_QUOTES[index % COFFEE_QUOTES.length];
  return [
    `  <span class="hl">coffee.exe</span> ${dim("exited with code 0")}`,
    "",
    ...quote.map((row) => `  ${row}`),
    "",
    cups > 1
      ? `  ${dim(`cup ${cups} this visit. Steady.`)}`
      : `  ${dim("Error 418: I am a teapot. Just kidding.")}`,
  ].join("\n");
}


export type MatrixStep = { at: number; html?: string; decode?: string };

/** How long the last line takes to resolve out of noise. */
export const MATRIX_DECODE_MS = 1500;

/** `matrix` is staged: a header, three beats typed slowly, a binary whisper,
    then a line that decodes out of noise while the code rain falls. */
export const MATRIX_SEQUENCE: MatrixStep[] = [
  { at: 0, html: rule("matrix") },
  { at: 600, html: `  ${bright("Wake up, Neo...")}` },
  { at: 1900, html: "  The Matrix has you..." },
  { at: 3100, html: "  Follow the white rabbit." },
  { at: 4100, html: `  ${dim("01010111 01100001 01101011 01100101")}` },
  { at: 4500, html: `  ${dim("01010101 01110000")}` },
  { at: 5200, decode: "  Reality.exe has stopped working" },
];

/** Printed once the decode has landed. */
export const matrixOutput = () =>
  [
    `  <span class="warn">You are now in the Matrix</span>`,
    "",
    "  Red pill or blue pill? Just kidding,",
    "  you are still in Basem's portfolio.",
  ].join("\n");


export type HackStep = {
  at: number;
  html?: string;
  tone?: "error";
  bar?: { label: string; ms: number };
  decode?: { text: string; ms: number };
  /** One short screen glitch when the step lands. */
  glitch?: boolean;
  /** A sound cue when the step lands. */
  cue?: "granted" | "denied";
};

/** `hack` is staged: type-ahead, two progress bars, a hash that cracks, a
    break-in, two downloads, then the joke lands. Bars and the decode are live
    components; the rest is plain typed lines. */
export const HACK_SEQUENCE: HackStep[] = [
  { at: 0, html: rule("hack") },
  { at: 250, html: `<span class="warn">Initializing hack sequence...</span>` },
  { at: 800, html: "Connecting to mainframe..." },
  { at: 1400, bar: { label: "scanning ports", ms: 1000 } },
  { at: 2600, bar: { label: "firewall bypass", ms: 1100 } },
  { at: 3900, decode: { text: "  5f4dcc3b5aa7  ->  password", ms: 1100 } },
  { at: 5200, html: `<span class="ok">ACCESS GRANTED</span>`, glitch: true, cue: "granted" },
  { at: 5800, bar: { label: "secrets.zip", ms: 900 } },
  { at: 6800, bar: { label: "dev_facts.txt", ms: 700 } },
  { at: 7800, html: "ERROR: nice try, hacker.", tone: "error", glitch: true, cue: "denied" },
];

/** When the closing message and the trophy land. */
export const HACK_DONE_AT = 8800;

export const hackOutput = () =>
  [
    "  Real hacking is about building, not",
    "  breaking. Want to build something",
    `  together? ${link(GITHUB_URL, "github.com/basem3sam")}`,
  ].join("\n");


export type NeofetchInfo = { rank: RankId; count: number; theme: string; uptime: string };

/** The logo, the stack, and a few live lines about this very session. */
export function neofetchOutput({ rank, count, theme, uptime }: NeofetchInfo) {
  const logo = ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██████╔╝", "╚═════╝ "];
  const info = [
    `${bright("basem")}<span class="dim">@</span>${bright("portfolio")}`,
    dim("─".repeat(15)),
    `${key("role", 9)}Backend Engineer`,
    `${key("study", 9)}CS student`,
    `${key("from", 9)}Port Said, Egypt`,
    `${key("stack", 9)}Node, Express, Nest`,
    `${key("data", 9)}MongoDB, PostgreSQL`,
    `${key("infra", 9)}Docker, Linux, Bash`,
    `${key("api", 9)}100+ endpoints`,
    `${key("users", 9)}200+ members`,
    `${key("status", 9)}open to work`,
    `${key("fuel", 9)}dark roast`,
    `${key("rank", 9)}<span class="hl">${rank}</span>`,
    `${key("trophies", 9)}${count}/${TOTAL_DISCOVERIES}`,
    `${key("accent", 9)}<span class="sw sw-${theme}">██</span> ${theme}`,
    `${key("uptime", 9)}${uptime}`,
    "",
    ["ok", "info", "err", "warn", "hl", "wl", "key", "dim"]
      .map((c) => `<span class="${c}">██</span>`)
      .join(""),
  ];
  return (
    info
      .map((row, i) => {
        const left = logo[i] ?? "";
        return `<span class="hd">${left.padEnd(8)}</span>  ${row}`.trimEnd();
      })
      .join("\n")
      // Tight rows so the logo's blocks meet instead of showing gaps.
      .replace(/^/, '<span class="nf">') + "</span>"
  );
}


/** The clue board: what the person has collected, and what it solved. */
export function notesOutput(collected: readonly string[], found: readonly string[]) {
  const have = CLUES.filter((clue) => collected.includes(clue.id));
  const solved = have.filter((clue) => found.includes(clue.target)).length;
  const rows = have.flatMap((clue) => {
    const done = found.includes(clue.target);
    return wrapText(clue.text, COLS - 8).map((row, index) => {
      const text = done ? dim(row.trim()) : row.trim();
      const mark = index === 0 ? (done ? `<span class="ok">✓</span>` : `<span class="hl">?</span>`) : " ";
      return `  ${mark} ${text}`;
    });
  });
  return [
    rule("notes"),
    `  ${key("clues", 8)}${have.length} of ${CLUES.length} collected`,
    `  ${key("solved", 8)}${solved}`,
    "",
    ...(rows.length
      ? rows
      : [dim("  Nothing yet. Clues hide in files,"), dim("  fortunes and odd things to type.")]),
    "",
    `  ${hint("hint")} ${dim("if a clue will not click")}`,
  ].join("\n");
}

export type Intent = { words: string[]; clue?: string; lines: string[] };

/** Things people type that are not commands, answered with a nudge toward the
    command they were reaching for. Never a dead end. */
export const INTENTS: Intent[] = [
  {
    words: ["delete", "remove", "del", "erase", "wipe", "destroy", "format", "kill", "shred"],
    clue: "c_delete",
    lines: ["Not a command here. The shell history", "has a line that removes files.", "replay it once you have read it."],
  },
  {
    words: ["edit", "editor", "code", "notepad", "write", "ed", "text", "micro"],
    clue: "c_editor",
    lines: ["Not here. The shell history has a", "line that opens a file in an editor."],
  },
  {
    words: ["neo", "pill", "redpill", "red pill", "bluepill", "blue pill", "morpheus", "trinity", "rabbit", "white rabbit", "wake up", "wakeup"],
    clue: "c_pill",
    lines: ["Not a command here. The shell history", "has a six-letter word on line 6."],
  },
  {
    words: ["hacker", "hacking", "crack", "exploit", "breach", "pwn", "pwned", "bypass", "intrude"],
    clue: "c_hack",
    lines: ["Not a command here. The shell history", "has a four-letter word on line 7."],
  },
  {
    words: ["tea", "espresso", "latte", "caffeine", "mug", "brew", "java", "cappuccino", "drink"],
    clue: "c_fuel",
    lines: ["Not that drink. Line 3 of the shell", "history is what Basem runs on."],
  },
  {
    words: ["unlock", "reveal", "classified", "confidential", "mystery", "easteregg", "easter egg", "egg"],
    clue: "c_locked",
    lines: ["One file in the folder will not open.", "cat it, and read what the lock wants."],
  },
  {
    words: ["admin", "root", "su", "superuser", "permission", "permissions", "privilege", "privileges", "access", "password", "login", "authorize"],
    clue: "c_sudoers",
    lines: ["Guests have no keys. whoami shows your", "rank. Line 8 of the shell history", "starts with the word that borrows power."],
  },
  {
    words: ["job", "work", "recruit", "employ", "interview", "freelance", "hire me", "hireme", "candidate", "hiring", "employer", "offer", "onboard", "career", "vacancy"],
    clue: "c_shape",
    lines: ["Good instinct. Guests may ask one thing,", "and sudo explains how. Run it on its", "own and read the usage line."],
  },
  { words: ["dir", "list", "files", "folder", "tree"], lines: ["Try ls to see the folder."] },
  { words: ["read", "view", "less", "more", "show"], lines: ["To read a file, name it: cat FILE."] },
  { words: ["bye", "goodbye", "leave", "close"], lines: ["Try exit to close the terminal."] },
];


/* -------------------------------------------------------- fair-play map */

/** Everything the machine prints that can teach a player a word, with what
    must be typed to see it. `tests/puzzle-fairness.spec.ts` walks this list:
    a source only counts once every word of `typed` has been printed by an
    earlier source, and every trophy's `typed` must be reachable the same way.
    So no answer can depend on outside knowledge. */
export const SOURCES: { typed: string; text: () => string }[] = [
  { typed: "", text: () => HOUSE_RULE },
  { typed: "", text: () => helpOutput([]) },
  { typed: "about", text: () => COMMAND_OUTPUT.about },
  { typed: "skills", text: () => COMMAND_OUTPUT.skills },
  { typed: "projects", text: () => COMMAND_OUTPUT.projects },
  { typed: "contact", text: () => COMMAND_OUTPUT.contact },
  { typed: "neofetch", text: () => neofetchOutput({ rank: "guest", count: 0, theme: "amber", uptime: "1s" }) },
  { typed: "ls", text: () => lsOutput(false) },
  { typed: "ls -a", text: () => lsOutput(true) },
  { typed: "cat todo.md", text: () => COMMAND_OUTPUT.todo },
  { typed: "cat secret.txt", text: () => SECRET_DENIED.join("\n") },
  { typed: "cat .env", text: () => ENV_OUTPUT },
  { typed: "cat .bash_history", text: () => BASH_HISTORY_OUTPUT },
  { typed: "whoami", text: () => whoamiOutput("guest", "guest", 0) },
  { typed: "secret", text: () => COMMAND_OUTPUT.secret },
  { typed: "sudo", text: () => SUDO_DENIED },
  { typed: "sudo -l", text: () => SUDO_LIST },
  { typed: "hire", text: () => HIRE_BARE },
];
