import { Check, X, Loader2 } from "lucide-react";
import { STEPS, type StepName, type StepState } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  steps: Record<StepName, { state: StepState; durationMs?: number }>;
}

function fmt(ms?: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function Timeline({ steps }: Props) {
  return (
    <div className="flex w-full items-center gap-0 overflow-x-auto px-1 py-1">
      {STEPS.map((name, i) => {
        const s = steps[name];
        const last = i === STEPS.length - 1;
        return (
          <div key={name} className="flex flex-1 items-center">
            {/* Step: dot + label */}
            <div className="flex shrink-0 items-center gap-2.5">
              <StepDot state={s.state} />
              <div>
                <div
                  className={cn(
                    "text-[12px] font-medium leading-tight",
                    s.state === "pending" && "text-text-muted",
                    s.state === "active"  && "text-running",
                    s.state === "success" && "text-foreground",
                    s.state === "error"   && "text-error",
                  )}
                >
                  {name}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-text-muted">
                  {fmt(s.durationMs)}
                </div>
              </div>
            </div>

            {/* Connector — grows between steps, aligned by items-center on parent */}
            {!last && (
              <div
                className={cn(
                  "mx-3 h-px min-w-[16px] flex-1 hidden sm:block",
                  s.state === "success" ? "bg-success/35" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepDot({ state }: { state: StepState }) {
  const base = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full";

  if (state === "success") {
    return (
      <div className={cn(base, "bg-success/15 ring-2 ring-success/50")}>
        <Check className="h-4 w-4 text-success" strokeWidth={2.5} />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className={cn(base, "bg-error/15 ring-2 ring-error/50")}>
        <X className="h-4 w-4 text-error" strokeWidth={2.5} />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className={cn(base, "pulse-running bg-running/15 ring-2 ring-running/50")}>
        <Loader2 className="h-4 w-4 animate-spin text-running" strokeWidth={2} />
      </div>
    );
  }
  // pending
  return (
    <div className={cn(base, "bg-surface-1 ring-1 ring-border")}>
      <div className="h-2 w-2 rounded-full bg-border" />
    </div>
  );
}
