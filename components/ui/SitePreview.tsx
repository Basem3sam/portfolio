"use client";

import { useEffect, useRef, useState } from "react";
import "./SitePreview.css";

type SitePreviewProps = {
  url: string;
  /** Accessible prefix for the link, e.g. "View live site". */
  label: string;
};

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/**
 * A live site as a small browser window: its own address bar over a fresh
 * screenshot. The whole frame is the link. If the capture cannot load the
 * frame keeps its address bar and shows the host instead of an empty box.
 */
export default function SitePreview({ url, label }: SitePreviewProps) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const image = useRef<HTMLImageElement>(null);
  const host = hostOf(url);
  const shot = `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=960&h=600`;

  // The image can finish before hydration attaches onLoad.
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0) setState("ready");
  }, []);

  return (
    <a
      className="sp"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}: ${host}`}
      data-state={state}
    >
      <span className="sp-bar" aria-hidden="true">
        <i></i>
        <i></i>
        <i></i>
        <span className="sp-host" dir="ltr">
          {host}
        </span>
      </span>
      <span className="sp-frame" aria-hidden="true">
        {state !== "failed" ? (
          <img
            ref={image}
            src={shot}
            alt=""
            width={960}
            height={600}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setState("ready")}
            onError={() => setState("failed")}
          />
        ) : (
          <span className="sp-fail" dir="ltr">
            {host}
          </span>
        )}
      </span>
    </a>
  );
}
