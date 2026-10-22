"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

/** Whole brew, in ms. Terminal.tsx prints the closing message after this, and
    playBrewSound() in lib/sounds.ts is timed to the same phases. */
export const BREW_MS = 4500;

const GRIND_END = 700;
const HEAT_END = 1500;
const POUR_STEP = 550;
const POUR_END = 3700;
const READY_AT = 3900;
const TICK = 110;

const INNER = 11;
const STEAM = " ( )  ) (  ( )   ) ( ";
const BAR = 12;

type Phase = "grind" | "heat" | "pour" | "settle" | "ready";

const phaseAt = (t: number): Phase =>
  t < GRIND_END
    ? "grind"
    : t < HEAT_END
      ? "heat"
      : t < POUR_END
        ? "pour"
        : t < READY_AT
          ? "settle"
          : "ready";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** One of three rows above the cup: what is in the air depends on the phase. */
function airRow(phase: Phase, row: number, frame: number, level: number): string {
  const pad = " ".repeat(4);

  if (phase === "grind") {
    const at = (frame * 3 + row * 4) % INNER;
    return pad + " ".repeat(at) + (row === 2 ? "∙" : "•");
  }
  if (phase === "heat") {
    const dots = "°  ˚  °  ˚  °";
    return pad + dots.slice((frame + row) % 3, (frame + row) % 3 + INNER);
  }
  if (phase === "pour") {
    return pad + " ".repeat(5) + ((frame + row) % 2 ? "¦" : "│");
  }

  // Steam: thin while it settles, full when it is ready.
  const shown = phase === "ready" ? 3 : level >= 4 ? 1 : 0;
  if (row < 3 - shown) return "";
  const start = (frame * 2 + row * 5) % STEAM.length;
  return pad + (STEAM + STEAM).slice(start, start + INNER + 2);
}

function renderCup(phase: Phase, frame: number, level: number): ReactNode[] {
  const out: ReactNode[] = [];
  const line = (key: string, ...parts: ReactNode[]) => {
    out.push(<span key={key}>{parts}</span>, "\n");
  };

  for (let row = 0; row < 3; row++) {
    line(`air${row}`, <span className="cs">{airRow(phase, row, frame, level)}</span>);
  }

  const waves = Array.from({ length: INNER }, (_, i) => ((i + frame) % 2 ? "≈" : "~")).join("");
  const body = "▒".repeat(INNER);
  const inner = (index: number): ReactNode => {
    const filled = index >= 4 - level;
    if (!filled) return " ".repeat(INNER);
    // The top filled row is the surface: a pale, shifting crema.
    return index === 4 - level ? <span className="ct">{waves}</span> : <span className="cl">{body}</span>;
  };

  const ready = phase === "ready";
  const handles = ["|--.", "|  |", "|  |", "|-'"];
  line(
    "rim",
    <span className="cc">{"  .-----------."}</span>,
    ready ? <span className="cz z1">{"  ✦"}</span> : null,
  );
  for (let index = 0; index < 4; index++) {
    line(
      `in${index}`,
      <span className="cc">{"  |"}</span>,
      inner(index),
      <span className="cc">{handles[index]}</span>,
      ready && index === 2 ? <span className="cz z2">{" ✧"}</span> : null,
    );
  }

  const taper = level > 0 ? <span className="cl">{"▒".repeat(9)}</span> : " ".repeat(9);
  const taper2 = level > 0 ? <span className="cl">{"▒".repeat(7)}</span> : " ".repeat(7);
  line("t1", <span className="cc">{"   \\"}</span>, taper, <span className="cc">{"/"}</span>);
  line("t2", <span className="cc">{"    '"}</span>, taper2, <span className="cc">{"'"}</span>);
  line(
    "saucer",
    <span className={`cc${phase === "heat" ? " cheat" : ""}`}>{"  ==============="}</span>,
  );
  return out;
}

function status(phase: Phase, t: number): string {
  if (phase === "grind") return "grinding beans";
  if (phase === "heat") {
    const temp = Math.round(20 + 72 * clamp((t - GRIND_END) / (HEAT_END - GRIND_END)));
    return `heating ${temp}°C`;
  }
  if (phase === "pour") return "pouring";
  if (phase === "settle") return "letting it bloom";
  return "ready. enjoy";
}

type Props = { style?: CSSProperties };

/** A cup that brews in the terminal: beans, heat, a pour that fills it row by
    row, then steam. Pure drawing; the parent owns the closing message and the
    trophy so clearing the screen mid-brew cannot lose them. */
export default function CoffeeBrew({ style }: Props) {
  const [t, setT] = useState(() => (prefersReducedMotion() ? BREW_MS : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      setT(Math.min(elapsed, BREW_MS));
      if (elapsed >= BREW_MS) window.clearInterval(timer);
    }, TICK);
    return () => window.clearInterval(timer);
  }, []);

  const phase = phaseAt(t);
  const frame = Math.floor(t / (TICK * 2));
  const level = phase === "grind" || phase === "heat" ? 0 : clamp(Math.floor((t - HEAT_END) / POUR_STEP) + 1, 0, 4);
  const pct = Math.round(clamp(t / READY_AT) * 100);
  const filled = Math.round((pct / 100) * BAR);

  return (
    <div
      className={`ln cof ${phase}`}
      style={style}
      role="img"
      aria-label={phase === "ready" ? "A fresh cup of coffee" : "A cup of coffee brewing"}
    >
      <pre className="cof-art" aria-hidden="true">
        {renderCup(phase, frame, level)}
      </pre>
      <div className="cof-st" aria-hidden="true">
        <span className="dim">[</span>
        <span className="cof-bar">{"█".repeat(filled)}</span>
        <span className="dim">{"░".repeat(BAR - filled)}</span>
        <span className="dim">]</span> {String(pct).padStart(3, " ")}%{" "}
        <span className={phase === "ready" ? "ok" : "dim"}>{status(phase, t)}</span>
      </div>
    </div>
  );
}
