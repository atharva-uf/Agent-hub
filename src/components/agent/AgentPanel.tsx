import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, FileText, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Repo, RunStatus, TaskType } from "@/types";
import { TASK_LABEL } from "@/types";
import { useAgentRun } from "@/hooks/useAgentRun";
import { Timeline } from "./Timeline";
import { LogTerminal } from "./LogTerminal";
import { ResultSummary } from "./ResultSummary";
import { TaskModal } from "./TaskModal";
import { DetailsDrawer } from "./DetailsDrawer";
import { cn } from "@/lib/utils";

interface Props {
  repo: Repo;
}

export function AgentPanel({ repo }: Props) {
  const run = useAgentRun(repo.name);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prevStatusRef = useRef<RunStatus>(run.status);

  // Open modal from RepoHeader "Run Agent Task" button
  useEffect(() => {
    const open = () => setModalOpen(true);
    window.addEventListener("agent:open-task-modal", open);
    return () => window.removeEventListener("agent:open-task-modal", open);
  }, []);

  // Toast on run completion — only fires on running → success/failure transition
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = run.status;

    if (prev !== "running") return;

    if (run.status === "success") {
      toast.success("Task completed successfully", {
        description: run.task ? TASK_LABEL[run.task] : undefined,
      });
    } else if (run.status === "failure") {
      toast.error("Task failed", {
        description: run.task
          ? `${TASK_LABEL[run.task]} — review logs for details.`
          : "Review logs for details.",
      });
    }
  }, [run.status, run.task]);

  const handleRun = (task: TaskType, config: string) => {
    run.start(task, config);
    toast("Agent task started", {
      description: TASK_LABEL[task],
    });
  };

  const handleRetry = () => {
    if (!run.task) return;
    run.start(run.task);
    toast("Retrying task", {
      description: TASK_LABEL[run.task],
    });
  };

  const isIdle = run.status === "idle" || run.status === "pending";
  const isRunning = run.status === "running";

  return (
    <section className="rounded-2xl border border-border bg-[#070A14] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_24px_64px_-24px_rgba(0,0,0,0.85)] sm:p-6">
      {/* Header */}
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold tracking-tight">Agent Execution</h2>
            <StatusBadge status={run.status} />
          </div>
          <p className="mt-1 text-xs text-text-muted">
            {run.task
              ? `${TASK_LABEL[run.task]} · ${repo.owner}/${repo.name}`
              : "No task running. Trigger an agent task to begin."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            disabled={run.logs.length === 0}
            className="h-8 gap-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
            View details
          </Button>
          {!isIdle && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRunning}
              className="h-8 gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Retry
            </Button>
          )}
        </div>
      </header>

      {/* Timeline */}
      <div className="mb-5 rounded-xl border border-border bg-surface-1/40 p-4">
        <Timeline steps={run.steps} />
      </div>

      {/* Log terminal */}
      <LogTerminal lines={run.logs} />

      {/* Empty CTA — idle with no logs */}
      {isIdle && run.logs.length === 0 && (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-surface-1/20 px-6 py-8 text-center">
          <p className="text-sm font-medium text-foreground/70">No execution started</p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-cta inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={2.5} fill="currentColor" />
            Run Agent Task
          </button>
        </div>
      )}

      {/* Result summary */}
      {run.result && (run.status === "success" || run.status === "failure") && (
        <div className="mt-5">
          <ResultSummary status={run.status} result={run.result} />
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onRun={handleRun}
      />
      <DetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        logs={run.logs}
        task={run.task}
        status={run.status}
        steps={run.steps}
      />
    </section>
  );
}

function StatusBadge({ status }: { status: RunStatus }) {
  const map = {
    idle:    { label: "Idle",    cls: "border-border bg-surface-1 text-text-secondary",  dot: "bg-text-muted" },
    pending: { label: "Pending", cls: "border-border bg-surface-1 text-text-secondary",  dot: "bg-text-muted" },
    running: { label: "Running", cls: "border-running/40 bg-running/10 text-running",    dot: "bg-running animate-pulse" },
    success: { label: "Success", cls: "border-success/40 bg-success/10 text-success",    dot: "bg-success" },
    failure: { label: "Failure", cls: "border-error/40 bg-error/10 text-error",          dot: "bg-error" },
  } as const;
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium", m.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
