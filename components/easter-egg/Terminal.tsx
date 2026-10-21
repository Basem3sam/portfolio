"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { isMobileViewport } from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";
import Mark from "@/components/ui/Mark";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { prefersReducedMotion } from "@/lib/scroll";
import {
  ASCII_BANNER,
  COMMAND_ALIASES,
  COMMAND_NAMES,
  COMMAND_OUTPUT,
} from "@/lib/terminalCommands";

type Tone = "plain" | "prompt" | "success" | "info" | "error";

type HtmlNode =
  { kind: "text"; atoms: string[] } | { kind: "span"; className: string; children: HtmlNode[] };

type Line = {
  id: number;
  tone: Tone;
  text?: string;
  html?: string;
  tree?: HtmlNode[];
  shown?: number;
  kind?: "ascii" | "banner";
  delay?: number;
};

type NewLine = Omit<Line, "id">;

const toneClasses: Record<Tone, string> = {
  plain: "",
  prompt: "hd",
  success: "ok",
  info: "info",
  error: "err",
};

const lineClass = "ln";

const TYPE_CHUNK = 4;
const TYPE_INTERVAL = 12;

type QueueEntry = {
  id: number;
  mode: "text" | "html";
  length: number;
  shown: number;
  full: string;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PROMPT_HTML =
  '<span class="pr"><span class="u">guest@basem</span>:<span class="p">~</span>$</span>';

const splitAtoms = (text: string): string[] => text.match(/&[a-zA-Z#][a-zA-Z0-9]*;|[\s\S]/g) ?? [];

// Parses the terminal's controlled markup (<span class="...">...</span>
// nesting only) into a tree whose text is split into single visible
// characters (entities count as one). Returns null for anything else so
// the caller can fall back to instant rendering - typing can never break
// output it does not understand.
function parseSpanHtml(html: string): HtmlNode[] | null {
  const root: HtmlNode[] = [];
  const stack: HtmlNode[][] = [root];
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
      const open = rest.match(/^<span\s+class="([^"]*)"\s*>/);
      const close = rest.match(/^<\/span\s*>/);

      if (open) {
        flushText();
        const children: HtmlNode[] = [];
        stack[stack.length - 1].push({ kind: "span", className: open[1], children });
        stack.push(children);
        i += open[0].length;
      } else if (close) {
        flushText();
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
    } else {
      const children = renderTyped(node.children, cursor, `${keyPrefix}-${index}`);
      if (children.length > 0) {
        out.push(
          <span key={`${keyPrefix}-${index}`} className={node.className}>
            {children}
          </span>,
        );
      }
    }
  });

  return out;
}

type TerminalProps = {
  open: boolean;
  onClose: () => void;
};

export default function Terminal({ open, onClose }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>(() => {
    const ok = '[<span class="ok"> OK </span>]';
    return [
      { id: 0, tone: "plain", kind: "ascii", text: ASCII_BANNER, delay: 0 },
      { id: 1, tone: "plain", html: `${ok} mounting portfolio.fs`, delay: 200 },
      { id: 2, tone: "plain", html: `${ok} loading developer profile`, delay: 350 },
      { id: 3, tone: "plain", html: `${ok} opening guest session`, delay: 500 },
      { id: 4, tone: "success", text: "Welcome to Basem's Secret Developer Terminal!", delay: 750 },
      { id: 5, tone: "info", text: 'Type "help" to see available commands.', delay: 950 },
      { id: 6, tone: "plain", text: "", delay: 1100 },
    ];
  });
  const [glitch, setGlitch] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const nextId = useRef(7);
  const timers = useRef<number[]>([]);
  const typingQueue = useRef<QueueEntry[]>([]);
  const typingTimer = useRef(0);

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

      entry.shown = Math.min(entry.shown + TYPE_CHUNK, entry.length);
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
        const tree = parseSpanHtml(item.html);
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

    setLines((current) => [...current, ...added]);
    startTyping();
  };

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

  useEffect(() => {
    if (!open) return;

    const handleGlobalKeys = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTyping();
        onClose();
      } else if (event.key === "Tab") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeys);
    return () => document.removeEventListener("keydown", handleGlobalKeys);
    // finishTyping only touches refs, so re-binding it every render is pointless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  const run = (input: string) => {
    const command = COMMAND_ALIASES[input] ?? input;

    if (command === "clear") {
      finishTyping();
      setLines([]);
      return;
    }

    if (command === "exit") {
      onClose();
      return;
    }

    if (!COMMAND_NAMES.includes(command)) {
      append([
        { tone: "error", text: `Command not found: ${input}` },
        { tone: "info", text: 'Type "help" to see available commands.' },
      ]);
      return;
    }

    append([{ tone: "plain", html: COMMAND_OUTPUT[command] }]);

    if (command === "matrix") {
      timers.current.push(
        window.setTimeout(() => setGlitch(true), 100),
        window.setTimeout(() => setGlitch(false), 1100),
      );
    }
  };

  /** Echo a command in the transcript, then run it. Enter and the quick
      command chips share this path, so both read the same in history. */
  const submit = (raw: string) => {
    history.current.push(raw);
    historyIndex.current = history.current.length;
    append([
      { tone: "plain", html: `${PROMPT_HTML} <span class="cmd">${escapeHtml(raw)}</span>` },
    ]);
    run(raw.toLowerCase());
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    finishTyping();
    const input = event.currentTarget;

    if (event.key === "Enter") {
      const raw = input.value.trim();

      if (raw) submit(raw);
      else input.value = "";
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex.current > 0) {
        historyIndex.current--;
        input.value = history.current[historyIndex.current];
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex.current < history.current.length - 1) {
        historyIndex.current++;
        input.value = history.current[historyIndex.current];
      } else {
        historyIndex.current = history.current.length;
        input.value = "";
      }
    }
  };

  const close = () => {
    finishTyping();
    onClose();
  };

  return (
    <div className="egg">
      <div
        className={`eov dim${open ? " show" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          id="secret-terminal"
          dir="ltr"
          className="eterm"
          role="dialog"
          aria-modal="true"
          aria-label="Secret terminal"
          inert={!open}
        >
          <div className="eth">
            <b>
              <Mark className="i" />
              <span>basem@portfolio: ~</span>
              <em>zsh</em>
            </b>
            <span className="r">
              <span>Esc to close</span>
              <button
                type="button"
                className="egx"
                aria-label="Close terminal"
                onClick={close}
              >
                <Icon name="x" className="i" />
              </button>
            </span>
          </div>
          <div
            ref={bodyRef}
            onClick={finishTyping}
            className={`etb${glitch ? " gl" : ""}`}
            id="terminal-output"
            tabIndex={0}
            aria-label="Terminal output"
          >
            {lines.map((line) => {
              const style = line.delay ? { animationDelay: `${line.delay}ms` } : undefined;

              if (line.kind === "ascii") {
                return (
                  <pre key={line.id} style={style} className="ascii">
                    {line.text ?? ""}
                  </pre>
                );
              }

              if (line.kind === "banner") {
                return (
                  <div key={line.id} style={style} className="ln hd">
                    BASEM · Secret Terminal
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

          <div className="etc" role="group" aria-label="Quick commands">
            {COMMAND_NAMES.map((name) => (
              <button key={name} type="button" onClick={() => submit(name)}>
                {name}
              </button>
            ))}
          </div>

          <div className="eti">
            <label htmlFor="terminal-input">
              <span className="u">guest@basem</span>:<span className="p">~</span>$
            </label>
            <input
              ref={inputRef}
              id="terminal-input"
              type="text"
              placeholder={
                isMobileViewport() ? "Type a command" : "Type 'help' for available commands…"
              }
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Terminal command"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
