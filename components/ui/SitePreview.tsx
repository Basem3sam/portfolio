"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
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
 * A live site as a framed screenshot with its address above it. The whole
 * frame is the link.
 *
 * The frame reserves its final size from the first paint (a fixed aspect
 * ratio), so the screenshot arriving, or failing, never moves anything around
 * it. While it loads the frame shows the host on a quiet tint; if the capture
 * cannot load, that is simply what stays.
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
        <span className="sp-host" dir="ltr">
          {host}
        </span>
        <span className="sp-open">
          <Icon name="externalLink" className="size-3.5" />
        </span>
      </span>
      <span className="sp-frame" aria-hidden="true">
        <span className="sp-ph" dir="ltr">
          {host}
        </span>
        {state !== "failed" && (
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
        )}
      </span>
    </a>
  );
}
