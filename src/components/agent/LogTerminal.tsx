import { useEffect, useRef } from "react";
import type { LogLine } from "@/types";
import { cn } from "@/lib/utils";

const levelClass: Record<LogLine["level"], string> = {
  INFO: "text-text-secondary",
  CMD: "text-primary",
  SUCCESS: "text-success",
  WARN: "text-warning",
  ERROR: "text-error",
};

interface Props {
  lines: LogLine[];
  empty?: React.ReactNode;
  scrollTrigger?: unknown;
}

export function LogTerminal({ lines, empty, scrollTrigger }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines, scrollTrigger]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-2">
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </div>
        <span className="font-mono text-[11px] text-text-muted">agent.log</span>
        <span className="font-mono text-[11px] text-text-muted">
          {lines.length > 0 ? `${lines.length} lines` : ""}
        </span>
      </div>

      <div
        ref={ref}
        className="scrollbar-thin h-[320px] overflow-y-auto px-4 py-3 font-mono text-[12px] leading-[1.6]"
      >
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            {empty ?? (
              <span className="font-mono text-[12px] text-text-muted">
                Logs will stream here once a task starts.
              </span>
            )}
          </div>
        ) : (
          lines.map((l) => (
            <div key={l.id} className="log-line flex gap-3">
              <span className="shrink-0 select-none text-text-muted">{l.time}</span>
              <span className={cn("w-[60px] shrink-0 font-semibold", levelClass[l.level])}>
                [{l.level}]
              </span>
              <span className="break-all text-foreground/85">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
