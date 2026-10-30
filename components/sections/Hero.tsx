"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Icon from "@/components/ui/Icon";
import HeroScrollDepth from "@/components/sections/HeroScrollDepth";
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
  const pfRef = useRef<HTMLDivElement>(null);

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

  // The ring answers the pointer. Layers of the loop shift by depth as the
  // pointer moves over the hero (--pfx / --pfy, -1..1, written straight to the
  // DOM on a rAF so React never re-renders). The cobalt echo loop only answers
  // when the pointer is in or close to the orange ring, or on the portrait
  // itself (tested against the photo's own transparency, not its square frame),
  // which sets `data-near`. Pressing the portrait sets `data-poke` for a moment:
  // the ring jiggles and the sparkles pop again. Skipped for reduced motion;
  // touch has no hover, so it only pokes.
  useEffect(() => {
    const host = hostRef.current;
    const pf = pfRef.current;
    if (!host || !pf) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const img = pf.querySelector<HTMLImageElement>("picture img");
    const orbit = pf.querySelector<HTMLElement>(".pf-orbit");

    // A coarse alpha map of the cut-out, so "on the portrait" means on the
    // person and not on the transparent corners of the frame around them.
    let alpha: Uint8ClampedArray | null = null;
    let mapW = 0;
    let mapH = 0;
    const buildMap = () => {
      if (!img || !img.naturalWidth) return;
      try {
        mapW = 96;
        mapH = Math.max(1, Math.round((mapW * img.naturalHeight) / img.naturalWidth));
        const canvas = document.createElement("canvas");
        canvas.width = mapW;
        canvas.height = mapH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, mapW, mapH);
        const data = ctx.getImageData(0, 0, mapW, mapH).data;
        alpha = new Uint8ClampedArray(mapW * mapH);
        for (let i = 0; i < alpha.length; i += 1) alpha[i] = data[i * 4 + 3];
      } catch {
        alpha = null;
      }
    };
    // Off the critical path: the map only matters once someone points at or
    // presses the portrait, so it is built when the browser is idle.
    let mapHandle = 0;
    const buildMapIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        mapHandle = window.requestIdleCallback(buildMap, { timeout: 2500 });
      } else {
        mapHandle = window.setTimeout(buildMap, 600);
      }
    };
    if (img?.complete) buildMapIdle();
    else img?.addEventListener("load", buildMapIdle, { once: true });
    const isNear = (x: number, y: number) => {
      if (orbit) {
        const o = orbit.getBoundingClientRect();
        // the ring's radius is 45.5% of its box; "near" adds a margin outside it
        const reach = o.width * 0.455 * 1.14;
        if (Math.hypot(x - (o.left + o.width / 2), y - (o.top + o.height / 2)) <= reach)
          return true;
      }
      if (img && alpha) {
        const r = img.getBoundingClientRect();
        const u = (x - r.left) / r.width;
        const v = (y - r.top) / r.height;
        if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
          const ix = Math.min(mapW - 1, Math.floor(u * mapW));
          const iy = Math.min(mapH - 1, Math.floor(v * mapH));
          return alpha[iy * mapW + ix] > 40;
        }
      }
      return false;
    };

    let frame = 0;
    let nx = 0;
    let ny = 0;
    let near = false;
    let pokeTimer = 0;
    // The portrait is a little solid object: the smoothed pointer (cx, cy) tilts
    // it, hovering lifts it (cl), and pressing pushes it in (cp). Each eases
    // toward its target every frame, so it has weight and springs back.
    let cx = 0;
    let cy = 0;
    let cl = 0;
    let cp = 0;
    let pressTarget = 0;
    let cutoutSet = false;
    let lastPaint = 0;
    const clampUnit = (v: number) => Math.max(-1, Math.min(1, v));

    let px = 0;
    let py = 0;
    let moved = false;
    const paint = (now: number = performance.now()) => {
      frame = 0;
      // The rect reads happen here, once per frame, instead of on every
      // pointermove (mice report at up to 1000Hz).
      if (moved) {
        moved = false;
        const box = pf.getBoundingClientRect();
        nx = clampUnit((px - (box.left + box.width / 2)) / (box.width * 0.9));
        ny = clampUnit((py - (box.top + box.height / 2)) / (box.height * 0.9));
        setNear(isNear(px, py));
      }
      // Ease by elapsed time, not by frame count, so a 60, 120 or 144Hz screen
      // feels the same (same approach as CardFx on /links).
      const steps = lastPaint ? Math.min(now - lastPaint, 64) / (1000 / 60) : 1;
      lastPaint = now;
      const ease = (rate: number) => 1 - Math.pow(1 - rate, steps);
      cx += (nx - cx) * ease(0.14);
      cy += (ny - cy) * ease(0.14);
      cl += ((near ? 1 : 0) - cl) * ease(0.16);
      cp += (pressTarget - cp) * ease(0.24);
      const settled =
        Math.abs(nx - cx) < 0.002 &&
        Math.abs(ny - cy) < 0.002 &&
        Math.abs((near ? 1 : 0) - cl) < 0.004 &&
        Math.abs(pressTarget - cp) < 0.004;
      if (settled) {
        cx = nx;
        cy = ny;
        cl = near ? 1 : 0;
        cp = pressTarget;
        lastPaint = 0;
      }
      pf.style.setProperty("--pfx", cx.toFixed(3));
      pf.style.setProperty("--pfy", cy.toFixed(3));
      pf.style.setProperty("--lift", cl.toFixed(3));
      pf.style.setProperty("--press", cp.toFixed(3));
      if (!settled) schedule();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    // The sheen is masked to the person. The mask is drawn from the photo that
    // is already on screen into a small in-memory image, so it costs no
    // download (a CSS mask-image URL is fetched in CORS mode and cannot reuse
    // the <img>'s cached copy, so it used to fetch the photo a second time).
    // The sheen only shows once the mask exists (data-cutout).
    let cutoutUrl = "";
    let disposed = false;
    const makeCutout = () => {
      if (cutoutSet || !img || !img.complete || !img.naturalWidth) return;
      cutoutSet = true;
      const side = 512;
      const canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, side, side);
      canvas.toBlob((blob) => {
        if (!blob || disposed) return;
        cutoutUrl = URL.createObjectURL(blob);
        pf.style.setProperty("--cutout", `url("${cutoutUrl}")`);
        pf.setAttribute("data-cutout", "");
      }, "image/png");
    };

    const setNear = (value: boolean) => {
      if (value === near) return;
      near = value;
      if (value) makeCutout();
      pf.toggleAttribute("data-near", value);
      schedule();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      px = event.clientX;
      py = event.clientY;
      moved = true;
      schedule();
    };
    const onLeave = () => {
      moved = false;
      nx = 0;
      ny = 0;
      setNear(false);
      schedule();
    };
    const onPoke = (event: Event) => {
      // a press on the empty corners of the frame is not a press on the portrait;
      // a keyboard activation (no pointer position) always counts
      const click = event as MouseEvent;
      if (!alpha) buildMap(); // pressed before the idle build ran
      if (click.detail !== 0 && !isNear(click.clientX, click.clientY)) return;
      pf.removeAttribute("data-poke");
      void pf.offsetWidth; // restart the animation when poked twice in a row
      pf.setAttribute("data-poke", "");
      window.clearTimeout(pokeTimer);
      pokeTimer = window.setTimeout(() => pf.removeAttribute("data-poke"), 1200);
    };

    // Pressing the portrait pushes it in toward the press point, then it
    // springs back. Touch has no hover, so a finger tilts it only while down.
    const onPress = (event: Event) => {
      const down = event as PointerEvent;
      if (!alpha) buildMap();
      px = down.clientX;
      py = down.clientY;
      moved = true;
      pressTarget = isNear(px, py) ? 1 : 0;
      schedule();
    };
    const onRelease = (event: PointerEvent) => {
      pressTarget = 0;
      if (event.pointerType === "touch") {
        nx = 0;
        ny = 0;
        moved = false;
        setNear(false);
      }
      schedule();
    };

    const hit = pf.querySelector(".pf-hit");
    hit?.addEventListener("pointerdown", onPress);
    window.addEventListener("pointerup", onRelease);
    window.addEventListener("pointercancel", onRelease);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    hit?.addEventListener("click", onPoke);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      hit?.removeEventListener("click", onPoke);
      hit?.removeEventListener("pointerdown", onPress);
      disposed = true;
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
      pf.removeAttribute("data-cutout");
      pf.style.removeProperty("--cutout");
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      img?.removeEventListener("load", buildMapIdle);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(mapHandle);
      window.clearTimeout(mapHandle);
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(pokeTimer);
    };
  }, []);

  return (
    <section id="hero" className="hero-s" aria-labelledby="h-name" data-story="exit" ref={hostRef}>
      <HeroScrollDepth />
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

        <div
          className="pf"
          id="pf"
          ref={pfRef}
          data-rise
          style={{ "--d": "200ms" } as CSSProperties}
        >
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
              height={640}
              fetchPriority="high"
            />
          </picture>
          {/* The portrait is a real button: keyboard and touch users can
              play the click hunt too (mockup `#pf-hit`). The easter-egg
              layer listens on it; activating it does exactly what clicking
              the photo does. */}
          <button type="button" className="pf-hit" id="pf-hit" aria-label={dict.portraitAlt} />
          {/* The loop around the head, in the same hand as the note and the ticket's
              squiggle, and made to belong to the sky behind it: its highlighter is
              the sky's halftone dots in the sky's own palette. It draws itself on
              (marker, halftone highlight, pencil retrace, ticks, sparkles), wobbles
              between two takes the way hand-drawn animation does, and reacts to the
              pointer: layers shift by depth, pointing at the portrait draws a cobalt
              echo loop, and pressing it makes the ring jiggle and the sparkles pop
              again. */}
          <div className="pf-orbit" aria-hidden="true">
            <svg viewBox="0 0 200 200" focusable="false">
              <defs>
                <filter id="pf-rough" x="-8%" y="-8%" width="116%" height="116%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" />
                  <feDisplacementMap in="SourceGraphic" scale="1.7" />
                </filter>
                <pattern
                  id="pf-dots"
                  width="3.4"
                  height="3.4"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(30)"
                >
                  <circle className="o-dotfill" cx="1.7" cy="1.7" r="1.2" />
                </pattern>
              </defs>

              <g className="o-layer o-near">
                <g className="o-jig">
                  <g filter="url(#pf-rough)">
                    <path
                      className="o-echo"
                      pathLength={1}
                      d="M100 -3 C158 -4 206 44 205 102 C204 160 156 207 100 206 C42 207 -6 158 -5 100 C-4 44 44 -4 100 -3"
                    />
                    <g className="o-take o-a">
                      <path
                        className="o-hi"
                        pathLength={1}
                        d="M128 11 C172 20 197 62 191 105 C185 151 149 191 100 191 C52 191 11 155 9 104 C7 55 44 13 97 9 C122 7 144 13 160 27"
                      />
                      <path
                        className="o-loop"
                        pathLength={1}
                        d="M128 11 C172 20 197 62 191 105 C185 151 149 191 100 191 C52 191 11 155 9 104 C7 55 44 13 97 9 C122 7 144 13 160 27"
                      />
                      <path className="o-press" pathLength={1} d="M128 11 C172 20 197 62 191 105" />
                      <path
                        className="o-pencil"
                        pathLength={1}
                        d="M21 62 C15 102 29 148 69 177 C101 195 142 186 170 159"
                      />
                    </g>
                    <g className="o-take o-b">
                      <path
                        className="o-hi"
                        pathLength={1}
                        d="M126 12 C170 17 199 60 192 103 C187 153 146 193 100 190 C50 193 9 157 10 106 C6 58 46 11 99 11 C124 10 142 16 156 30"
                      />
                      <path
                        className="o-loop"
                        pathLength={1}
                        d="M126 12 C170 17 199 60 192 103 C187 153 146 193 100 190 C50 193 9 157 10 106 C6 58 46 11 99 11 C124 10 142 16 156 30"
                      />
                      <path className="o-press" pathLength={1} d="M126 12 C170 17 199 60 192 103" />
                      <path
                        className="o-pencil"
                        pathLength={1}
                        d="M20 65 C16 105 31 146 71 175 C102 193 140 188 168 162"
                      />
                    </g>
                    <circle className="o-blot" cx="128" cy="11" r="2.6" />
                    <g className="o-ticks">
                      <path pathLength={1} d="M30 16 L24 6" />
                      <path pathLength={1} d="M15 30 L5 26" />
                      <path pathLength={1} d="M45 8 L44 -3" />
                    </g>
                  </g>
                </g>
              </g>

              <g className="o-layer o-far">
                {/* two sparkles riding the ring's lower right. Each is a positioning
                    group, a wrapper the press animates, and the star itself centred
                    on the origin, so every CSS scale and rotation happens about its
                    own middle. */}
                <g transform="translate(197 148)">
                  <g className="o-sw o-sw-a">
                    <path
                      className="o-star o-star-a"
                      d="M0 -8 C1 -2.5 2.5 -1 8 0 C2.5 1 1 2.5 0 8 C-1 2.5 -2.5 1 -8 0 C-2.5 -1 -1 -2.5 0 -8 Z"
                    />
                  </g>
                </g>
                <g transform="translate(212 118) scale(0.55)">
                  <g className="o-sw o-sw-b">
                    <path
                      className="o-star o-star-b"
                      d="M0 -8 C1 -2.5 2.5 -1 8 0 C2.5 1 1 2.5 0 8 C-1 2.5 -2.5 1 -8 0 C-2.5 -1 -1 -2.5 0 -8 Z"
                    />
                  </g>
                </g>
              </g>
            </svg>
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
              <path d="M58 6 C40 3 20 10 9 28" />
              <path d="M2 21 L9 30 L18 25" />
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
