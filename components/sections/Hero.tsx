"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Icon from "@/components/ui/Icon";
import {
  CV_PATH,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
  PROFILE_CUTOUT,
  PROFILE_CUTOUT_SIZES_HERO,
  PROFILE_CUTOUT_SRCSET,
} from "@/data/site";
import { mountHeroFx } from "@/lib/hero-fx";
import type { Dictionary } from "@/lib/dictionaries/en";
import "./Hero.css";

type HeroProps = {
  dict: Dictionary["hero"];
};

/**
 * The opening stage: a mono "$ whoami" rule, the name at display scale with a
 * blinking caret, the portrait with its orbit ring, the "open to work" ticket
 * and the reach row. Behind it two canvases draw the sky — a 2D halftone that
 * paints immediately, then a WebGL2 nebula that cross-fades in (mockup rev 32).
 */
export default function Hero({ dict }: HeroProps) {
  const hostRef = useRef<HTMLElement>(null);
  const halftoneRef = useRef<HTMLCanvasElement>(null);
  const nebulaRef = useRef<HTMLCanvasElement>(null);

  // The display name stacks on two lines: given name on the first, the rest on
  // the second (with the caret). Splits the dictionary name, so /ar gets the
  // Arabic name in Arabic.
  const [nameTop, ...nameRest] = dict.name.trim().split(/\s+/);
  const nameBottom = nameRest.join(" ");

  // The status detail is a " · "-separated list. It is split into two halves so
  // the badge can break the line between them (each half stays whole) instead of
  // wrapping mid-list and leaving a dot dangling at a line end. Screen readers
  // still hear the whole list.
  const statusItems = dict.statusDetail.split(" · ");
  const statusSplit = Math.ceil(statusItems.length / 2);
  const statusLead = statusItems.slice(0, statusSplit).join(" · ");
  const statusTail = statusItems.slice(statusSplit).join(" · ");

  useEffect(() => {
    const host = hostRef.current;
    const halftone = halftoneRef.current;
    const nebula = nebulaRef.current;
    if (!host || !halftone || !nebula) return;
    return mountHeroFx(host, halftone, nebula);
  }, []);

  return (
    <section id="hero" className="hero-s" aria-labelledby="h-name" ref={hostRef}>
      <canvas className="hero-cv" ref={halftoneRef} aria-hidden="true" />
      <canvas className="nb-cv" ref={nebulaRef} aria-hidden="true" />

      <div className="hero-in">
        <div className="hero-top">
          <p className="who" data-rise style={{ "--d": "0ms" } as CSSProperties}>
            <span className="w-p">{dict.whoami}</span>
            <span className="w-rule" aria-hidden="true"></span>
            <span className="w-meta">
              <i className="w-pin" aria-hidden="true"></i>
              <span>{dict.location}</span>
            </span>
          </p>

          <h1 className="display" id="h-name" data-rise style={{ "--d": "120ms" } as CSSProperties}>
            <span className="ln block">{nameTop}</span>{" "}
            <span className="ln block">
              {nameBottom}
              <span className="cursor" aria-hidden="true"></span>
            </span>
          </h1>

          <p className="role" data-rise style={{ "--d": "240ms" } as CSSProperties}>
            {dict.role}
          </p>
        </div>

        <div className="pf" id="pf" data-rise style={{ "--d": "200ms" } as CSSProperties}>
          <div className="pf-glow" aria-hidden="true"></div>
          <picture>
            <source
              srcSet={PROFILE_CUTOUT_SRCSET}
              sizes={PROFILE_CUTOUT_SIZES_HERO}
              type="image/webp"
            />
            {/* Fixed intrinsic size with fetch priority; the portrait is the
                LCP element, so it renders as-is rather than through
                next/image's loader. The cut-out carries the subject alone,
                so the stage glow shows through (mockup `.pf>img`). */}
            <img
              src={PROFILE_CUTOUT}
              srcSet={PROFILE_CUTOUT_SRCSET}
              sizes={PROFILE_CUTOUT_SIZES_HERO}
              alt={dict.portraitAlt}
              width={640}
              height={598}
              fetchPriority="high"
            />
          </picture>
          {/* The portrait is a real button: keyboard and touch users can
              play the click hunt too (mockup `#pf-hit`). The easter-egg
              layer listens on it; activating it does exactly what clicking
              the photo does. */}
          <button type="button" className="pf-hit" id="pf-hit" aria-label={dict.portraitAlt} />
          <div className="pf-orbit" aria-hidden="true">
            <i></i>
          </div>

          <div className="hire-b" role="note">
            <span className="hb-tape" aria-hidden="true"></span>
            <span className="hb-stub" aria-hidden="true">
              <i className="hb-dot"></i>
            </span>
            <span className="hb-t">
              <span className="hb-k">{dict.statusKey}</span>
              <b>{dict.status}</b>
              <small>
                <span className="hb-g">
                  {statusLead}
                  {statusTail && <span className="hb-sep"> ·</span>}
                </span>
                {statusTail && (
                  <>
                    {" "}
                    <span className="hb-g">{statusTail}</span>
                  </>
                )}
              </small>
              <svg
                className="hb-sq"
                viewBox="0 0 120 8"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path pathLength={1} d="M2 5 C12 1 18 8 30 4 S48 1 60 5 S84 8 96 3 S112 2 118 4" />
              </svg>
            </span>
          </div>

          <p className="pf-note" aria-hidden="true">
            <svg viewBox="0 0 60 40">
              <path d="M4 6 C20 2 44 10 50 34" />
              <path d="M42 28 L50 35 L54 24" />
            </svg>
            <span>{dict.note}</span>
          </p>
        </div>

        <div className="hero-body">
          <p className="lead" data-rise style={{ "--d": "320ms" } as CSSProperties}>
            {dict.lead}
          </p>

          <div className="actions" data-rise style={{ "--d": "400ms" } as CSSProperties}>
            <a className="btn btn-primary" href="#work">
              <span>{dict.viewWork}</span>
              <Icon name="arrowRight" className="size-4 rtl:rotate-180" />
            </a>
            <a className="btn btn-ghost" href={CV_PATH} download>
              <Icon name="fileDown" className="size-4" />
              <span>{dict.downloadCv}</span>
            </a>
          </div>

          <div className="reach" data-rise style={{ "--d": "440ms" } as CSSProperties}>
            <a className="tel" href={PHONE_TEL}>
              <Icon name="phone" className="size-4" />
              {PHONE_DISPLAY}
            </a>
            <a
              className="ibtn"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.socials.github}
            >
              <Icon name="github" className="size-4" />
            </a>
            <a
              className="ibtn"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.socials.linkedin}
            >
              <Icon name="linkedIn" className="size-4" />
            </a>
            <a className="ibtn" href={MAILTO} aria-label={dict.socials.email}>
              <Icon name="mail" className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
