"use client";

import "./Experience.css";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Icon from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";
import { prefersReducedMotion } from "@/lib/scroll";
import { fastScroll } from "@/lib/scroll-speed";

type ExperienceProps = {
  dict: Dictionary["experience"];
  locale: Locale;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const twoDigits = (value: number) => String(value).padStart(2, "0");

/**
 * Timeline glyph per entry, taken from the mockup sprite: briefcase / code /
 * user. `components/ui/Icon.tsx` has no "users" glyph, so the third one is
 * inlined from the sprite rather than editing Icon.tsx. Decorative only.
 */
function EntryIcon({ index }: { index: number }) {
  if (index === 2) {
    return (
      <svg
        className="xp-ic"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }
  return <Icon name={index === 0 ? "briefcase" : "code"} className="xp-ic" />;
}

/**
 * Experience (mockup §sec-experience): a honey-railed timeline whose cards
 * come into focus as they cross the viewport centre, plus a sticky story
 * panel that swaps its caption per entry (Portfolio Design Mockup.html,
 * base ~790–809, Rev 23 ~2232–2281, Rev 25 ~2297–2298, JS ~4315–4341).
 *
 * The scrub is a passive rAF-throttled scroll listener — no scroll-jacking.
 * Under `prefers-reduced-motion` it never attaches: the timeline renders in
 * its static state (cards at full focus, first story shown in the panel) and
 * nothing that carries information depends on it.
 */
export default function Experience({ dict, locale }: ExperienceProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || prefersReducedMotion()) return;

    const items = Array.from(wrap.querySelectorAll<HTMLElement>(".xp2"));
    const dots = items.map((item) => item.querySelector<HTMLElement>(".tl-dot"));
    const timeline = wrap.querySelector<HTMLElement>(".tl");
    let frame = 0;
    let trailing = 0;
    let lastStep = 0;

    const step = () => {
      frame = 0;
      lastStep = performance.now();
      const viewport = window.innerHeight;

      // Read every rect first, then write every style. The old loop wrote an
      // entry's --f and then measured the next entry, so each measurement
      // forced the browser to recalculate style and layout in the middle of the
      // scroll frame, once per entry.
      const rects = items.map((item) => item.getBoundingClientRect());
      const dotMids = items.map((_, index) => {
        const dot = dots[index];
        const rect = dot ? dot.getBoundingClientRect() : rects[index];
        return rect.top + rect.height / 2;
      });
      const timelineRect = timeline ? timeline.getBoundingClientRect() : null;

      let best = 0;
      let bestDistance = Infinity;
      const focus = rects.map((rect, index) => {
        const distance = Math.abs(rect.top + rect.height / 2 - viewport / 2);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
        return clamp(1 - distance / (viewport * 0.55), 0, 1).toFixed(3);
      });

      items.forEach((item, index) => {
        item.style.setProperty("--f", focus[index]);
        item.classList.toggle("passed", dotMids[index] <= viewport / 2 + 1);
        item.classList.toggle("act", index === best);
      });

      if (timeline && timelineRect) {
        const progress = clamp(
          (viewport / 2 - timelineRect.top - 26) / Math.max(timelineRect.height - 52, 1),
          0,
          1,
        );
        timeline.style.setProperty("--tp", progress.toFixed(3));
      }

      setActive(best);
    };

    const request = () => {
      if (frame) return;
      // While a finger is flinging the page this section only needs to be right
      // when it stops: update ~8 times a second, then once more on arrival.
      if (fastScroll() && performance.now() - lastStep < 120) {
        if (!trailing) {
          trailing = window.setTimeout(() => {
            trailing = 0;
            request();
          }, 130);
        }
        return;
      }
      frame = window.requestAnimationFrame(step);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    step();

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) window.cancelAnimationFrame(frame);
      if (trailing) window.clearTimeout(trailing);
    };
  }, []);

  const { entries } = dict;
  const story = entries[Math.min(active, entries.length - 1)];
  const caseStudyHref = locale === "ar" ? "/ar/work/trosc" : "/work/trosc";

  return (
    <section id="experience" className="sec sec-panel sec-wash">
      <SectionHeader number="02" title={dict.title} />

      <div className="xp-wrap" ref={wrapRef}>
        {/* Sticky story panel (>=1101px). Present in the DOM at all widths so
            the copy survives without JS; below the breakpoint it is hidden by
            CSS because every fact in it repeats the card next to it. */}
        <aside className="xp-side">
          <div className="xs-count" aria-hidden="true">
            <b key={`n-${active}`}>{twoDigits(active + 1)}</b>
            <span>{`/ ${twoDigits(entries.length)}`}</span>
          </div>
          <p className="xs-t" key={`t-${active}`}>
            {story.role}
          </p>
          <p className="xs-w" key={`w-${active}`}>
            {story.period}
          </p>
          <div className="xs-bar" aria-hidden="true">
            {entries.map((entry, index) => (
              <i key={entry.role} className={index <= active ? "on" : undefined}></i>
            ))}
          </div>
          <p className="xs-hint">{dict.hint}</p>
        </aside>

        <ol className="tl stagger-80" data-reveal data-stagger>
          {entries.map((entry, index) => (
            <li
              key={entry.role}
              className={entry.current ? "xp2 is-now" : "xp2"}
              style={{ "--stagger-index": index } as CSSProperties}
            >
              <span className="tl-dot" aria-hidden="true"></span>

              <div className="xp2-when">
                <EntryIcon index={index} />
                <p className="lbl" dir="auto">
                  {entry.period}
                </p>
                {entry.current && (
                  <span className="now-pill">
                    <i aria-hidden="true"></i>
                    {dict.currentLabel}
                  </span>
                )}
              </div>

              <div className="xp2-body">
                <h3>{entry.role}</h3>
                <p className="org">{entry.org}</p>
                <p>{entry.text}</p>

                <ul className="chips xp2-chips">
                  {entry.chips.map((chip) => (
                    <li key={chip} className="chip">
                      {chip}
                    </li>
                  ))}
                </ul>

                {entry.current && (
                  <Link className="more xp-more" href={caseStudyHref}>
                    {dict.caseStudy}
                    <Icon name="arrowRight" className="xp-more-arrow rtl:rotate-180" />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
