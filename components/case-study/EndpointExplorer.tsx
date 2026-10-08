"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { EXPLORER_ENDPOINTS, type EndpointId, type ExplorerEndpoint, type HttpMethod } from "@/data/trosc";
import type { TroscDictionary } from "@/lib/dictionaries/trosc";
import { prefersReducedMotion } from "@/lib/scroll";

type EndpointExplorerProps = {
  dict: TroscDictionary["sections"]["explorer"];
};

const methodClass: Record<HttpMethod, string> = {
  GET: "bg-[#15803d] text-white dark:bg-[#4ade80] dark:text-[#0f1215]",
  POST: "bg-[#a04a07] text-white dark:bg-[#fbbf24] dark:text-[#0f1215]",
  PUT: "bg-[#a04a07] text-white dark:bg-[#fbbf24] dark:text-[#0f1215]",
  PATCH: "bg-[#a04a07] text-white dark:bg-[#fbbf24] dark:text-[#0f1215]",
  DELETE: "bg-[#b3261e] text-white dark:bg-[#f87171] dark:text-[#0f1215]",
};

const jsonClass = {
  punc: "text-muted-text",
  key: "font-medium text-dark-text",
  str: "text-status",
  num: "text-secondary",
};

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={`inline-flex min-w-14 justify-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${methodClass[method]}`}
    >
      {method}
    </span>
  );
}

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

type RunState = { status: "idle" | "running" | "done"; ms: number };

export default function EndpointExplorer({ dict }: EndpointExplorerProps) {
  const [selectedId, setSelectedId] = useState(EXPLORER_ENDPOINTS[0].id);
  const [runState, setRunState] = useState<RunState>({ status: "idle", ms: 0 });
  const timer = useRef<number | undefined>(undefined);

  const selected: ExplorerEndpoint =
    EXPLORER_ENDPOINTS.find((endpoint) => endpoint.id === selectedId) ??
    EXPLORER_ENDPOINTS[0];

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const run = () => {
    window.clearTimeout(timer.current);
    const [min, max] = selected.latency;
    const ms = min + Math.floor(Math.random() * (max - min + 1));

    if (prefersReducedMotion()) {
      setRunState({ status: "done", ms });
      return;
    }

    setRunState({ status: "running", ms: 0 });
    timer.current = window.setTimeout(
      () => setRunState({ status: "done", ms }),
      Math.min(ms + 200, 800),
    );
  };

  const select = (id: EndpointId) => {
    if (id === selectedId) return;
    window.clearTimeout(timer.current);
    setRunState({ status: "idle", ms: 0 });
    setSelectedId(id);
  };

  const rowClass = (active: boolean) =>
    `flex w-full min-h-11 cursor-pointer items-center gap-2.5 border-b border-hairline px-3 text-start transition-colors duration-100 last:border-b-0 ${
      active
        ? "bg-light-bg text-dark-text shadow-[inset_2px_0_0_0_var(--c-signal)]"
        : "text-light-text hover:bg-light-bg hover:text-dark-text"
    }`;

  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <div className="grid lg:grid-cols-[300px_1fr]">
        <div className="max-h-[420px] overflow-y-auto border-b border-hairline lg:border-b-0 lg:border-e lg:border-hairline">
          {EXPLORER_ENDPOINTS.map((endpoint) => {
            const active = endpoint.id === selectedId;
            return (
              <button
                key={endpoint.id}
                type="button"
                aria-pressed={active}
                onClick={() => select(endpoint.id)}
                className={rowClass(active)}
              >
                <MethodBadge method={endpoint.method} />
                <span
                  dir="ltr"
                  className={`min-w-0 flex-1 font-mono text-xs break-all ${
                    active ? "font-medium text-dark-text" : "text-light-text"
                  }`}
                >
                  {endpoint.path}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <MethodBadge method={selected.method} />
            <code
              dir="ltr"
              className="min-w-0 flex-1 font-mono text-sm font-medium break-all text-dark-text"
            >
              {selected.path}
            </code>
            <span className="rounded-full border border-hairline px-2.5 py-1 text-[11px] font-medium text-light-text">
              {dict.access[selected.access]}
            </span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-light-text">
            {dict.endpoints[selected.id]}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={run}
              disabled={runState.status === "running"}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-on-secondary transition-colors duration-200 hover:bg-[#8a3f06] disabled:cursor-not-allowed disabled:opacity-70 dark:hover:bg-[#fcd34d]"
            >
              <Icon name="code" className="size-4" />
              {dict.run}
            </button>
            <span role="status" dir="ltr" className="font-mono text-xs">
              {runState.status === "running" && (
                <span className="animate-pulse text-light-text motion-reduce:animate-none">
                  ··· {dict.running}
                </span>
              )}
              {runState.status === "done" && (
                <span className="font-semibold text-status">
                  {selected.status} {dict.ok} · {runState.ms}ms
                </span>
              )}
            </span>
          </div>

          {runState.status === "done" && (
            <p className="mt-2 font-mono text-[11px] text-muted-text" dir="ltr">
              X-RateLimit-Limit: {selected.rateLimit} · X-RateLimit-Remaining:{" "}
              {selected.rateLimit - (runState.ms % 24)}
            </p>
          )}

          <pre
            dir="ltr"
            className="mt-4 overflow-x-auto rounded-md border border-hairline bg-light-bg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-dark-text"
          >
            {renderJson(selected.response, 0)}
          </pre>
        </div>
      </div>
    </div>
  );
}