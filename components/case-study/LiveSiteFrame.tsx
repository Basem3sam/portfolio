"use client";

import { useEffect, useRef, useState } from "react";
import { preconnect } from "react-dom";
import Icon from "@/components/ui/Icon";

type LiveSiteFrameProps = {
  /** Full URL of the site to embed. */
  url: string;
  /** Address shown in the frame's bar, e.g. "trosc.vercel.app". */
  host: string;
  dict: {
    loadLabel: string;
    openLabel: string;
    loadingLabel: string;
    slowNote: string;
    frameTitle: string;
    hint: string;
  };
};

const SLOW_AFTER_MS = 10_000;

/**
 * The companion frontend as a browser window you can actually use.
 *
 * Performance: nothing from the live site is requested until the visitor asks
 * for it. Until then the frame shows a lazy screenshot; pressing "Load live
 * site" mounts the iframe, and hovering or focusing that button warms the
 * connection first. The address bar always carries an "open in new tab" link,
 * which is also the way out if the site refuses to be framed.
 */
export default function LiveSiteFrame({ url, host, dict }: LiveSiteFrameProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "live">("idle");
  const [shot, setShot] = useState<"loading" | "ready" | "failed">("loading");
  const [slow, setSlow] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const warmed = useRef(false);

  const preview = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=800`;

  // The screenshot can finish before hydration attaches onLoad.
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0) setShot("ready");
  }, []);

  // Pressing the button removes it, so hand keyboard focus to the frame.
  useEffect(() => {
    if (phase === "loading") frame.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    try {
      preconnect(new URL(url).origin);
    } catch {
      /* not a valid URL: nothing to warm */
    }
  };

  return (
    <div className="live" data-phase={phase}>
      <div className="live-bar">
        <span className="live-dots" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
        <span className="addr" dir="ltr">
          {host}
        </span>
        <a
          className="live-open"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${dict.openLabel}: ${host}`}
        >
          <Icon name="externalLink" className="size-4" />
          <span>{dict.openLabel}</span>
        </a>
      </div>

      <div className="live-stage">
        {phase !== "live" && shot !== "failed" ? (
          <img
            ref={image}
            className="live-shot"
            data-ready={shot === "ready" ? "" : undefined}
            src={preview}
            alt=""
            width={1280}
            height={800}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            referrerPolicy="no-referrer"
            onLoad={() => setShot("ready")}
            onError={() => setShot("failed")}
          />
        ) : null}

        {phase !== "idle" ? (
          <iframe
            ref={frame}
            className="live-iframe"
            src={url}
            title={dict.frameTitle}
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onLoad={() => setPhase("live")}
          />
        ) : null}

        {phase === "idle" ? (
          <button
            type="button"
            className="live-start"
            onClick={() => setPhase("loading")}
            onPointerEnter={warm}
            onFocus={warm}
          >
            <span className="btn btn-primary">
              <Icon name="play" className="size-4" />
              {dict.loadLabel}
            </span>
            <span className="live-hint">{dict.hint}</span>
          </button>
        ) : null}

        {phase === "loading" ? (
          <div className="live-status" role="status">
            <span className="live-spin" aria-hidden="true"></span>
            <span>{dict.loadingLabel}</span>
            {slow ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {dict.slowNote}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
