"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

const ZONE = "Africa/Cairo";
const LIVE_MS = 45_000;

const part = (now: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: ZONE, ...options }).format(now);

/** Seconds since midnight in Cairo, for the "day" meter. */
const secondsIntoDay = (now: Date) => {
  const [h, m, s] = part(now, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    .split(":")
    .map(Number);
  return (h % 24) * 3600 + m * 60 + s;
};

/** Cairo's date and a live, ticking time with a day meter. It ticks for a
    little under a minute, then settles, so an old line never keeps a timer
    running. Reduced motion shows the moment it was printed. */
export default function ClockLine({ style }: { style?: CSSProperties }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const begun = Date.now();
    const timer = window.setInterval(() => {
      setNow(new Date());
      if (Date.now() - begun > LIVE_MS) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = Number(part(now, { hour: "2-digit", hour12: false })) % 24;
  const pct = Math.round((secondsIntoDay(now) / 86400) * 100);
  const filled = Math.round((pct / 100) * 16);
  const status = hour < 7 ? "Probably asleep. Email still works." : "Basem is on Egypt time.";

  return (
    <div className="ln clk" style={style}>
      <div>
        <span className="key">{"cairo   "}</span>
        <span className="wl">{part(now, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
      <div>
        <span className="key">{"time    "}</span>
        <span className="wl">{part(now, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
      </div>
      <div>
        <span className="key">{"day     "}</span>
        <span className="hl">{"█".repeat(filled)}</span>
        <span className="dim">{"░".repeat(16 - filled)}</span> {pct}%
      </div>
      <div className="dim">{status}</div>
    </div>
  );
}
