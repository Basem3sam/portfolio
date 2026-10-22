"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { isMobileViewport } from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";
import Mark from "@/components/ui/Mark";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { prefersReducedMotion } from "@/lib/scroll";
import { playErrorSound, playKonamiKeySound, playSuccessSound } from "@/lib/sounds";
import {
  ASCII_BANNER,
  BANNER_TAGLINE,
  COMMAND_ALIASES,
  COMMAND_ARGS,
  COMMAND_NAMES,
  COMMAND_OUTPUT,
  DISCOVERIES,
  ENV_OUTPUT,
  FINALE_BOOT,
  FINALE_REWARDS,
  FINALE_TEXT,
  FILE_COMMAND,
  OPEN_TARGETS,
  ROOT_BANNER,
  ROOT_BANNER_COLS,
  RM_OUTPUT,
  SUDO_DENIED,
  THEMES,
  TOTAL_DISCOVERIES,
  VIM_EXIT,
  VIM_OUTPUT,
  certificateOutput,
  dateOutput,
  fortuneCount,
  fortuneOutput,
  hintOutput,
  hireDenied,
  hireOutput,
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
  kind?: "ascii" | "tagline";
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
};

function loadStored(): Stored {
  const fallback: Stored = { found: [], theme: "amber", hints: {}, since: null, crt: true };
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
function ScreenFx({ rain, burst }: { rain: number; burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || rain === 0 || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const size = 15;
    const glyphs = "01<>/{}[];=+*#$%";
    const drops = Array.from({ length: Math.ceil(width / size) }, () => -Math.random() * 24);
    const color = getComputedStyle(canvas).color;
    let frame = 0;
    let last = 0;

    ctx.font = `${size}px ${getComputedStyle(canvas).fontFamily}`;
    canvas.classList.add("on");

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - last < 55) return;
      last = time;

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = color;

      drops.forEach((y, column) => {
        if (y > 0) ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], column * size, y * size);
        drops[column] = y * size > height && Math.random() > 0.96 ? 0 : y + 1;
      });
    };
    frame = requestAnimationFrame(draw);

    const fade = window.setTimeout(() => canvas.classList.remove("on"), 3000);
    const stop = window.setTimeout(() => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    }, 4200);

    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(stop);
      cancelAnimationFrame(frame);
      canvas.classList.remove("on");
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
            ? 'Type "trophies" to see what is left.'
            : `Type "help" to start. ${TOTAL_DISCOVERIES} trophies are hidden in here.`,
        delay: 1050,
      },
      { id: 7, tone: "plain", text: "", delay: 1200 },
    ];
  });
  const [glitch, setGlitch] = useState(false);
  const [draft, setDraft] = useState("");
  const [found, setFound] = useState(stored.found);
  const [theme, setTheme] = useState<ThemeId>(stored.theme);
  const [bump, setBump] = useState(0);
  const [rainRun, setRainRun] = useState(0);
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
  const fortuneIndex = useRef<number | null>(null);

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
      if (!canType) return { line: { ...item }, entry: null };

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
    });

  /** The last trophy is an event, not a line: a staged sequence that ends in
      a certificate with the person's own numbers on it. */
  const finale = () => {
    playSuccessSound();
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
      playSuccessSound();
    } else if (after !== "root") {
      playKonamiKeySound("a", 1);
    }

    append(items);
    setBump((value) => value + 1);
    setAnnounce(`Trophy unlocked: ${item.label}. ${next.length} of ${TOTAL_DISCOVERIES}.`);
    if (after === "root") finale();
  };

  const applyTheme = (id: ThemeId) => {
    themeRef.current = id;
    setTheme(id);
    persist();
  };

  // Two frames before the fade-in starts, so the closed state is painted first
  // and the opening transition always has something to run from.
  useEffect(() => {
    if (!open) return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
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

  const run = (raw: string) => {
    const trimmed = raw.trim();
    const tokens = trimmed.split(/\s+/);
    const lower = trimmed.toLowerCase();
    const head = tokens[0].toLowerCase();
    const word = COMMAND_ALIASES[lower] ?? COMMAND_ALIASES[head] ?? head;
    const args = tokens.slice(1).map((token) => token.toLowerCase());
    const user = rankFor(foundRef.current.length);

    switch (word) {
      case "clear":
        finishTyping();
        setLines([]);
        return;

      case "exit":
        onClose();
        return;

      case "help":
        emit(COMMAND_OUTPUT.help);
        return;

      case "about":
      case "skills":
      case "projects":
      case "contact":
      case "secret":
      case "neofetch":
      case "hack":
      case "coffee":
        emit(COMMAND_OUTPUT[word]);
        discover(word);
        return;

      case "matrix":
        emit(COMMAND_OUTPUT.matrix);
        setRainRun((value) => value + 1);
        timers.current.push(
          window.setTimeout(() => setGlitch(true), 100),
          window.setTimeout(() => setGlitch(false), 1100),
        );
        discover("matrix");
        return;

      case "whoami":
        emit(whoamiOutput(user, rankFor(foundRef.current.length), foundRef.current.length));
        discover("whoami");
        return;

      case "trophies":
        emit(trophiesOutput(foundRef.current));
        return;

      case "ls":
        emit(lsOutput(args.some((arg) => arg.startsWith("-") && arg.includes("a"))));
        discover("ls");
        return;

      case "cat": {
        const file = args[0];
        if (!file) {
          append([{ tone: "info", text: "Usage: cat FILE. Files in this folder:" }]);
          emit(lsOutput(false));
        } else if (FILE_COMMAND[file]) {
          emit(COMMAND_OUTPUT[FILE_COMMAND[file]]);
          discover(FILE_COMMAND[file]);
          discover("cat");
        } else if (file === ".env") {
          emit(ENV_OUTPUT);
          discover("env");
          discover("cat");
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
          append([{ tone: "plain", text: `Accent set to ${choice}.` }]);
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
        // Start somewhere random, then walk the list so nothing repeats soon.
        const at = fortuneIndex.current ?? Math.floor(Math.random() * fortuneCount);
        fortuneIndex.current = at + 1;
        emit(fortuneOutput(at));
        discover("fortune");
        return;
      }

      case "date":
        emit(dateOutput(new Date()));
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
        foundRef.current = [];
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

      case "sudo":
        if (args[0] === "hire") {
          const owned = foundRef.current.filter((id) => id !== "hire").length;
          if (!args[1]) {
            append([
              { tone: "error", text: "hire: who? A verb needs a name." },
              { tone: "info", text: "Whose terminal is this?" },
            ]);
          } else if (args[1] !== "basem") {
            append([
              { tone: "error", text: `hire: no candidate named "${tokens[2]}" here` },
              { tone: "info", text: "Try the person this terminal belongs to." },
            ]);
          } else if (rankFor(owned) === "guest" || rankFor(owned) === "explorer") {
            emit(hireDenied(user, 10 - owned));
          } else {
            emit(hireOutput(user));
            discover("hire");
          }
        } else if (args[0] === "rm") {
          emit(RM_OUTPUT);
          discover("rm");
          discover("sudo");
        } else {
          emit(SUDO_DENIED.replace("%USER%", user));
          discover("sudo");
        }
        return;

      case "hire":
        append([
          { tone: "error", text: "hire: permission denied" },
          { tone: "info", text: "This one needs more privileges." },
        ]);
        return;

      case "rm":
        emit(RM_OUTPUT);
        discover("rm");
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
            <ScreenFx rain={rainRun} burst={burstRun} />
          </div>

          <div className="etc" role="group" aria-label="Quick commands">
            {COMMAND_NAMES.map((name) => (
              <button key={name} type="button" onClick={() => submit(name)}>
                {name}
              </button>
            ))}
          </div>

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
