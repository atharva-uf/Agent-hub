import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  Clock,
  GitBranch,
  Search,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_LABEL, type TaskType } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agent-runs")({
  head: () => ({
    meta: [
      { title: "Agent Runs — Agentic Developer Portal" },
      { name: "description", content: "History of all agent task executions across repositories." },
    ],
  }),
  component: AgentRunsPage,
});

interface AgentRun {
  id: string;
  repoId: string;
  repoName: string;
  task: TaskType;
  status: "success" | "failure";
  triggeredBy: string;
  startedAt: string;
  durationMs: number;
}

function iso(daysAgo: number, hoursAgo = 0, minsAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minsAgo);
  return d.toISOString();
}

const MOCK_RUNS: AgentRun[] = [
  { id: "r001", repoId: "edge-runtime",    repoName: "edge-runtime",    task: "tests",   status: "success", triggeredBy: "lena.k",  startedAt: iso(0, 0, 18), durationMs: 52400 },
  { id: "r002", repoId: "checkout-web",    repoName: "checkout-web",    task: "deps",    status: "failure", triggeredBy: "sara.w",  startedAt: iso(0, 1, 5),  durationMs: 31200 },
  { id: "r003", repoId: "design-system",   repoName: "design-system",   task: "refactor",status: "success", triggeredBy: "sara.w",  startedAt: iso(0, 2),     durationMs: 44100 },
  { id: "r004", repoId: "mobile-app",      repoName: "mobile-app",      task: "tests",   status: "success", triggeredBy: "marc.t",  startedAt: iso(0, 3, 30), durationMs: 61800 },
  { id: "r005", repoId: "auth-gateway",    repoName: "auth-gateway",    task: "deps",    status: "success", triggeredBy: "lena.k",  startedAt: iso(0, 5),     durationMs: 28900 },
  { id: "r006", repoId: "ml-inference",    repoName: "ml-inference",    task: "tests",   status: "failure", triggeredBy: "ravi.p",  startedAt: iso(0, 7),     durationMs: 39500 },
  { id: "r007", repoId: "billing-service", repoName: "billing-service", task: "pr",      status: "success", triggeredBy: "marc.t",  startedAt: iso(0, 9),     durationMs: 22100 },
  { id: "r008", repoId: "search-core",     repoName: "search-core",     task: "refactor",status: "success", triggeredBy: "ravi.p",  startedAt: iso(1, 0, 45), durationMs: 55300 },
  { id: "r009", repoId: "ingest-pipeline", repoName: "ingest-pipeline", task: "tests",   status: "success", triggeredBy: "noah.d",  startedAt: iso(1, 2),     durationMs: 48700 },
  { id: "r010", repoId: "docs-portal",     repoName: "docs-portal",     task: "deps",    status: "success", triggeredBy: "maya.r",  startedAt: iso(1, 4),     durationMs: 19400 },
  { id: "r011", repoId: "checkout-web",    repoName: "checkout-web",    task: "tests",   status: "failure", triggeredBy: "lena.k",  startedAt: iso(1, 6),     durationMs: 35600 },
  { id: "r012", repoId: "edge-runtime",    repoName: "edge-runtime",    task: "refactor",status: "success", triggeredBy: "noah.d",  startedAt: iso(1, 10),    durationMs: 41200 },
  { id: "r013", repoId: "data-warehouse",  repoName: "data-warehouse",  task: "deps",    status: "success", triggeredBy: "noah.d",  startedAt: iso(2, 1),     durationMs: 26800 },
  { id: "r014", repoId: "infra-iac",       repoName: "infra-iac",       task: "tests",   status: "success", triggeredBy: "marc.t",  startedAt: iso(2, 3),     durationMs: 17300 },
  { id: "r015", repoId: "ml-inference",    repoName: "ml-inference",    task: "pr",      status: "failure", triggeredBy: "ravi.p",  startedAt: iso(2, 6),     durationMs: 43900 },
  { id: "r016", repoId: "mobile-app",      repoName: "mobile-app",      task: "deps",    status: "success", triggeredBy: "sara.w",  startedAt: iso(3, 0),     durationMs: 31500 },
  { id: "r017", repoId: "auth-gateway",    repoName: "auth-gateway",    task: "tests",   status: "success", triggeredBy: "lena.k",  startedAt: iso(3, 4),     durationMs: 57200 },
  { id: "r018", repoId: "billing-service", repoName: "billing-service", task: "refactor",status: "failure", triggeredBy: "marc.t",  startedAt: iso(4, 2),     durationMs: 48100 },
  { id: "r019", repoId: "design-system",   repoName: "design-system",   task: "tests",   status: "success", triggeredBy: "sara.w",  startedAt: iso(5, 1),     durationMs: 33700 },
  { id: "r020", repoId: "search-core",     repoName: "search-core",     task: "pr",      status: "success", triggeredBy: "ravi.p",  startedAt: iso(6, 3),     durationMs: 20600 },
];

function fmtDuration(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const TASK_OPTIONS = Object.keys(TASK_LABEL) as TaskType[];

function AgentRunsPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [taskFilter, setTaskFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return MOCK_RUNS.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (taskFilter !== "all" && r.task !== taskFilter) return false;
      if (!ql) return true;
      return (
        r.repoName.toLowerCase().includes(ql) ||
        r.triggeredBy.toLowerCase().includes(ql)
      );
    });
  }, [q, statusFilter, taskFilter]);

  const successCount = MOCK_RUNS.filter((r) => r.status === "success").length;
  const failureCount = MOCK_RUNS.length - successCount;
  const successRate = Math.round((successCount / MOCK_RUNS.length) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Agent Runs</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Execution history across all repositories.
        </p>
      </div>

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total runs" value={String(MOCK_RUNS.length)} />
        <StatCard label="Success rate" value={`${successRate}%`} tone="success" />
        <StatCard label="Successful" value={String(successCount)} tone="success" />
        <StatCard label="Failed" value={String(failureCount)} tone="error" />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
            strokeWidth={1.75}
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by repo or user..."
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
          <Select value={taskFilter} onValueChange={setTaskFilter}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="Task type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tasks</SelectItem>
              {TASK_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{TASK_LABEL[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface-1/30">
        {/* Table header */}
        <div className="hidden grid-cols-12 gap-3 border-b border-border px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest text-text-muted sm:grid">
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Repository</div>
          <div className="col-span-2">Task</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Triggered by</div>
          <div className="col-span-2">Started</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-14 text-center text-sm text-text-muted">
            No runs match your filters.
          </div>
        ) : (
          filtered.map((run) => <RunRow key={run.id} run={run} />)
        )}
      </div>
    </div>
  );
}

function RunRow({ run }: { run: AgentRun }) {
  return (
    <Link
      to="/repos/$repoId"
      params={{ repoId: run.repoId }}
      className="group grid grid-cols-12 items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-1/50"
    >
      {/* Status icon */}
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
        {run.status === "success" ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-error" strokeWidth={1.75} />
        )}
        <span
          className={cn(
            "text-[11px] font-medium capitalize sm:hidden",
            run.status === "success" ? "text-success" : "text-error",
          )}
        >
          {run.status}
        </span>
      </div>

      {/* Repo */}
      <div className="col-span-10 min-w-0 sm:col-span-3">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.75} />
          <span className="truncate text-sm font-medium text-foreground">{run.repoName}</span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-text-muted">{run.id}</div>
      </div>

      {/* Task */}
      <div className="hidden sm:col-span-2 sm:block">
        <span className="inline-flex items-center rounded-md border border-border bg-background/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
          {TASK_LABEL[run.task]}
        </span>
      </div>

      {/* Duration */}
      <div className="hidden items-center gap-1 text-xs text-text-secondary sm:col-span-2 sm:flex">
        <Clock className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.75} />
        {fmtDuration(run.durationMs)}
      </div>

      {/* Triggered by */}
      <div className="hidden truncate text-xs text-text-secondary sm:col-span-2 sm:block">
        {run.triggeredBy}
      </div>

      {/* Started */}
      <div className="hidden items-center justify-between sm:col-span-2 sm:flex">
        <span className="text-xs text-text-muted">{fmtTime(run.startedAt)}</span>
        <ArrowRight
          className="h-3.5 w-3.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "success" | "error" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4">
      <div className="text-[10px] font-medium uppercase tracking-widest text-text-muted">{label}</div>
      <div
        className={cn(
          "mt-1.5 text-2xl font-semibold tracking-tight",
          tone === "success" && "text-success",
          tone === "error" && "text-error",
          tone === "neutral" && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
