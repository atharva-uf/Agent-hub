import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogTerminal } from "./LogTerminal";
import type { LogLine, LogLevel, RunStatus, StepName, StepState, TaskType } from "@/types";
import { STEPS, TASK_LABEL } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, Clock, Server } from "lucide-react";

const LEVEL_COLOR: Record<LogLevel, string> = {
  INFO:    "bg-blue-500/10 text-blue-400",
  CMD:     "bg-violet-500/10 text-violet-400",
  SUCCESS: "bg-emerald-500/10 text-emerald-400",
  WARN:    "bg-amber-500/10 text-amber-400",
  ERROR:   "bg-red-500/10 text-red-400",
};

function buildCounts(logs: LogLine[]): Partial<Record<LogLevel, number>> {
  const counts: Partial<Record<LogLevel, number>> = {};
  for (const l of logs) counts[l.level] = (counts[l.level] ?? 0) + 1;
  return counts;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  logs: LogLine[];
  task: TaskType | null;
  status: RunStatus;
  steps: Record<StepName, { state: StepState; durationMs?: number }>;
}

function fmt(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const STATE_CONFIG: Record<StepState, { label: string; cls: string; icon: React.ReactNode }> = {
  success: {
    label: "Success",
    cls: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" strokeWidth={2} />,
  },
  error: {
    label: "Failed",
    cls: "bg-error/10 text-error border-error/25",
    icon: <XCircle className="h-3 w-3" strokeWidth={2} />,
  },
  active: {
    label: "Running",
    cls: "bg-running/10 text-running border-running/25",
    icon: <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />,
  },
  pending: {
    label: "Pending",
    cls: "bg-border/20 text-text-muted border-border/30",
    icon: <Clock className="h-3 w-3" strokeWidth={2} />,
  },
};

const STATUS_LABEL: Record<RunStatus, string> = {
  idle: "Idle",
  pending: "Pending",
  running: "Running",
  success: "Success",
  failure: "Failure",
};

export function DetailsDrawer({ open, onOpenChange, logs, task, status, steps }: Props) {
  const completedSteps = STEPS.filter((n) => steps[n].state === "success").length;
  const totalMs = Object.values(steps).reduce((acc, s) => acc + (s.durationMs ?? 0), 0);
  const levelCounts = buildCounts(logs);
  const hasLogs = logs.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-background p-0 sm:max-w-[520px]"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-sm font-semibold">Execution details</SheetTitle>
          <SheetDescription className="text-xs text-text-muted">
            {task ? TASK_LABEL[task] : "No task"} &middot; Status:{" "}
            <span className="capitalize text-foreground/70">{STATUS_LABEL[status]}</span>
            {" "}&middot; {logs.length} log lines &middot; {completedSteps}/{STEPS.length} steps
          </SheetDescription>
        </SheetHeader>

        {/* Log level counts */}
        {hasLogs && (
          <div className="flex flex-wrap gap-1.5 border-b border-border px-5 py-3">
            {(Object.keys(LEVEL_COLOR) as LogLevel[]).map((level) => {
              const count = levelCounts[level];
              if (!count) return null;
              return (
                <span
                  key={level}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                    LEVEL_COLOR[level],
                  )}
                >
                  {level} <span className="font-mono">{count}</span>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 scrollbar-thin">
          {/* Environment */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.75} />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Environment
              </span>
            </div>
            <div className="rounded-lg border border-border bg-[#07090f] px-4 py-3 font-mono text-[12px] leading-6 text-text-secondary">
              <EnvRow k="node" v="v20.11.1" />
              <EnvRow k="bun" v="1.1.8" />
              <EnvRow k="region" v="us-east-1" />
              <EnvRow k="runner" v="agent-pool-2" />
              {totalMs > 0 && <EnvRow k="total_time" v={fmt(totalMs)} />}
            </div>
          </section>

          {/* Step Breakdown */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Step Breakdown
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              {STEPS.map((name, i) => {
                const s = steps[name];
                const cfg = STATE_CONFIG[s.state];
                const last = i === STEPS.length - 1;
                return (
                  <div
                    key={name}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-3",
                      !last && "border-b border-border",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-[11px] font-mono text-text-muted">
                        {i + 1}
                      </span>
                      <span
                        className={cn(
                          "text-[13px] font-medium",
                          s.state === "pending" && "text-text-muted",
                          s.state === "active" && "text-running",
                          s.state === "success" && "text-foreground",
                          s.state === "error" && "text-error",
                        )}
                      >
                        {name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-text-muted">{fmt(s.durationMs)}</span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                          cfg.cls,
                        )}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Log Output */}
          <section>
            <div className="mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Log Output
              </span>
            </div>
            <LogTerminal lines={logs} scrollTrigger={open} />
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EnvRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <span className="min-w-[80px] text-text-muted">{k}</span>
      <span className="text-foreground/80">{v}</span>
    </div>
  );
}
