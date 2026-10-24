"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Icon from "@/components/ui/Icon";
import { EXPLORER_CASE_SLICE, type EndpointAccess, type ExplorerEndpoint } from "@/data/trosc";
import type { TroscDictionary } from "@/lib/dictionaries/trosc";

type EndpointExplorerProps = {
  dict: TroscDictionary["sections"]["explorer"];
};

/**
 * The endpoints the case study shows — the reference's curated slice of the
 * 100+ mounted endpoints, grouped by who may call them. Responses are
 * simulated on this page: no request is sent, and the latency is drawn from
 * the range the endpoint documents.
 */
const ENDPOINTS = EXPLORER_CASE_SLICE;
const ACCESS_GROUPS: EndpointAccess[] = ["public", "protected", "admin"];

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  429: "Too Many Requests",
};

/** Size of the JSON body as it would travel over the wire. */
function payloadBytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/**
 * A route with a soft break point after every "/", so a long path wraps
 * between segments on a narrow screen instead of snapping mid-word.
 */
function breakable(path: string): ReactNode {
  const parts = path.split("/");
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <>
          /<wbr />
        </>
      )}
    </Fragment>
  ));
}

type RunState =
  | { phase: "idle" }
  | { phase: "running" }
  | { phase: "done"; ms: number };

/** Syntax colours are scoped to the code pane (see CaseStudy.css). */
const jsonClass = {
  punc: undefined,
  key: "k",
  str: "s",
  num: "n",
} as const;

function renderJson(value: unknown, indent: number): ReactNode {
  const pad = "  ".repeat(indent);
  const padInner = "  ".repeat(indent + 1);

  if (value === null) return <span className={jsonClass.punc}>null</span>;
  if (typeof value === "boolean") {
    return <span className={jsonClass.punc}>{String(value)}</span>;
  }
  if (typeof value === "number") return <span className={jsonClass.num}>{value}</span>;
  if (typeof value === "string") {
    return <span className={jsonClass.str}>&quot;{value}&quot;</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={jsonClass.punc}>[]</span>;
    return (
      <span>
        <span className={jsonClass.punc}>[</span>
        {"\n"}
        {value.map((item, index) => (
          <span key={index}>
            {padInner}
            {renderJson(item, indent + 1)}
            {index < value.length - 1 && <span className={jsonClass.punc}>,</span>}
            {"\n"}
          </span>
        ))}
        {pad}
        <span className={jsonClass.punc}>]</span>
      </span>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return <span className={jsonClass.punc}>{"{}"}</span>;
  return (
    <span>
      <span className={jsonClass.punc}>{"{"}</span>
      {"\n"}
      {entries.map(([key, val], index) => (
        <span key={key}>
          {padInner}
          <span className={jsonClass.key}>&quot;{key}&quot;</span>
          <span className={jsonClass.punc}>: </span>
          {renderJson(val, indent + 1)}
          {index < entries.length - 1 && <span className={jsonClass.punc}>,</span>}
          {"\n"}
        </span>
      ))}
      {pad}
      <span className={jsonClass.punc}>{"}"}</span>
    </span>
  );
}

export default function EndpointExplorer({ dict }: EndpointExplorerProps) {
  const [selectedId, setSelectedId] = useState<ExplorerEndpoint["id"]>(ENDPOINTS[0].id);
  // `idle` is what the server sent and what a reader sees with JavaScript off;
  // the first endpoint is simulated right after mount, like the reference.
  const [run, setRun] = useState<RunState>({ phase: "idle" });
  const timer = useRef<number | undefined>(undefined);

  const selected = ENDPOINTS.find((endpoint) => endpoint.id === selectedId) ?? ENDPOINTS[0];

  const simulate = useCallback((endpoint: ExplorerEndpoint) => {
    window.clearTimeout(timer.current);
    const [min, max] = endpoint.latency;
    const ms = min + Math.floor(Math.random() * (max - min + 1));
    setRun({ phase: "running" });
    // A short beat so a run is visibly a run; the number shown is the drawn
    // latency, not this delay.
    timer.current = window.setTimeout(
      () => setRun({ phase: "done", ms }),
      Math.min(520, Math.max(160, Math.round(ms * 0.9))),
    );
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => simulate(ENDPOINTS[0]));
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer.current);
    };
  }, [simulate]);

  const pick = (id: ExplorerEndpoint["id"]) => {
    const endpoint = ENDPOINTS.find((item) => item.id === id);
    if (!endpoint) return;
    setSelectedId(id);
    simulate(endpoint);
  };

  const [min, max] = selected.latency;
  const done = run.phase === "done";
  const ms = done ? run.ms : null;
  // Where this run landed inside the endpoint's own documented range.
  const spot = ms === null ? 0 : Math.min(1, Math.max(0, (ms - min) / Math.max(1, max - min)));
  const tier = spot < 0.34 ? "fast" : spot < 0.67 ? "mid" : "slow";
  const statusText = STATUS_TEXT[selected.status] ?? "";

  return (
    <div className="explorer">
      {/* Small screens: one compact dropdown replaces the full list, so the
          explorer reads pick -> run -> response instead of scrolling past
          14 rows first. The list below is hidden there (and this is hidden
          on desktop), so only one of the two is ever in the page. */}
      <div className="ex-pick">
        <select
          aria-label={dict.title}
          value={selectedId}
          onChange={(event) => pick(event.target.value as ExplorerEndpoint["id"])}
        >
          {ACCESS_GROUPS.map((access) => {
            const items = ENDPOINTS.filter((endpoint) => endpoint.access === access);
            if (items.length === 0) return null;
            return (
              <optgroup key={access} label={dict.groups[access]}>
                {items.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.method} {endpoint.path}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      <div className="ex-list">
        {ACCESS_GROUPS.map((access) => {
          const items = ENDPOINTS.filter((endpoint) => endpoint.access === access);
          if (items.length === 0) return null;
          return (
            <div key={access} className="ex-group" data-access={access}>
              <p className="ex-grp">
                <span>{dict.groups[access]}</span>
                <b>{items.length}</b>
              </p>
              {items.map((endpoint) => (
                <button
                  key={endpoint.id}
                  type="button"
                  aria-pressed={endpoint.id === selectedId}
                  onClick={() => pick(endpoint.id)}
                >
                  <span className="verb" data-m={endpoint.method}>
                    {endpoint.method}
                  </span>
                  <span className="ex-path">{breakable(endpoint.path)}</span>
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div className="ex-main">
        <div className="ex-bar">
          <span className="code">
            <span className="verb" data-m={selected.method}>
              {selected.method}
            </span>
            <span className="ex-url">{breakable(selected.path)}</span>
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => simulate(selected)}
            disabled={run.phase === "running"}
          >
            <Icon name="play" className="size-4" />
            {dict.run}
          </button>
        </div>

        <div className="ex-meta">
          <span className="ex-chip" data-access={selected.access}>
            {dict.groups[selected.access]}
          </span>
          <span className="ex-chip">
            {dict.limit}: <b dir="ltr">{selected.rateLimit}</b> {dict.limitUnit}
          </span>
        </div>

        {/* The response strip: status, time and size, big enough to read at a glance. */}
        <div
          className="ex-stats"
          role="status"
          aria-live="polite"
          data-state={run.phase}
          data-tier={done ? tier : undefined}
        >
          <div className="ex-stat">
            <span className="ex-k">{dict.status}</span>
            <strong className="ex-pill" dir="ltr">
              <i aria-hidden="true" />
              {done ? (
                <>
                  {selected.status} <small>{statusText}</small>
                </>
              ) : run.phase === "running" ? (
                dict.running
              ) : (
                "—"
              )}
            </strong>
          </div>

          <div className="ex-stat ex-time">
            <span className="ex-k">{dict.time}</span>
            <strong dir="ltr">
              <span className="ex-ms">{ms ?? "—"}</span>
              {ms !== null && <span className="ex-unit"> ms</span>}
            </strong>
            <span className="ex-meter" aria-hidden="true">
              <i style={{ "--spot": spot } as CSSProperties} />
            </span>
            <small dir="ltr">
              {min}–{max} ms {dict.typical}
            </small>
          </div>

          <div className="ex-stat">
            <span className="ex-k">{dict.size}</span>
            <strong dir="ltr">
              <span className="ex-ms">{done ? payloadBytes(selected.response) : "—"}</span>
              {done && <span className="ex-unit"> B</span>}
            </strong>
          </div>
        </div>

        <div className="code-pane" data-state={run.phase}>
          <pre>{done ? renderJson(selected.response, 0) : ""}</pre>
        </div>

        <div className="ex-res">{done ? dict.note : dict.idle}</div>
      </div>
    </div>
  );
}
