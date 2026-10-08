"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { isMobileViewport } from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { prefersReducedMotion } from "@/lib/scroll";
import { ASCII_BANNER, COMMAND_ALIASES, COMMAND_NAMES, COMMAND_OUTPUT } from "@/lib/terminalCommands";

type Tone = "plain" | "prompt" | "success" | "info" | "error";

type Line = {
  id: number;
  tone: Tone;
  text?: string;
  html?: string;
  kind?: "ascii" | "banner";
  delay?: number;
};

type NewLine = Omit<Line, "id">;

const toneClasses: Record<Tone, string> = {
  plain: "",
  prompt: "font-bold text-[#fbbf24]",
  success: "text-[#fbbf24]",
  info: "text-[#fde68a] [text-shadow:0_0_6px_rgba(251,191,36,0.55)]",
  error: "text-[#f87171] [text-shadow:0_0_6px_rgba(248,113,113,0.55)]",
};

const lineClass = "mb-2 animate-terminal-line max-md:text-[13px] max-md:leading-[1.5]";

const TYPE_CHUNK = 4;
const TYPE_INTERVAL = 12;

type QueueEntry = { id: number; full: string; shown: number };

const BANNER_COLORS = ["#fef3c7", "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706", "#fbbf24"];

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PROMPT_HTML =
  '<span class="font-bold text-[#4ade80]">guest@basem</span><span class="text-[#fde68a]">:</span><span class="font-bold text-[#60a5fa]">~</span><span class="text-[#fde68a]">$</span>';

type TerminalProps = {
  open: boolean;
  onClose: () => void;
};

export default function Terminal({ open, onClose }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>(() => {
    const ok = '[<span class="font-bold text-[#4ade80]"> OK </span>]';
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

  const renderLine = (id: number, text: string) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, text } : line)));
  };

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

      entry.shown = Math.min(entry.shown + TYPE_CHUNK, entry.full.length);
      renderLine(entry.id, entry.full.slice(0, entry.shown));

      if (entry.shown >= entry.full.length) {
        typingQueue.current.shift();
      }
    }, TYPE_INTERVAL);
  };

  const finishTyping = () => {
    const queue = typingQueue.current;
    if (queue.length === 0 && typingTimer.current === 0) return;

    const completes = new Map(queue.map((entry) => [entry.id, entry.full] as const));
    typingQueue.current = [];
    stopTyping();

    if (completes.size === 0) return;
    setLines((current) =>
      current.map((line) => {
        const full = completes.get(line.id);
        return full !== undefined ? { ...line, text: full } : line;
      }),
    );
  };

  const append = (items: NewLine[]) => {
    const canType = !prefersReducedMotion();

    const entries = items.map((item) => ({
      item,
      types: canType && item.html === undefined && Boolean(item.text),
    }));

    const added = withIds(
      entries.map(({ item, types }) => (types ? { ...item, text: "" } : item)),
    );

    setLines((current) => [...current, ...added]);

    if (!canType) return;

    entries.forEach((entry, index) => {
      if (!entry.types) return;
      typingQueue.current.push({ id: added[index].id, full: entry.item.text ?? "", shown: 0 });
    });

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
        { tone: "info", text: 'Type "help" for available commands.' },
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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    finishTyping();
    const input = event.currentTarget;

    if (event.key === "Enter") {
      const command = input.value.trim().toLowerCase();

      if (command) {
        history.current.push(command);
        historyIndex.current = history.current.length;
        append([{ tone: "plain", html: `${PROMPT_HTML} <span class="font-bold text-[#fde68a]">${escapeHtml(command)}</span>` }]);
        run(command);
      }

      input.value = "";
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
    <>
      <div
        className={`fixed inset-0 z-[9999] bg-black/85 backdrop-blur-[5px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
      ></div>
      <div
        id="secret-terminal"
        dir="ltr"
        className={`fixed z-[10000] flex flex-col overflow-hidden rounded-xl border-2 border-[#fbbf24] bg-[#131007] [font-family:var(--font-terminal),var(--font-mono-body),monospace] shadow-[0_0_70px_rgba(251,191,36,0.3),inset_0_0_60px_rgba(251,191,36,0.05)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] after:pointer-events-none after:absolute after:inset-0 after:z-[5] after:rounded-xl after:bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(0,0,0,0.35)_100%)] after:content-[''] top-1/2 left-1/2 h-[600px] w-[90%] max-w-[800px] -translate-x-1/2 -translate-y-1/2 max-md:h-auto max-md:min-h-[50dvh] max-md:max-h-[calc(100dvh_-_6rem)] max-md:w-[calc(100%_-_2rem)] max-md:max-w-none max-md:rounded-2xl ${open ? "scale-100 opacity-100" : "pointer-events-none scale-0 opacity-0"}`}
        role="dialog"
        aria-label="Secret terminal"
        inert={!open}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-12 animate-crt-sweep bg-gradient-to-b from-transparent via-[rgba(251,191,36,0.06)] to-transparent"
          aria-hidden="true"
        ></div>

        <div className="relative z-[3] flex shrink-0 items-center justify-between border-b border-[#fbbf24] bg-[linear-gradient(135deg,#1a150b_0%,#0e0b07_100%)] px-5 py-3 shadow-[0_2px_10px_rgba(251,191,36,0.2)] max-md:px-4">
          <div className="text-[14px] font-bold tracking-[2px] text-[#fbbf24] uppercase [text-shadow:0_0_12px_rgba(251,191,36,0.6)] max-[481px]:text-[12px]">
            <Icon name="terminal" className="inline size-[1em]" /> BASEM_TERMINAL v1.0.0
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex size-11 cursor-pointer items-center justify-end"
              aria-label="Close terminal"
              onClick={close}
            >
              <span className="size-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.7)] transition-transform duration-200 hover:scale-125"></span>
            </button>
            <span
              aria-hidden="true"
              className="size-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.6)]"
            ></span>
            <span
              aria-hidden="true"
              className="size-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.6)]"
            ></span>
          </div>
        </div>
        <div
          ref={bodyRef}
          onClick={finishTyping}
          className={`relative z-[1] min-h-0 flex-auto overflow-y-auto bg-[rgba(19,16,10,0.95)] p-5 before:pointer-events-none before:absolute before:inset-0 before:z-[2] before:animate-scanline before:bg-[linear-gradient(transparent_50%,rgba(251,191,36,0.06)_50%)] before:bg-[length:100%_4px] before:content-[''] ${glitch ? "animate-glitch" : ""}`}
        >
          <div
            className="relative z-[1] text-[14px] leading-[1.6] whitespace-pre-wrap text-[#fbbf24] [text-shadow:0_0_7px_rgba(251,191,36,0.45)] max-md:p-2"
            id="terminal-output"
          >
            {lines.map((line) => {
              const style = line.delay ? { animationDelay: `${line.delay}ms` } : undefined;

              if (line.kind === "ascii") {
                return (
                  <pre
                    key={line.id}
                    style={style}
                    className="my-4 animate-terminal-line text-[13px] leading-[1.32] whitespace-pre [font-family:inherit] max-md:text-[9px]"
                  >
                    {(line.text ?? "").split("\n").map((row, index) => (
                      <span
                        key={index}
                        className="block"
                        style={{
                          color: BANNER_COLORS[Math.min(index, BANNER_COLORS.length - 1)],
                          textShadow: "0 0 8px rgba(251,191,36,0.45)",
                        }}
                      >
                        {row || " "}
                      </span>
                    ))}
                  </pre>
                );
              }

              if (line.kind === "banner") {
                return (
                  <div
                    key={line.id}
                    style={style}
                    className="mt-[5px] mb-[15px] flex animate-terminal-line items-center justify-center gap-[15px] rounded-lg border-2 border-[rgba(251,191,36,0.3)] bg-[linear-gradient(135deg,rgba(251,191,36,0.1)_0%,rgba(253,230,138,0.08)_100%)] px-2.5 py-5"
                  >
                    <div className="animate-banner-icon text-[20px]">⚡</div>
                    <div className="flex flex-col items-center gap-0.5">
                      <strong className="bg-[linear-gradient(135deg,#fbbf24_0%,#fde68a_100%)] bg-clip-text text-[24px] font-black tracking-[3px] text-transparent">
                        BASEM
                      </strong>
                      <span className="text-[11px] font-semibold tracking-[2px] text-[#fbbf24] uppercase opacity-90">
                        Secret Terminal
                      </span>
                    </div>
                    <div className="animate-banner-icon text-[20px]">⚡</div>
                  </div>
                );
              }

              const className = `${lineClass} ${toneClasses[line.tone]}`;

              return line.html !== undefined ? (
                <div
                  key={line.id}
                  style={style}
                  className={className}
                  dangerouslySetInnerHTML={{ __html: line.html }}
                />
              ) : (
                <div key={line.id} style={style} className={className}>
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative z-[3] flex shrink-0 items-center gap-2.5 border-t border-[#fbbf24] bg-[rgba(26,22,14,0.95)] px-5 py-3">
          <span className="text-[14px] font-bold whitespace-nowrap text-[#fbbf24] [text-shadow:0_0_6px_rgba(251,191,36,0.55)] max-md:text-[12px]"><span className="text-[#4ade80]">guest@basem</span><span className="text-[#fde68a]">:</span><span className="text-[#60a5fa]">~</span><span className="text-[#fde68a]">$</span></span>
          <input
            ref={inputRef}
            id="terminal-input"
            type="text"
            className="flex-1 bg-transparent text-[14px] text-[#fde68a] caret-[#fbbf24] [caret-shape:block] outline-none [text-shadow:0_0_5px_rgba(251,191,36,0.4)] placeholder:text-[rgba(251,191,36,0.35)] max-md:text-[12px]"
            placeholder="Type 'help' for available commands..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal command"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </>
  );
}