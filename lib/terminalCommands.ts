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

export type Discovery = {
  id: string;
  /** Shown once earned. */
  label: string;
  /** Shown while locked (one short line, clue 1 of 3). */
  hint: string;
  /** Clue 2 (a nudge) and clue 3 (the answer), given by the `hint` command. */
  clues: readonly [string, string];
};

/** Order matters: `hint` always points at the first trophy not yet found, so
    this is the path that teaches every command, easiest first. */
export const DISCOVERIES: readonly Discovery[] = [
  {
    id: "about",
    label: "Met the developer",
    hint: "Find out who built this",
    clues: ["The first item in help is about a person, not a tool.", "Type: about"],
  },
  {
    id: "skills",
    label: "Checked the toolkit",
    hint: "See what is in the toolbox",
    clues: ["A command named for what Basem can do.", "Type: skills"],
  },
  {
    id: "projects",
    label: "Browsed the projects",
    hint: "See what has been shipped",
    clues: ["Proof beats promises. Look for the work.", "Type: projects"],
  },
  {
    id: "contact",
    label: "Found the contact details",
    hint: "Find a way to reach Basem",
    clues: ["Every story needs a way to reply.", "Type: contact"],
  },
  {
    id: "neofetch",
    label: "Ran a system check",
    hint: "Ask the machine about itself",
    clues: ["Linux people paste this in screenshots, logo and all.", "Type: neofetch"],
  },
  {
    id: "ls",
    label: "Looked around",
    hint: "Look around the folder",
    clues: ["Before you read a file you need to know what exists.", "Type: ls"],
  },
  {
    id: "cat",
    label: "Opened a file",
    hint: "Read something from the folder",
    clues: ["Named after concatenate. It prints a file. Give it a name from ls.", "Type: cat about.md"],
  },
  {
    id: "open",
    label: "Followed a link",
    hint: "Jump out to a real page",
    clues: ["Some answers live outside the terminal. help lists the targets.", "Type: open github"],
  },
  {
    id: "theme",
    label: "Picked a colour",
    hint: "Make the terminal yours",
    clues: ["The accent colours have names. There are five to start.", "Type: theme ice"],
  },
  {
    id: "fortune",
    label: "Took a fortune",
    hint: "Ask for a line of wisdom",
    clues: ["An old unix cookie jar. Every second cookie is a clue.", "Type: fortune"],
  },
  {
    id: "whoami",
    label: "Checked who you are",
    hint: "Ask who is logged in",
    clues: ["A question squashed into one word.", "Type: whoami"],
  },
  {
    id: "date",
    label: "Checked the time in Cairo",
    hint: "Ask what time it is in Cairo",
    clues: ["Basem keeps Egypt time. Ask the clock.", "Type: date"],
  },
  {
    id: "env",
    label: "Read the .env file",
    hint: "ls shows less than the folder holds",
    clues: ["ls admits it is hiding something. A flag shows everything. The file you want holds settings.", "Type: ls -a, then cat .env"],
  },
  {
    id: "history",
    label: "Read the shell history",
    hint: "A settings file points to a log",
    clues: [".env names a history file. Its name starts with a dot too.", "Type: cat .bash_history"],
  },
  {
    id: "secret",
    label: "Found the secret",
    hint: "A file that will not open",
    clues: ["ls lists secret.txt but cat refuses it. The lock opens for the word that is its own name.", "Type: secret"],
  },
  {
    id: "matrix",
    label: "Took the red pill",
    hint: "Wake up",
    clues: ["A film about choosing a pill. The title is the command.", "Type: matrix"],
  },
  {
    id: "hack",
    label: "Tried to hack in",
    hint: "Act like it is a movie",
    clues: ["Same genre as matrix. Four letters, quicker, and less honest.", "Type: hack"],
  },
  {
    id: "coffee",
    label: "Brewed a coffee",
    hint: "Fuel for the people who write this",
    clues: ["neofetch and .env both say what Basem runs on.", "Type: coffee"],
  },
  {
    id: "vim",
    label: "Got stuck in vim",
    hint: "Open an editor nobody leaves",
    clues: ["A very old editor, three letters. Easy to enter, famously hard to exit.", "Type: vim, then :q to escape"],
  },
  {
    id: "rm",
    label: "Tried to delete everything",
    hint: "Do something reckless to root",
    clues: ["Two letters that remove things. Point them at the very top of the filesystem, the slash. It is safe here.", "Type: rm -rf /"],
  },
  {
    id: "sudo",
    label: "Asked for more power",
    hint: "Guests borrow power with a prefix",
    clues: ["whoami says you are not in the sudoers file. Admins put a four-letter word in front of a command.", "Type: sudo"],
  },
  {
    id: "hire",
    label: "Hired the developer",
    hint: "The last ask: a verb and a name",
    clues: ["sudo, then a four-letter verb, then a five-letter name, with hacker rank first. The shell history kept the shape.", "Type: sudo hire basem"],
  },
];

export const TOTAL_DISCOVERIES = DISCOVERIES.length;

/** Commands that are not in `help`. They are found by following clues. */
export const UNLISTED_NAMES = ["secret", "matrix", "hack", "coffee", "vim", "sudo", "hire"] as const;
const UNLISTED_TROPHIES = ["secret", "matrix", "hack", "coffee", "vim", "rm", "sudo", "hire"];

export type Clue = { id: string; target: string; text: string };

/** Clues are collected as they are met: in a fortune, a file, or an output
    that hides one. `notes` lists them. `target` is the trophy a clue points
    at, so a clue shows as solved once that trophy is found. */
export const CLUES: readonly Clue[] = [
  { id: "c_hidden", target: "env", text: "The folder holds more than ls shows. A flag shows it all." },
  { id: "c_histfile", target: "history", text: "A settings file names a log of old commands. The name starts with a dot." },
  { id: "c_pill", target: "matrix", text: "Two pills on a table. Only one is a command." },
  { id: "c_hack", target: "hack", text: "Real hackers type fast and do nothing. Four letters." },
  { id: "c_editor", target: "vim", text: "An editor, three letters. Easy to enter, hard to leave." },
  { id: "c_delete", target: "rm", text: "Two letters erase everything. Aim them at the slash." },
  { id: "c_fuel", target: "coffee", text: "The machine knows what Basem runs on. Ask it." },
  { id: "c_locked", target: "secret", text: "A locked file opens for the word that is its own name." },
  { id: "c_sudoers", target: "sudo", text: "You are not in the sudoers file. Admins borrow power with a prefix." },
  { id: "c_shape", target: "hire", text: "The ask: sudo, a four-letter verb, a five-letter name." },
];

export const RANKS = [
  { id: "guest", at: 0 },
  { id: "explorer", at: 4 },
  { id: "hacker", at: 10 },
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
      `${hint("Stuck?")} Type ${hint("hint")} for a nudge.`,
      `${hint("Clues")} you find are saved: ${hint("notes")}.`,
      dim("The folder holds more than ls shows."),
    ],
    hacker: [
      `<span class="hl">Rank up: hacker</span>`,
      dim("Ten trophies. Privileged commands now"),
      dim("answer to you. The shell kept a log of"),
      dim("old commands. One line was scrubbed."),
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
] as const;

export const FILE_COMMAND: Record<string, string> = {
  "about.md": "about",
  "skills.txt": "skills",
  "projects.md": "projects",
  "contact.md": "contact",
  "secret.txt": "secret",
};

export function lsOutput(all: boolean) {
  const cell = (name: string, cls: string) =>
    `<span class="${cls}">${name.padEnd(12)}</span>`;
  const rows = [
    cell("about.md", "info") + cell("skills.txt", "info") + cell("projects.md", "info"),
    cell("contact.md", "info") + cell("secret.txt", "info") + cell("cv.pdf", "warn"),
  ];
  if (all) rows.push(cell(".env", "dim") + cell(".bash_history", "dim"));
  const list = rows.join("\n").replace(/ +(<\/span>)$/gm, "$1");
  return all ? list : `${list}\n${dim("6 items shown, 2 hidden")}`;
}

/** What `cat .bash_history` prints. Line 8 is scrubbed: the block counts are
    the lengths of the verb and the name. */
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
  `  ${dim("Line 8 was scrubbed. Count the blocks.")}`,
].join("\n");

/** Clues the history gives away just by being read. */
export const HISTORY_CLUES = ["c_fuel", "c_pill", "c_hack", "c_editor", "c_delete", "c_sudoers", "c_shape"];

export const ENV_OUTPUT = [
  `${key("HIRE_ME", 12)}true`,
  `${key("AVAILABLE", 12)}true`,
  `${key("COFFEE", 12)}required`,
  `${key("HISTFILE", 12)}.bash_history`,
  `${key("API_KEY", 12)}${dim("not here, nice try")}`,
  `${key("PRIVILEGE", 12)}sudo VERB NAME`,
  `${key("RANK_NEEDED", 12)}hacker`,
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
  { text: "Two pills on a table. Only one is a command.", clue: "c_pill" },
  { text: "Read the logs first. Then read them again." },
  { text: "Real hackers type fast and do nothing. Four letters.", clue: "c_hack" },
  { text: "Clean architecture is mostly saying no." },
  { text: "Easy to enter. Hard to leave. Three letters.", clue: "c_editor" },
  { text: "Comments age. Good names do not." },
  { text: "Two letters can erase the world. Aim them at the slash.", clue: "c_delete" },
  { text: "Cache invalidation: ask again later." },
  { text: "Ask the machine what Basem runs on.", clue: "c_fuel" },
  { text: "The best endpoint is the one you deleted." },
  { text: "A locked file only opens for its own name.", clue: "c_locked" },
  { text: "Staging is where optimism goes to be tested." },
  { text: "Guests ask. Admins borrow power with a prefix.", clue: "c_sudoers" },
  { text: "Ship small. Rollback is a feature." },
  { text: "Rank first, then a verb and a name.", clue: "c_shape" },
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
    `  ${badge("Achievement unlocked: good hire")}`,
  ].join("\n");
}

export const SUDO_DENIED = [
  `<span class="err">%USER% is not in the sudoers file.</span>`,
  "This incident will be reported.",
  dim("sudo needs a command after it:"),
  dim("a verb, then a name."),
].join("\n");

/** Rank gate for the last trophy: a goal that makes the ranks mean something. */
export const hireDenied = (user: string, missing: number) =>
  [
    `<span class="err">sudo: ${user} may not run hire yet</span>`,
    dim(`Rank hacker needed. ${missing} more trophies.`),
    dim("Keep exploring, then ask again."),
  ].join("\n");

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
      ? `  ${dim("Ask again for a stronger clue.")}`
      : `  ${dim("The answer. Type it to claim it.")}`,
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

/** The help screen, plus one command the person has not tried yet. */
export const helpOutput = (found: readonly string[]) => {
  const untried = DISCOVERIES.find(
    (item) => !found.includes(item.id) && (COMMAND_NAMES as readonly string[]).includes(item.id),
  );
  const left = UNLISTED_TROPHIES.filter((id) => !found.includes(id)).length;
  const tail = [
    ...(untried ? [`  ${dim("Not tried yet:")} ${hint(untried.id)}`] : []),
    left > 0
      ? `  ${dim(`${left} commands are not listed here.`)}\n  ${dim("Follow the clues: fortunes, files,")}\n  ${dim("and odd things you type.")}`
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
    lines: ["Not a command here, but the idea is", "right. Unix does it in two letters.", "Aim them at the top of everything."],
  },
  {
    words: ["edit", "editor", "code", "notepad", "write", "ed", "text", "micro"],
    clue: "c_editor",
    lines: ["Not here, but one editor is easy to", "enter and hard to leave.", "Three letters."],
  },
  {
    words: ["neo", "pill", "redpill", "red pill", "bluepill", "blue pill", "morpheus", "trinity", "rabbit", "white rabbit", "wake up", "wakeup"],
    clue: "c_pill",
    lines: ["You are thinking of the right film.", "The command is its title.", "Six letters."],
  },
  {
    words: ["hacker", "hacking", "crack", "exploit", "breach", "pwn", "pwned", "bypass", "intrude"],
    clue: "c_hack",
    lines: ["Close. Act like a movie hacker:", "fast typing, green text, no clue.", "Four letters."],
  },
  {
    words: ["tea", "espresso", "latte", "caffeine", "mug", "brew", "java", "cappuccino", "drink"],
    clue: "c_fuel",
    lines: ["Not tea. Something darker.", "The machine can tell you what Basem", "runs on. One word, six letters."],
  },
  {
    words: ["unlock", "reveal", "classified", "confidential", "mystery", "easteregg", "easter egg", "egg"],
    clue: "c_locked",
    lines: ["A file in the folder will not open.", "It listens for the word that is its", "own name."],
  },
  {
    words: ["admin", "root", "su", "superuser", "permission", "permissions", "privilege", "privileges", "access", "password", "login", "authorize"],
    clue: "c_sudoers",
    lines: ["Guests have no keys. Real admins borrow", "power with a word in front of a", "command. Four letters."],
  },
  {
    words: ["job", "work", "recruit", "employ", "interview", "freelance", "hire me", "hireme", "candidate"],
    clue: "c_shape",
    lines: ["Good instinct. It has to be asked the", "admin way: borrow power, then a verb,", "then a name. Earn rank first."],
  },
  { words: ["dir", "list", "files", "folder", "tree"], lines: ["Try ls to see the folder."] },
  { words: ["read", "view", "less", "more", "show"], lines: ["To read a file, name it: cat FILE."] },
  { words: ["bye", "goodbye", "leave", "close"], lines: ["Try exit to close the terminal."] },
];
