"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import CoffeeBrew, { BREW_MS } from "@/components/easter-egg/CoffeeBrew";
import ClockLine from "@/components/easter-egg/ClockLine";
import HackBar from "@/components/easter-egg/HackBar";
import MatrixDecode from "@/components/easter-egg/MatrixDecode";
import { isMobileViewport } from "@/components/easter-egg/constants";
import CommandRail from "@/components/easter-egg/CommandRail";
import Icon from "@/components/ui/Icon";
import Mark from "@/components/ui/Mark";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { prefersReducedMotion } from "@/lib/scroll";
import {
  ensureAudio,
  isSoundMuted,
  playBlipSound,
  playBootSound,
  playBrewSound,
  playHackSound,
  playMatrixSound,
  playEnterSound,
  playErrorSound,
  playFinaleSound,
  playRankUpSound,
  playTrophySound,
  playTypeTick,
  setSoundMuted,
} from "@/lib/sounds";
import {
  ASCII_BANNER,
  BANNER_TAGLINE,
  COMMAND_ALIASES,
  COMMAND_ARGS,
  COMMAND_NAMES,
  COMMAND_OUTPUT,
  HACK_DONE_AT,
  HACK_SEQUENCE,
  MATRIX_DECODE_MS,
  MATRIX_SEQUENCE,
  SECRET_SEQUENCE,
  DISCOVERIES,
  ENV_OUTPUT,
  FINALE_BOOT,
  FINALE_REWARDS,
  FINALE_TEXT,
  FILE_COMMAND,
  OPEN_TARGETS,
  ROOT_BANNER,
  ROOT_BANNER_COLS,
  SUDO_DENIED,
  THEMES,
  TOTAL_DISCOVERIES,
  VIM_EXIT,
  VIM_OUTPUT,
  certificateOutput,
  coffeeOutput,
  fortuneLine,
  helpOutput,
  neofetchOutput,
  uptimeText,
  RM_CLOSING,
  RM_DONE_AT,
  RM_SEQUENCE,
  hackOutput,
  matrixOutput,
  BASH_HISTORY_OUTPUT,
  CLUES,
  HISTORY_CLUES,
  INTENTS,
  UNLISTED_NAMES,
  nextFortune,
  notesOutput,
  hintOutput,
  HIRE_BARE,
  HOUSE_RULE,
  SECRET_DENIED,
  REPLAY_LINES,
  SUDO_LIST,
  hireOutput,
  sudoReply,
  historyOutput,
  lsOutput,
  openListOutput,
  promptSymbol,
  rankFor,
  rankUpOutput,
  themeOutput,
  trophiesOutput,
  whoamiOutput,
  type ThemeId,
} from "@/lib/terminalCommands";

type Tone = "plain" | "prompt" | "success" | "info" | "error";

type HtmlNode =
  | { kind: "text"; atoms: string[] }
  | { kind: "span"; className: string; children: HtmlNode[] }
  | { kind: "link"; className: string; href: string; children: HtmlNode[] };

type Line = {
  id: number;
  tone: Tone;
  text?: string;
  html?: string;
  tree?: HtmlNode[];
  shown?: number;
  kind?: "ascii" | "tagline" | "coffee" | "decode" | "bar" | "clock";
  ms?: number;
  cols?: number;
  delay?: number;
};

type NewLine = Omit<Line, "id">;

const toneClasses: Record<Tone, string> = {
  plain: "",
  prompt: "cl",
  success: "ok",
  info: "info",
  error: "err",
};

const lineClass = "ln";

const TYPE_CHUNK = 4;
const TYPE_INTERVAL = 12;
/** A long answer should take about a second to type, not five. */
const TYPE_TARGET_TICKS = 80;
const MAX_LINES = 400;
const STORAGE_KEY = "basem-terminal";

type QueueEntry = {
  id: number;
  mode: "text" | "html";
  length: number;
  shown: number;
  full: string;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const promptHtml = (user: string, symbol: string) =>
  `<span class="pr"><span class="u eu-${user}">${user}</span><span class="u eh">@basem</span>:<span class="p">~</span>${symbol}</span>`;

const splitAtoms = (text: string): string[] => text.match(/&[a-zA-Z#][a-zA-Z0-9]*;|[\s\S]/g) ?? [];

const SAFE_HREF = /^(?:https:\/\/|mailto:|\/)[^"\s<>]*$/;

// Parses the terminal's controlled markup (<span class="..."> and
// <a class="..." href="..."> nesting only) into a tree whose text is split
// into single visible characters (entities count as one). Returns null for
// anything else so the caller can fall back to instant rendering - typing
// can never break output it does not understand.
function parseHtml(html: string): HtmlNode[] | null {
  const root: HtmlNode[] = [];
  const stack: HtmlNode[][] = [root];
  const tags: string[] = [];
  let text = "";
  let i = 0;

  const flushText = () => {
    if (text) {
      stack[stack.length - 1].push({ kind: "text", atoms: splitAtoms(text) });
      text = "";
    }
  };

  while (i < html.length) {
    if (html[i] === "<") {
      const rest = html.slice(i);
      const span = rest.match(/^<span\s+class="([^"]*)"\s*>/);
      const anchor = rest.match(
        /^<a\s+class="([^"]*)"\s+href="([^"]*)"(?:\s+target="_blank")?(?:\s+rel="noopener noreferrer")?\s*>/,
      );
      const close = rest.match(/^<\/(span|a)\s*>/);

      if (span) {
        flushText();
        const children: HtmlNode[] = [];
        stack[stack.length - 1].push({ kind: "span", className: span[1], children });
        stack.push(children);
        tags.push("span");
        i += span[0].length;
      } else if (anchor) {
        if (!SAFE_HREF.test(anchor[2])) return null;
        flushText();
        const children: HtmlNode[] = [];
        stack[stack.length - 1].push({
          kind: "link",
          className: anchor[1],
          href: anchor[2],
          children,
        });
        stack.push(children);
        tags.push("a");
        i += anchor[0].length;
      } else if (close) {
        flushText();
        if (tags.pop() !== close[1]) return null;
        stack.pop();
        if (stack.length === 0) return null;
        i += close[0].length;
      } else {
        return null;
      }
    } else {
      text += html[i];
      i += 1;
    }
  }

  flushText();
  return stack.length === 1 ? root : null;
}

function countChars(nodes: HtmlNode[]): number {
  return nodes.reduce(
    (sum, node) => sum + (node.kind === "text" ? node.atoms.length : countChars(node.children)),
    0,
  );
}

// Renders the tree with a character budget: spans with fully-consumed
// children render normally, the current span renders sliced text. Keys are
// stable, so spans persist across ticks and CSS animations do not replay.
function renderTyped(nodes: HtmlNode[], cursor: { left: number }, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];

  nodes.forEach((node, index) => {
    if (cursor.left <= 0) return;

    if (node.kind === "text") {
      const take = node.atoms.slice(0, cursor.left);
      cursor.left -= take.length;
      if (take.length > 0) out.push(take.join(""));
      return;
    }

    const children = renderTyped(node.children, cursor, `${keyPrefix}-${index}`);
    if (children.length === 0) return;

    if (node.kind === "link") {
      const external = node.href.startsWith("https://");
      out.push(
        <a
          key={`${keyPrefix}-${index}`}
          className={node.className}
          href={node.href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>,
      );
    } else {
      out.push(
        <span key={`${keyPrefix}-${index}`} className={node.className}>
          {children}
        </span>,
      );
    }
  });

  return out;
}

/* ------------------------------------------------------------ storage */

type Stored = {
  found: string[];
  theme: ThemeId;
  /** Furthest clue asked for, per trophy (1 to 3). */
  hints: Record<string, number>;
  /** When the first trophy was earned, for the certificate. */
  since: number | null;
  /** Retro screen effect (scanlines, glow). On by default. */
  crt: boolean;
  /** Clue ids collected so far, shown by `notes`. */
  clues: string[];
};

function loadStored(): Stored {
  const fallback: Stored = { found: [], theme: "amber", hints: {}, since: null, crt: true, clues: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<Stored>;
    const known = new Set(DISCOVERIES.map((item) => item.id));
    const hints: Record<string, number> = {};
    for (const [id, level] of Object.entries(data.hints ?? {})) {
      if (known.has(id) && typeof level === "number") hints[id] = Math.min(3, Math.max(1, level));
    }
    return {
      found: Array.isArray(data.found) ? data.found.filter((id) => known.has(id)) : [],
      theme: THEMES.includes(data.theme as ThemeId) ? (data.theme as ThemeId) : "amber",
      hints,
      since: typeof data.since === "number" ? data.since : null,
      crt: data.crt !== false,
      clues: Array.isArray(data.clues)
        ? data.clues.filter((id) => CLUES.some((clue) => clue.id === id))
        : [],
    };
  } catch {
    return fallback;
  }
}

function saveStored(value: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode or blocked storage: progress just lasts for this visit */
  }
}

/* ------------------------------------------------------------ helpers */

const COMPLETABLE = [...COMMAND_NAMES, "echo"];

/** Chips for these fill the prompt (the argument is the point) rather than run. */
const ARG_COMMANDS: ReadonlySet<string> = new Set(["cat", "open", "theme"]);

type Completion = { head: string; partial: string; options: string[]; takesArgs: boolean };

function completionFor(value: string): Completion | null {
  const withArg = value.match(/^(\S+)\s+(\S*)$/);
  if (withArg) {
    const list = COMMAND_ARGS[withArg[1].toLowerCase()];
    if (!list) return null;
    const partial = withArg[2];
    const options = list.filter((item) => item.startsWith(partial.toLowerCase()));
    return { head: value.slice(0, value.length - partial.length), partial, options, takesArgs: false };
  }

  if (value && /^\S+$/.test(value)) {
    const options = COMPLETABLE.filter((name) => name.startsWith(value.toLowerCase()));
    return {
      head: "",
      partial: value,
      options,
      takesArgs: options.length === 1 && options[0] in COMMAND_ARGS,
    };
  }

  return null;
}

const commonPrefix = (items: string[]) =>
  items.reduce((prefix, item) => {
    let n = 0;
    while (n < prefix.length && prefix[n] === item[n]) n++;
    return prefix.slice(0, n);
  });

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = next;
    }
  }
  return row[b.length];
}

const closestCommand = (word: string) => {
  let best = "";
  let score = 3;
  for (const name of COMPLETABLE) {
    const d = distance(word, name);
    if (d < score) {
      score = d;
      best = name;
    }
  }
  // A near miss on an unlisted command is a reward, not a leak.
  for (const name of UNLISTED_NAMES) {
    const d = distance(word, name);
    if (d <= 1 && d < score) {
      score = d;
      best = name;
    }
  }
  return best;
};

/** HH:MM in Cairo, for the status line. */
function cairoClock() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

// The banner is drawn in two tones: solid blocks in the bright accent and the
// box-drawing "shadow" in a dimmer one, so the letters read as raised.
function renderBanner(text: string): ReactNode[] {
  return text.split("\n").flatMap((row, rowIndex, rows) => {
    const runs: ReactNode[] = [];
    let current = "";
    let solid = row[0] === "█";
    [...row].forEach((char, i) => {
      const isSolid = char === "█";
      if (isSolid !== solid && current) {
        runs.push(
          <span key={`${rowIndex}-${i}`} className={solid ? "ebk" : "esh"}>
            {current}
          </span>,
        );
        current = "";
      }
      solid = isSolid;
      current += char;
    });
    runs.push(
      <span key={`${rowIndex}-end`} className={solid ? "ebk" : "esh"}>
        {current}
      </span>,
    );
    if (rowIndex < rows.length - 1) runs.push("\n");
    return runs;
  });
}

/* ------------------------------------------------------------- screen fx */

const CONFETTI = ["#f4c77d", "#e0a458", "#7ba6ff", "#4ade80", "#ff8f8f", "#eef2fb", "#b69cff"];

// Two short effects on one overlay canvas, both skipped for reduced motion:
// a quiet matrix rain for `matrix`, and a confetti burst for the finale.
// The canvas never takes clicks and clears itself when it is done.
function ScreenFx({ rain, burst }: { rain: { run: number; ms: number }; burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || rain.run === 0 || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Half-width katakana, digits and a few symbols, like the film. Glyphs the
    // terminal face lacks fall back to a system font; columns stay on a grid.
    const size = 15;
    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789:.=*+-<>|";
    const pick = () => glyphs[Math.floor(Math.random() * glyphs.length)];
    const drops = Array.from({ length: Math.ceil(width / size) }, () => ({
      y: -Math.random() * 30,
      speed: 0.4 + Math.random() * 0.6,
      glyph: pick(),
    }));
    const color = getComputedStyle(canvas).color;
    const begun = performance.now();
    let frame = 0;
    let last = 0;

    ctx.font = `${size}px ${getComputedStyle(canvas).fontFamily}, monospace`;
    canvas.classList.toggle("strong", rain.ms > 5000);
    canvas.classList.add("on");

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - last < 45) return;
      last = time;
      // New columns stop starting a while before the end, so the rain thins out.
      const spawning = time - begun < rain.ms - 2400;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      drops.forEach((drop, column) => {
        const before = Math.floor(drop.y);
        drop.y += drop.speed;
        const row = Math.floor(drop.y);
        const x = column * size;

        if (row !== before && row >= 0) {
          // The old head settles into the trail colour; the new head is white.
          if (before >= 0) {
            ctx.clearRect(x, (before - 1) * size, size, size + 2);
            ctx.fillStyle = color;
            ctx.fillText(drop.glyph, x, before * size);
          }
          drop.glyph = pick();
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.fillText(drop.glyph, x, row * size);
        }

        if (drop.y * size > height && spawning && Math.random() > 0.975) {
          drop.y = -Math.random() * 8;
          drop.speed = 0.4 + Math.random() * 0.6;
        }
      });
    };
    frame = requestAnimationFrame(draw);

    const fade = window.setTimeout(() => canvas.classList.remove("on"), Math.max(rain.ms - 1200, 1000));
    const stop = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    }, rain.ms);

    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(stop);
      cancelAnimationFrame(frame);
      canvas.classList.remove("on", "strong");
    };
  }, [rain]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || burst === 0 || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    type Piece = { x: number; y: number; vx: number; vy: number; w: number; h: number; r: number; vr: number; c: string; life: number };
    const launch = (count: number, at: number): Piece[] =>
      Array.from({ length: count }, () => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
        const speed = 7 + Math.random() * 9;
        return {
          x: width * at,
          y: height * 0.92,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          w: 5 + Math.random() * 6,
          h: 3 + Math.random() * 4,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          c: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
          life: 1,
        };
      });

    let pieces = [...launch(70, 0.25), ...launch(70, 0.75)];
    const second = window.setTimeout(() => {
      pieces = [...pieces, ...launch(60, 0.5)];
    }, 650);
    let frame = 0;
    canvas.classList.add("on", "burst");

    const draw = () => {
      frame = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      pieces = pieces.filter((piece) => piece.life > 0 && piece.y < height + 20);
      for (const piece of pieces) {
        piece.vy += 0.28;
        piece.vx *= 0.99;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.r += piece.vr;
        piece.life -= 0.0035;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, piece.life * 2));
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.r);
        ctx.fillStyle = piece.c;
        ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        ctx.restore();
      }
    };
    frame = requestAnimationFrame(draw);

    const stop = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
      canvas.classList.remove("on", "burst");
    }, 5200);

    return () => {
      window.clearTimeout(second);
      window.clearTimeout(stop);
      cancelAnimationFrame(frame);
      canvas.classList.remove("on", "burst");
    };
  }, [burst]);

  return <canvas ref={ref} className="rain" aria-hidden="true" />;
}

/* ------------------------------------------------------------ terminal */

type TerminalProps = {
  open: boolean;
  onClose: () => void;
};

export default function Terminal({ open, onClose }: TerminalProps) {
  const [stored] = useState(loadStored);
  const [shown, setShown] = useState(false);
  const [lines, setLines] = useState<Line[]>(() => {
    const ok = '[<span class="ok"> OK </span>]';
    const count = stored.found.length;
    const rank = rankFor(count);
    return [
      { id: 0, tone: "plain", kind: "ascii", text: ASCII_BANNER, delay: 0 },
      { id: 1, tone: "plain", kind: "tagline", text: BANNER_TAGLINE, delay: 120 },
      { id: 2, tone: "plain", html: `${ok} mounting portfolio.fs`, delay: 300 },
      { id: 3, tone: "plain", html: `${ok} loading developer profile`, delay: 450 },
      { id: 4, tone: "plain", html: `${ok} opening ${rank} session`, delay: 600 },
      {
        id: 5,
        tone: "success",
        text:
          count > 0
            ? `Welcome back, ${rank}. ${count} of ${TOTAL_DISCOVERIES} trophies found.`
            : "Welcome to Basem's secret developer terminal.",
        delay: 850,
      },
      {
        id: 6,
        tone: "info",
        text:
          count > 0
            ? 'Type "trophies" or "notes" to pick up the trail.'
            : `Type "help". ${TOTAL_DISCOVERIES} trophies hide here.`,
        delay: 1050,
      },
      {
        id: 7,
        tone: "plain",
        html: `<span class="dim">${HOUSE_RULE}</span>`,
        delay: 1150,
      },
      { id: 8, tone: "plain", text: "", delay: 1250 },
    ];
  });
  const [glitch, setGlitch] = useState(false);
  const [draft, setDraft] = useState("");
  const [found, setFound] = useState(stored.found);
  const [theme, setTheme] = useState<ThemeId>(stored.theme);
  const [bump, setBump] = useState(0);
  const [muted, setMuted] = useState(() => isSoundMuted());
  const [rain, setRain] = useState({ run: 0, ms: 4200 });
  const startRain = (ms = 4200) => setRain((value) => ({ run: value.run + 1, ms }));
  const [burstRun, setBurstRun] = useState(0);
  const [crt, setCrt] = useState(stored.crt);
  const [caret, setCaret] = useState(0);
  const [clock, setClock] = useState(() => cairoClock());
  const [announce, setAnnounce] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const nextId = useRef(100);
  const timers = useRef<number[]>([]);
  const typingQueue = useRef<QueueEntry[]>([]);
  const typingTimer = useRef(0);
  const foundRef = useRef(stored.found);
  const themeRef = useRef(stored.theme);
  const hintsRef = useRef(stored.hints);
  const sinceRef = useRef(stored.since);
  const crtRef = useRef(stored.crt);
  const cluesRef = useRef(stored.clues);
  const fortuneCalls = useRef(0);
  const fortuneShift = useRef(Math.floor(Math.random() * 10));
  const cupsRef = useRef(0);
  /** history length when the last hint was given: a hint costs one move. */
  const hintGate = useRef(-10);
  const openedAt = useRef(Date.now());

  const count = found.length;
  const rank = rankFor(count);
  const symbol = promptSymbol(rank);

  const withIds = (items: NewLine[]): Line[] =>
    items.map((item) => ({ ...item, id: nextId.current++ }));

  const stopTyping = () => {
    window.clearInterval(typingTimer.current);
    typingTimer.current = 0;
  };

  const startTyping = () => {
    if (typingTimer.current) return;

    typingTimer.current = window.setInterval(() => {
      const entry = typingQueue.current[0];

      if (!entry) {
        stopTyping();
        return;
      }

      const chunk = Math.max(TYPE_CHUNK, Math.ceil(entry.length / TYPE_TARGET_TICKS));
      entry.shown = Math.min(entry.shown + chunk, entry.length);
      const { id, mode, shown, full } = entry;

      setLines((current) =>
        current.map((line) => {
          if (line.id !== id) return line;
          return mode === "text" ? { ...line, text: full.slice(0, shown) } : { ...line, shown };
        }),
      );

      if (entry.shown >= entry.length) {
        typingQueue.current.shift();
      }
    }, TYPE_INTERVAL);
  };

  const finishTyping = () => {
    const queue = typingQueue.current;
    if (queue.length === 0 && typingTimer.current === 0) return;

    const completes = new Map(queue.map((entry) => [entry.id, entry] as const));
    typingQueue.current = [];
    stopTyping();

    if (completes.size === 0) return;
    setLines((current) =>
      current.map((line) => {
        const entry = completes.get(line.id);
        if (!entry) return line;
        return entry.mode === "text"
          ? { ...line, text: entry.full }
          : { ...line, shown: entry.length };
      }),
    );
  };

  const append = (items: NewLine[]) => {
    const canType = !prefersReducedMotion();

    const prepared = items.map((item): { line: NewLine; entry: QueueEntry | null } => {
      if (!canType || item.kind === "decode" || item.kind === "bar" || item.kind === "clock")
        return { line: { ...item }, entry: null };

      if (item.html !== undefined) {
        const tree = parseHtml(item.html);
        if (tree) {
          return {
            line: { ...item, tree, shown: 0 },
            entry: { id: -1, mode: "html", length: countChars(tree), shown: 0, full: "" },
          };
        }
        return { line: { ...item }, entry: null };
      }

      if (item.text) {
        return {
          line: { ...item, text: "" },
          entry: { id: -1, mode: "text", length: item.text.length, shown: 0, full: item.text },
        };
      }

      return { line: { ...item }, entry: null };
    });

    const added = withIds(prepared.map(({ line }) => line));
    prepared.forEach(({ entry }, index) => {
      if (!entry) return;
      entry.id = added[index].id;
      typingQueue.current.push(entry);
    });

    setLines((current) => [...current, ...added].slice(-MAX_LINES));
    startTyping();
  };

  const emit = (html: string) => append([{ tone: "plain", html }]);

  const persist = () =>
    saveStored({
      found: foundRef.current,
      theme: themeRef.current,
      hints: hintsRef.current,
      since: sinceRef.current,
      crt: crtRef.current,
      clues: cluesRef.current,
    });

  /** The last trophy is an event, not a line: a staged sequence that ends in
      a certificate with the person's own numbers on it. */
  const finale = () => {
    playFinaleSound();
    const levels = Object.values(hintsRef.current);
    const stats = {
      hints: levels.reduce((sum, level) => sum + level, 0),
      answers: levels.filter((level) => level >= 3).length,
      since: sinceRef.current,
      now: new Date(),
    };
    const at = (delay: number, run: () => void) =>
      timers.current.push(window.setTimeout(run, delay));

    append(FINALE_BOOT.map((html): NewLine => ({ tone: "plain", html })));
    at(1400, () => {
      append([{ tone: "plain", kind: "ascii", text: ROOT_BANNER, cols: ROOT_BANNER_COLS }]);
      setBurstRun((value) => value + 1);
    });
    at(2600, () => emit(FINALE_TEXT.join("\n")));
    at(5200, () => emit(certificateOutput(stats)));
    at(6600, () => {
      emit(FINALE_REWARDS.join("\n"));
      setAnnounce("All trophies found. You have root. A certificate and the gold theme are unlocked.");
    });
  };

  /** Record a trophy, announce it, and promote the rank when a line is crossed. */
  const discover = (id: string) => {
    const item = DISCOVERIES.find((entry) => entry.id === id);
    if (!item || foundRef.current.includes(id)) return;

    const before = rankFor(foundRef.current.length);
    const next = [...foundRef.current, id];
    foundRef.current = next;
    sinceRef.current ??= Date.now();
    setFound(next);
    persist();

    const after = rankFor(next.length);
    const items: NewLine[] = [
      {
        tone: "plain",
        html: `<span class="tr">+ trophy</span> ${item.label} <span class="dim">${next.length}/${TOTAL_DISCOVERIES}</span>`,
      },
    ];
    if (after !== before && after !== "root") {
      items.push({ tone: "plain", html: rankUpOutput(after) });
      playRankUpSound();
    } else if (after !== "root") {
      playTrophySound();
    }

    append(items);
    setBump((value) => value + 1);
    setAnnounce(`Trophy unlocked: ${item.label}. ${next.length} of ${TOTAL_DISCOVERIES}.`);
    if (after === "root") finale();
  };

  const applyTheme = (id: ThemeId) => {
    themeRef.current = id;
    playBlipSound();
    setTheme(id);
    persist();
  };

  // Two frames before the fade-in starts, so the closed state is painted first
  // and the opening transition always has something to run from.
  useEffect(() => {
    if (!open) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setShown(true);
        ensureAudio().then(() => playBootSound());
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    lockScroll();
    if (!isMobileViewport()) inputRef.current?.focus();

    return () => {
      unlockScroll();
      stopTyping();
    };
  }, [open]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // The status line clock: only ticks while the terminal is open.
  useEffect(() => {
    if (!open) return;
    const tick = window.setInterval(() => setClock(cairoClock()), 20000);
    return () => window.clearInterval(tick);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleGlobalKeys = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTyping();
        onClose();
        return;
      }

      if (event.key !== "Tab" || event.defaultPrevented) return;

      // Keep keyboard focus inside the dialog.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, a[href], [tabindex="0"]',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!dialogRef.current?.contains(active)) {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeys);
    return () => document.removeEventListener("keydown", handleGlobalKeys);
    // finishTyping only touches refs, so re-binding it every render is pointless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  /** A clue is saved the first time it is met, and `notes` lists it. */
  const giveClue = (ids: string | string[]) => {
    const fresh = (Array.isArray(ids) ? ids : [ids]).filter(
      (id) => CLUES.some((clue) => clue.id === id) && !cluesRef.current.includes(id),
    );
    if (fresh.length === 0) return;
    cluesRef.current = [...cluesRef.current, ...fresh];
    persist();
    playBlipSound();
    append([
      {
        tone: "plain",
        html: `<span class="info">+ ${fresh.length === 1 ? "clue" : `${fresh.length} clues`}</span> <span class="dim">saved. Type</span> <span class="info">notes</span>`,
      },
    ]);
  };

  /** Timed steps for the staged commands. Reduced motion collapses every delay,
      so the steps still run in order but at once. */
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, prefersReducedMotion() ? 0 : ms));
  };

  const pulse = (ms = 700) => {
    setGlitch(true);
    later(ms, () => setGlitch(false));
  };

  /** `rm -rf /`: three directories "go", the shell refuses, nothing is lost. */
  const runRm = (after?: () => void) => {
    RM_SEQUENCE.forEach((step) =>
      later(step.at, () => {
        if (step.bar) append([{ tone: "plain", kind: "bar", text: step.bar.label, ms: step.bar.ms }]);
        else if (step.html) {
          append([
            step.tone === "error"
              ? { tone: "error", text: step.html }
              : { tone: "plain", html: step.html },
          ]);
        }
        if (step.cue === "denied") playErrorSound();
        if (step.glitch) pulse(600);
      }),
    );
    later(RM_DONE_AT, () => {
      emit(RM_CLOSING);
      discover("rm");
      after?.();
    });
  };

  const run = (raw: string) => {
    const trimmed = raw.trim();
    const tokens = trimmed.split(/\s+/);
    const lower = trimmed.toLowerCase();
    const head = tokens[0].toLowerCase();
    const word = COMMAND_ALIASES[lower] ?? COMMAND_ALIASES[head] ?? head;
    const args = tokens.slice(1).map((token) => token.toLowerCase());
    const user = rankFor(foundRef.current.length);

    const bang = head.match(/^!(\d+)$/);
    if (bang || word === "replay") {
      const n = Number(bang ? bang[1] : args[0]);
      if (!foundRef.current.includes("history")) {
        append([
          { tone: "error", text: "replay: nothing to replay yet." },
          { tone: "info", text: "Read a log first. Hidden files start with a dot." },
        ]);
      } else if (!Number.isInteger(n) || !REPLAY_LINES[n]) {
        append([{ tone: "info", text: "Usage: replay N, with N a line number from the history (1 to 9)." }]);
      } else {
        const line = REPLAY_LINES[n];
        if (line.run) {
          emit(`  <span class="dim">replaying line ${n}:</span> <span class="cmd">${escapeHtml(line.run)}</span>`);
          run(line.run);
        } else if (line.say) {
          emit(line.say.split("\n").map((row) => `  <span class="dim">${escapeHtml(row)}</span>`).join("\n"));
        }
      }
      return;
    }

    switch (word) {
      case "clear":
        finishTyping();
        setLines([]);
        return;

      case "exit":
        onClose();
        return;

      case "help":
        emit(helpOutput(foundRef.current));
        return;

      case "about":
      case "skills":
      case "projects":
      case "contact":
        emit(COMMAND_OUTPUT[word]);
        discover(word);
        return;

      case "secret": {
        // A staged reveal: lock, scan, breach, then the message itself.
        playErrorSound();
        const total = SECRET_SEQUENCE[SECRET_SEQUENCE.length - 1].at;
        SECRET_SEQUENCE.forEach((step, index) => {
          timers.current.push(
            window.setTimeout(() => {
              append([
                step.tone === "error"
                  ? { tone: "error", text: step.html }
                  : { tone: "plain", html: step.html },
              ]);
              if (index === 3) {
                setGlitch(true);
                playErrorSound();
              }
              if (index === 4) setGlitch(false);
            }, step.at),
          );
        });
        timers.current.push(
          window.setTimeout(() => {
            startRain();
            playRankUpSound();
            emit(COMMAND_OUTPUT.secret);
            discover("secret");
            giveClue("c_hidden");
          }, total + 900),
        );
        return;
      }

      case "coffee": {
        // A staged brew: the cup fills on screen, then the message lands.
        cupsRef.current += 1;
        const cups = cupsRef.current;
        playBrewSound();
        append([{ tone: "plain", kind: "coffee" }]);
        timers.current.push(
          window.setTimeout(
            () => {
              emit(coffeeOutput(cups - 1, cups));
              discover("coffee");
            },
            prefersReducedMotion() ? 0 : BREW_MS + 150,
          ),
        );
        return;
      }

      case "neofetch":
        emit(
          neofetchOutput({
            rank: user,
            count: foundRef.current.length,
            theme: themeRef.current,
            uptime: uptimeText(Date.now() - openedAt.current),
          }),
        );
        discover("neofetch");
        giveClue("c_fuel");
        return;

      case "hack": {
        // Staged: type-ahead, bars, a cracked hash, a break-in, then the joke.
        playHackSound();
        HACK_SEQUENCE.forEach((step) => {
          timers.current.push(
            window.setTimeout(() => {
              if (step.bar) {
                append([{ tone: "plain", kind: "bar", text: step.bar.label, ms: step.bar.ms }]);
              } else if (step.decode) {
                append([{ tone: "plain", kind: "decode", text: step.decode.text, ms: step.decode.ms }]);
              } else if (step.html) {
                append([
                  step.tone === "error"
                    ? { tone: "error", text: step.html }
                    : { tone: "plain", html: step.html },
                ]);
              }
              if (step.cue === "denied") playErrorSound();
              if (step.glitch) {
                setGlitch(true);
                timers.current.push(window.setTimeout(() => setGlitch(false), 700));
              }
            }, step.at),
          );
        });
        timers.current.push(
          window.setTimeout(
            () => {
              emit(hackOutput());
              discover("hack");
            },
            prefersReducedMotion() ? 0 : HACK_DONE_AT,
          ),
        );
        return;
      }

      case "matrix": {
        // Staged: code rain, three slow beats, then a line that decodes out of
        // noise. The closing text and the trophy land once it has resolved.
        playMatrixSound();
        startRain(7600);
        const lastAt = MATRIX_SEQUENCE[MATRIX_SEQUENCE.length - 1].at;
        const done = lastAt + MATRIX_DECODE_MS + 250;
        MATRIX_SEQUENCE.forEach((step) => {
          timers.current.push(
            window.setTimeout(() => {
              if (step.decode) append([{ tone: "plain", kind: "decode", text: step.decode }]);
              else if (step.html) append([{ tone: "plain", html: step.html }]);
            }, step.at),
          );
        });
        timers.current.push(
          window.setTimeout(() => setGlitch(true), 150),
          window.setTimeout(() => setGlitch(false), 900),
          window.setTimeout(() => setGlitch(true), lastAt + MATRIX_DECODE_MS - 200),
          window.setTimeout(() => setGlitch(false), lastAt + MATRIX_DECODE_MS + 600),
          window.setTimeout(
            () => {
              emit(matrixOutput());
              discover("matrix");
            },
            prefersReducedMotion() ? 0 : done,
          ),
        );
        return;
      }

      case "whoami":
        emit(
          whoamiOutput(user, rankFor(foundRef.current.length), foundRef.current.length, {
            uptime: uptimeText(Date.now() - openedAt.current),
            commands: history.current.length,
            theme: themeRef.current,
          }),
        );
        discover("whoami");
        giveClue("c_sudoers");
        return;

      case "trophies":
        emit(trophiesOutput(foundRef.current));
        return;

      case "ls": {
        const all = args.some((arg) => arg.startsWith("-") && arg.includes("a"));
        emit(lsOutput(all));
        discover("ls");
        if (!all) giveClue("c_hidden");
        return;
      }

      case "cat": {
        const file = args[0];
        if (!file) {
          append([{ tone: "info", text: "Usage: cat FILE. Files in this folder:" }]);
          emit(lsOutput(false));
        } else if (file === "secret.txt") {
          // Locked on purpose: the command of the same name is the key.
          append(
            SECRET_DENIED.map((text, index) => ({
              tone: index === 0 ? ("error" as const) : ("info" as const),
              text,
            })),
          );
          giveClue("c_locked");
        } else if (FILE_COMMAND[file]) {
          emit(COMMAND_OUTPUT[FILE_COMMAND[file]]);
          discover(FILE_COMMAND[file]);
          discover("cat");
        } else if (file === ".env") {
          emit(ENV_OUTPUT);
          discover("env");
          discover("cat");
          giveClue(["c_histfile", "c_fuel", "c_sudoers"]);
        } else if (file === ".bash_history") {
          emit(BASH_HISTORY_OUTPUT);
          discover("history");
          discover("cat");
          giveClue(HISTORY_CLUES);
        } else if (file === "cv.pdf") {
          append([{ tone: "info", text: "cv.pdf is binary. Try: open cv" }]);
        } else {
          append([{ tone: "error", text: `cat: ${tokens[1]}: no such file` }]);
        }
        return;
      }

      case "cv":
      case "open": {
        const target = word === "cv" ? "cv" : args[0];
        if (!target) {
          emit(openListOutput());
          return;
        }
        const entry = OPEN_TARGETS[target];
        if (!entry) {
          append([
            { tone: "error", text: `open: unknown target "${tokens[1]}"` },
            { tone: "info", text: "Run open on its own to see the list." },
          ]);
          return;
        }
        append([{ tone: "plain", text: `Opening ${entry.label}...` }]);
        if (entry.url.startsWith("mailto:")) window.location.href = entry.url;
        else window.open(entry.url, "_blank", "noopener,noreferrer");
        discover("open");
        return;
      }

      case "theme": {
        const choice = args[0] as ThemeId | undefined;
        const isRoot = rankFor(foundRef.current.length) === "root";
        if (!choice) {
          emit(themeOutput(themeRef.current, isRoot));
        } else if (choice === "gold" && !isRoot) {
          append([
            { tone: "error", text: "theme: gold is locked until root" },
            { tone: "info", text: 'Type "hint" if you are stuck.' },
          ]);
        } else if (THEMES.includes(choice)) {
          applyTheme(choice);
          emit(
            `Accent set to <span class="sw sw-${choice}">██</span> <span class="hl">${choice}</span>`,
          );
          discover("theme");
        } else {
          append([
            { tone: "error", text: `theme: unknown colour "${tokens[1]}"` },
            { tone: "info", text: `Choose from: ${THEMES.join(", ")}` },
          ]);
        }
        return;
      }

      case "fortune": {
        // Every second cookie is a clue you do not hold yet.
        fortuneCalls.current += 1;
        const pick = nextFortune(fortuneCalls.current, cluesRef.current, fortuneShift.current);
        append([{ tone: "plain", kind: "decode", text: fortuneLine(pick.text), ms: 1100 }]);
        discover("fortune");
        if (pick.clue) later(1400, () => giveClue(pick.clue as string));
        return;
      }

      case "notes":
        emit(notesOutput(cluesRef.current, foundRef.current));
        return;

      case "date":
        append([{ tone: "plain", kind: "clock" }]);
        discover("date");
        return;

      case "history":
        emit(historyOutput(history.current));
        return;

      case "reset": {
        if (args[0] !== "confirm") {
          emit(
            `  <span class="wl">This erases all ${foundRef.current.length} trophies, your rank and theme.</span>\n  <span class="dim">To go ahead, type</span> <span class="info">reset confirm</span>`,
          );
          return;
        }
        // The bar runs first; the erase lands when it is full.
        append([{ tone: "plain", kind: "bar", text: "erasing progress", ms: 1000 }]);
        playErrorSound();
        later(1100, () => {
          foundRef.current = [];
          cluesRef.current = [];
          hintsRef.current = {};
          sinceRef.current = null;
          themeRef.current = "amber";
          setFound([]);
          setTheme("amber");
          setBump((value) => value + 1);
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {
            /* storage unavailable: the in-memory reset still applies */
          }
          persist();
          append([
            { tone: "success", text: "Progress reset. Rank: guest. 0 trophies." },
            { tone: "info", text: 'Type "help" to start again.' },
          ]);
        });
        return;
      }

      case "crt": {
        const choice = args[0];
        if (choice === "on" || choice === "off") {
          const next = choice === "on";
          crtRef.current = next;
          setCrt(next);
          persist();
          append([{ tone: "plain", text: `Retro screen effect ${choice}.` }]);
          if (next) {
            playBlipSound();
            pulse(600);
          }
        } else {
          emit(
            `  <span class="key">crt   </span>${
              crtRef.current ? `<span class="ok">on</span>` : `<span class="dim">off</span>`
            }\n  <span class="info">crt off</span> <span class="dim">or</span> <span class="info">crt on</span>`,
          );
        }
        return;
      }

      case "hint": {
        const target = DISCOVERIES.find((item) => !foundRef.current.includes(item.id));
        if (!target) {
          emit(`  <span class="wl">No trophies left.</span> <span class="dim">You have everything.</span>`);
          return;
        }
        // A hint costs a move: run something else between two hints, so the
        // ladder cannot be climbed by repeating one word.
        if (history.current.length < hintGate.current + 2) {
          append([
            { tone: "info", text: "Try something first." },
            { tone: "plain", html: `<span class="dim">Run any command, then ask again.</span>` },
          ]);
          return;
        }
        hintGate.current = history.current.length;
        const level = Math.min(3, (hintsRef.current[target.id] ?? 0) + 1) as 1 | 2 | 3;
        hintsRef.current = { ...hintsRef.current, [target.id]: level };
        persist();
        emit(hintOutput(target, level, TOTAL_DISCOVERIES - foundRef.current.length));
        return;
      }

      case "certificate": {
        if (rankFor(foundRef.current.length) !== "root") {
          append([
            { tone: "error", text: "certificate: locked until root" },
            { tone: "info", text: `Find all ${TOTAL_DISCOVERIES} trophies. Type "hint" if stuck.` },
          ]);
          return;
        }
        const levels = Object.values(hintsRef.current);
        emit(
          certificateOutput({
            hints: levels.reduce((sum, level) => sum + level, 0),
            answers: levels.filter((level) => level >= 3).length,
            since: sinceRef.current,
            now: new Date(),
          }),
        );
        return;
      }

      case "echo":
        emit(escapeHtml(trimmed.slice(4).trim()));
        return;

      case "sudo": {
        const passwordLine = `[sudo] password for ${user}: ********`;
        // What each reply is lives in sudoReply (lib/terminalCommands.ts), so
        // the fair-play test can read every one; this only shows it.
        const reply = sudoReply(args, tokens.slice(1));
        if (reply.kind === "list") {
          emit(SUDO_LIST);
          discover("sudo");
          giveClue("c_shape");
        } else if (reply.kind === "hire-help") {
          append([
            { tone: "error", text: reply.error },
            ...reply.info.map((text) => ({ tone: "info" as const, text })),
          ]);
        } else if (reply.kind === "hire") {
          // Password, a short authentication bar, then the offer. No rank
          // gate: whoever works out the command has earned the answer.
          const [, ...rest] = hireOutput(user).split("\n");
          emit(passwordLine);
          later(800, () => append([{ tone: "plain", kind: "bar", text: "authenticating", ms: 900 }]));
          later(1900, () => {
            emit(rest.join("\n"));
            discover("hire");
          });
        } else if (reply.kind === "rm") {
          runRm(() => discover("sudo"));
        } else {
          emit(passwordLine);
          later(900, () => {
            playErrorSound();
            emit(SUDO_DENIED.replace("%USER%", user));
            if (reply.info.length) {
              append(reply.info.map((text) => ({ tone: "info" as const, text })));
            }
            pulse(500);
            discover("sudo");
            giveClue("c_shape");
          });
        }
        return;
      }

      case "hire":
        emit(HIRE_BARE);
        giveClue("c_shape");
        return;

      case "rm":
        runRm();
        return;

      case "vim":
      case "vi":
      case "nano":
      case "emacs":
        emit(VIM_OUTPUT);
        discover("vim");
        return;

      case ":q":
      case ":q!":
      case ":wq":
      case ":x":
        append([{ tone: "plain", text: VIM_EXIT }]);
        return;
    }

    // Words people reach for are answered with a nudge, never a dead end.
    const intent = INTENTS.find((item) => item.words.includes(lower) || item.words.includes(head));
    if (intent) {
      playBlipSound();
      append([
        { tone: "info", text: `${tokens[0]}: not a command here.` },
        ...intent.lines.map((text) => ({
          tone: "plain" as const,
          html: `<span class="dim">${escapeHtml(text)}</span>`,
        })),
      ]);
      if (intent.clue) later(900, () => giveClue(intent.clue as string));
      return;
    }

    playErrorSound();
    const guess = closestCommand(head);
    append([
      { tone: "error", text: `Command not found: ${tokens[0]}` },
      {
        tone: "info",
        text: guess ? `Did you mean "${guess}"? Type "help" for the list.` : 'Type "help" to see available commands.',
      },
    ]);
  };

  /** Echo a command in the transcript, then run it. Enter and the quick
      command chips share this path, so both read the same in history. */
  const submit = (raw: string) => {
    playEnterSound();
    history.current.push(raw);
    historyIndex.current = history.current.length;
    append([
      {
        tone: "prompt",
        html: `${promptHtml(rank, symbol)} <span class="cmd">${escapeHtml(raw)}</span>`,
      },
    ]);
    run(raw);
    put("");
  };

  /** Programmatic edits (history, completion, clear) put the cursor at the end. */
  const put = (value: string) => {
    setDraft(value);
    setCaret(value.length);
  };

  // First word being typed, so the quick-command rail can point at its chip.
  const railQuery = /^\S+$/.test(draft) ? draft.toLowerCase() : "";

  const completion = draft ? completionFor(draft) : null;
  const ghost =
    completion && completion.options.length > 0 && completion.options[0] !== completion.partial
      ? completion.options[0].slice(completion.partial.length)
      : "";

  const complete = () => {
    if (!completion || completion.options.length === 0) return;
    const { head, partial, options, takesArgs } = completion;
    const prefix = commonPrefix(options);

    if (prefix.length > partial.length) {
      put(head + prefix + (options.length === 1 && takesArgs ? " " : ""));
    } else if (options.length > 1) {
      append([
        { tone: "prompt", html: `${promptHtml(rank, symbol)} <span class="cmd">${escapeHtml(draft)}</span>` },
        { tone: "plain", html: `<span class="dim">${options.join("  ")}</span>` },
      ]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    finishTyping();
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      if (event.key === "Backspace") playTypeTick("back");
      else if (event.key === " ") playTypeTick("space");
      else if (event.key.length === 1) playTypeTick("key");
    }
    const input = event.currentTarget;

    if (event.ctrlKey && !event.altKey && !event.metaKey) {
      const k = event.key.toLowerCase();
      if (k === "l") {
        event.preventDefault();
        setLines([]);
        return;
      }
      if (k === "u") {
        event.preventDefault();
        put("");
        return;
      }
      if (k === "c") {
        event.preventDefault();
        append([
          {
            tone: "prompt",
            html: `${promptHtml(rank, symbol)} <span class="cmd">${escapeHtml(draft)}</span><span class="dim">^C</span>`,
          },
        ]);
        put("");
        return;
      }
    }

    if (event.key === "Enter") {
      if (draft.trim()) submit(draft.trim());
      else put("");
    } else if (event.key === "Tab" && !event.shiftKey && draft && completion) {
      event.preventDefault();
      complete();
    } else if (
      (event.key === "ArrowRight" || event.key === "End") &&
      ghost &&
      input.selectionStart === draft.length
    ) {
      event.preventDefault();
      put(draft + ghost);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex.current > 0) {
        historyIndex.current--;
        put(history.current[historyIndex.current]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex.current < history.current.length - 1) {
        historyIndex.current++;
        put(history.current[historyIndex.current]);
      } else {
        historyIndex.current = history.current.length;
        put("");
      }
    }
  };

  const close = () => {
    finishTyping();
    onClose();
  };

  const progress = { "--p": `${(count / TOTAL_DISCOVERIES) * 100}%` } as CSSProperties;

  return (
    <div className="egg">
      <div
        className={`eov dim${open && shown ? " show" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={dialogRef}
          id="secret-terminal"
          dir="ltr"
          className="eterm"
          data-theme={theme}
          data-rank={rank}
          data-crt={crt ? "on" : "off"}
          role="dialog"
          data-lenis-prevent
          aria-modal="true"
          aria-label="Secret terminal"
          inert={!open}
        >
          <div className="eth">
            <b>
              <Mark className="i" />
              <span>{rank}@portfolio: ~</span>
              <em>zsh</em>
            </b>
            <span className="r">
              <button
                type="button"
                className="erk"
                onClick={() => submit("trophies")}
                aria-label={`Trophies: ${count} of ${TOTAL_DISCOVERIES} found, rank ${rank}. Show trophies`}
              >
                <span className="erk-bar" style={progress} aria-hidden="true" />
                <span key={bump} className="erk-n" aria-hidden="true">
                  {count}/{TOTAL_DISCOVERIES}
                </span>
                <span className="erk-r" aria-hidden="true">
                  {rank}
                </span>
              </button>
              <button
                type="button"
                className={`egx esn${muted ? " off" : ""}`}
                aria-label={muted ? "Turn sound on" : "Turn sound off"}
                aria-pressed={!muted}
                onClick={() => {
                  const next = !muted;
                  setSoundMuted(next);
                  setMuted(next);
                  if (!next) playBlipSound();
                }}
              >
                <span aria-hidden="true">♪</span>
              </button>
              <span className="esc">Esc to close</span>
              <button type="button" className="egx" aria-label="Close terminal" onClick={close}>
                <Icon name="x" className="i" />
              </button>
            </span>
          </div>

          <div className="etw">
            <div
              ref={bodyRef}
              onClick={() => {
                finishTyping();
                if (!isMobileViewport() && !window.getSelection()?.toString()) {
                  inputRef.current?.focus();
                }
              }}
              className={`etb${glitch ? " gl" : ""}`}
              id="terminal-output"
              tabIndex={0}
              aria-label="Terminal output"
            >
              {lines.map((line) => {
                const style = line.delay ? { animationDelay: `${line.delay}ms` } : undefined;

                if (line.kind === "ascii") {
                  const sized = { ...style, ...(line.cols ? { "--cols": line.cols } : {}) } as CSSProperties;
                  return (
                    <pre
                      key={line.id}
                      style={sized}
                      className="ascii"
                      role="img"
                      aria-label={line.cols ? "Root" : "Basem"}
                    >
                      {renderBanner(line.text ?? "")}
                    </pre>
                  );
                }

                if (line.kind === "clock") {
                  return <ClockLine key={line.id} style={style} />;
                }

                if (line.kind === "bar") {
                  return <HackBar key={line.id} label={line.text ?? ""} ms={line.ms ?? 1000} style={style} />;
                }

                if (line.kind === "decode") {
                  return <MatrixDecode key={line.id} text={line.text ?? ""} ms={line.ms ?? MATRIX_DECODE_MS} style={style} />;
                }

                if (line.kind === "coffee") {
                  return <CoffeeBrew key={line.id} style={style} />;
                }

                if (line.kind === "tagline") {
                  return (
                    <div key={line.id} style={style} className="ln tag">
                      {line.text}
                    </div>
                  );
                }

                const className = `${lineClass} ${toneClasses[line.tone]}`;

                if (line.html !== undefined) {
                  if (line.tree && line.shown !== undefined) {
                    return (
                      <div key={line.id} style={style} className={className}>
                        {renderTyped(line.tree, { left: line.shown }, `t${line.id}`)}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={line.id}
                      style={style}
                      className={className}
                      dangerouslySetInnerHTML={{ __html: line.html }}
                    />
                  );
                }

                return (
                  <div key={line.id} style={style} className={className}>
                    {line.text}
                  </div>
                );
              })}
            </div>
            <ScreenFx rain={rain} burst={burstRun} />
          </div>

          <CommandRail
            commands={COMMAND_NAMES}
            needsArg={ARG_COMMANDS}
            query={railQuery}
            onRun={submit}
            onFill={(name) => {
              put(`${name} `);
              inputRef.current?.focus();
            }}
          />

          <div className="eti">
            <label htmlFor="terminal-input">
              <span className={`u eu-${rank}`}>{rank}</span>
              <span className="u eh">@basem</span>:<span className="p">~</span>
              {symbol}
            </label>
            <div className="efield">
              {/* The typed text and the block cursor are drawn here; the real
                  input above is transparent and only receives the typing. */}
              <span className="eg" aria-hidden="true">
                <span className="et">{draft.slice(0, caret)}</span>
                {caret >= draft.length && ghost ? (
                  <>
                    <span className="cur gh">{ghost.charAt(0)}</span>
                    <span className="gh">{ghost.slice(1)}</span>
                  </>
                ) : (
                  <>
                    <span className="cur">{draft.charAt(caret) || "\u00a0"}</span>
                    <span className="et">{draft.slice(caret + 1)}</span>
                  </>
                )}
              </span>
              <input
                ref={inputRef}
                id="terminal-input"
                type="text"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setCaret(event.target.selectionStart ?? event.target.value.length);
                }}
                onSelect={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
                onKeyUp={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
                onClick={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
                placeholder={
                  rank === "root"
                    ? "Try certificate or theme gold"
                    : count === 0
                      ? isMobileViewport()
                        ? "Type a command"
                        : "Type help to start"
                      : "Type hint if you are stuck"
                }
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                aria-label="Terminal command"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="est" aria-hidden="true">
            <span className="est-a">basem</span>
            <span className="est-b">0:zsh*</span>
            <span className="est-c">
              {rank} {count}/{TOTAL_DISCOVERIES}
            </span>
            <span className="est-d">cairo {clock}</span>
          </div>

          <div className="sr-only" role="status" aria-live="polite">
            {announce}
          </div>
        </div>
      </div>
    </div>
  );
}
