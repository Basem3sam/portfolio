"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { isMobileViewport } from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { ASCII_BANNER, COMMAND_NAMES, COMMAND_OUTPUT } from "@/lib/terminalCommands";

type Tone = "plain" | "prompt" | "success" | "info" | "error";

type Line = {
  id: number;
  tone: Tone;
  text?: string;
  html?: string;
  kind?: "ascii" | "banner";
};

type NewLine = Omit<Line, "id">;

const toneClasses: Record<Tone, string> = {
  plain: "",
  prompt: "font-bold text-[#fbbf24]",
  success: "text-[#fbbf24]",
  info: "text-[#fde68a] [text-shadow:0_0_5px_rgba(251,191,36,0.5)]",
  error: "text-[#f87171] [text-shadow:0_0_5px_rgba(248,113,113,0.5)]",
};

const lineClass = "mb-2 animate-terminal-line max-md:text-[13px] max-md:leading-[1.5]";

type TerminalProps = {
  open: boolean;
  onClose: () => void;
};

export default function Terminal({ open, onClose }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [glitch, setGlitch] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  const withIds = (items: NewLine[]): Line[] =>
    items.map((item) => ({ ...item, id: nextId.current++ }));

  const append = (items: NewLine[]) => setLines((current) => [...current, ...withIds(items)]);

  useEffect(() => {
    if (!open) return;

    const mobile = isMobileViewport();

    setLines(
      withIds([
        mobile
          ? { tone: "plain", kind: "banner" }
          : { tone: "plain", kind: "ascii", text: ASCII_BANNER },
        { tone: "success", text: "Welcome to Basem's Secret Developer Terminal!" },
        { tone: "info", text: 'Type "help" to see available commands.' },
        { tone: "plain", text: "" },
      ]),
    );
    lockScroll();
    if (!mobile) inputRef.current?.focus();

    return () => unlockScroll();
  }, [open]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const run = (command: string) => {
    if (command === "clear") {
      setLines([]);
      return;
    }

    if (command === "exit") {
      onClose();
      return;
    }

    if (!COMMAND_NAMES.includes(command)) {
      append([
        { tone: "error", text: `Command not found: ${command}` },
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
    const input = event.currentTarget;

    if (event.key === "Enter") {
      const command = input.value.trim().toLowerCase();

      if (command) {
        history.current.push(command);
        historyIndex.current = history.current.length;
        append([{ tone: "prompt", text: `guest@basem:~$ ${command}` }]);
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

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] bg-black/85 backdrop-blur-[5px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      ></div>
      <div
        id="secret-terminal"
        className={`fixed top-1/2 left-1/2 z-[10000] h-[600px] w-[90%] max-w-[800px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-[#fbbf24] bg-[#0c0a06] font-mono shadow-[0_0_50px_rgba(251,191,36,0.25),inset_0_0_50px_rgba(251,191,36,0.04)] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] max-md:h-[80vh] max-md:w-[95%] ${open ? "scale-100 opacity-100" : "pointer-events-none scale-0 opacity-0"}`}
        role="dialog"
        aria-label="Secret terminal"
        inert={!open}
      >
        <div className="flex items-center justify-between border-b border-[#fbbf24] bg-[linear-gradient(135deg,#1a150b_0%,#0e0b07_100%)] px-5 py-3 shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
          <div className="text-[14px] font-bold tracking-[2px] text-[#fbbf24] uppercase [text-shadow:0_0_10px_rgba(251,191,36,0.5)] max-[481px]:text-[12px]">
            <Icon name="terminal" className="inline size-[1em]" /> BASEM_TERMINAL v1.0.0
          </div>
          <div className="flex gap-2">
            <button
              className="size-3 cursor-pointer rounded-full bg-[#ff5f56] transition-transform duration-200 hover:scale-125"
              aria-label="Close terminal"
              onClick={onClose}
            ></button>
            <span className="size-3 rounded-full bg-[#ffbd2e]"></span>
            <span className="size-3 rounded-full bg-[#27c93f]"></span>
          </div>
        </div>
        <div
          ref={bodyRef}
          className={`relative h-[calc(100%-100px)] overflow-y-auto bg-[rgba(12,10,6,0.95)] p-5 before:pointer-events-none before:absolute before:inset-0 before:animate-scanline before:bg-[linear-gradient(transparent_50%,rgba(251,191,36,0.03)_50%)] before:bg-[length:100%_4px] before:content-[''] ${glitch ? "animate-glitch" : ""}`}
        >
          <div
            className="text-[14px] leading-[1.6] whitespace-pre-wrap text-[#fbbf24] [text-shadow:0_0_5px_rgba(251,191,36,0.4)] max-md:p-2.5"
            id="terminal-output"
          >
            {lines.map((line) => {
              if (line.kind === "ascii") {
                return (
                  <pre
                    key={line.id}
                    className={`my-5 animate-terminal-line text-[10px] leading-none text-[#fbbf24] [text-shadow:0_0_10px_rgba(251,191,36,0.3)] max-md:text-[8px]`}
                  >
                    {line.text}
                  </pre>
                );
              }

              if (line.kind === "banner") {
                return (
                  <div
                    key={line.id}
                    className="mt-[5px] mb-[15px] flex animate-banner-glow items-center justify-center gap-[15px] rounded-lg border-2 border-[rgba(251,191,36,0.3)] bg-[linear-gradient(135deg,rgba(251,191,36,0.1)_0%,rgba(253,230,138,0.08)_100%)] px-2.5 py-5"
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
                <div key={line.id} className={className} dangerouslySetInnerHTML={{ __html: line.html }} />
              ) : (
                <div key={line.id} className={className}>
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 flex items-center gap-2.5 border-t border-[#fbbf24] bg-[rgba(20,17,10,0.95)] px-5 py-[15px]">
          <span className="text-[14px] font-bold whitespace-nowrap text-[#fbbf24] [text-shadow:0_0_5px_rgba(251,191,36,0.5)] max-md:text-[12px]">
            guest@basem:~$           </span>
          <input
            ref={inputRef}
            id="terminal-input"
            type="text"
            className="flex-1 bg-transparent text-[14px] text-[#fde68a] outline-none [text-shadow:0_0_5px_rgba(251,191,36,0.4)] placeholder:text-[rgba(251,191,36,0.35)] max-md:text-[12px]"
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