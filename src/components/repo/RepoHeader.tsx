import { useState } from "react";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  CheckCircle2,
  XCircle,
  Play,
  Clock,
} from "lucide-react";
import type { Repo } from "@/types";
import { cn } from "@/lib/utils";
import { formatRel } from "@/lib/format";
import { HealthBadge } from "./HealthBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOCK_BRANCHES = ["main", "develop", "feat/edge-functions", "fix/perf-hotfix", "chore/upgrade-deps"];

interface Props {
  repo: Repo;
  onRun: () => void;
}

export function RepoHeader({ repo, onRun }: Props) {
  const defaultBranch = MOCK_BRANCHES.includes(repo.branch) ? repo.branch : "main";
  const [selectedBranch, setSelectedBranch] = useState(defaultBranch);

  return (
    <section className="rounded-xl border border-border bg-surface-1 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-muted font-medium">{repo.owner}/</span>
            <h1 className="text-xl font-semibold tracking-tight">{repo.name}</h1>
            <HealthBadge health={repo.health} />
          </div>
          <p className="mt-1.5 max-w-xl text-sm text-text-secondary leading-relaxed">
            {repo.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {repo.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onRun}
          className="btn-cta inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
        >
          <Play className="h-3.5 w-3.5" strokeWidth={2.5} fill="currentColor" />
          Run Agent Task
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4">
        <MetaItem icon={<GitCommit className="h-3.5 w-3.5" />}>
          <span className="font-mono text-[11px] text-foreground/80">
            {repo.lastCommit.sha.slice(0, 7)}
          </span>
          <span className="ml-1 max-w-[200px] truncate text-[12px] text-text-secondary">
            {repo.lastCommit.message}
          </span>
          <span className="text-[11px] text-text-muted">{formatRel(repo.lastCommit.at)}</span>
        </MetaItem>

        <MetaItem icon={<GitPullRequest className="h-3.5 w-3.5" />}>
          <span className="text-[12px] text-foreground/80">{repo.openPRs} open PRs</span>
        </MetaItem>

        <MetaItem icon={<GitBranch className="h-3.5 w-3.5" />}>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="h-6 gap-1.5 border-0 bg-transparent p-0 text-[11px] font-mono text-foreground/80 shadow-none ring-0 focus:ring-0 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[180px]">
              {MOCK_BRANCHES.map((b) => (
                <SelectItem key={b} value={b} className="font-mono text-[12px]">
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </MetaItem>

        <MetaItem
          icon={
            repo.buildStatus === "passing" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-error" />
            )
          }
        >
          <span className={cn("text-[12px] font-medium", repo.buildStatus === "passing" ? "text-success" : "text-error")}>
            {repo.buildStatus === "passing" ? "Build passing" : "Build failing"}
          </span>
        </MetaItem>

        <MetaItem icon={<Clock className="h-3.5 w-3.5" />}>
          <span className="text-[12px] text-text-secondary">
            Updated {formatRel(repo.lastUpdated)}
          </span>
        </MetaItem>
      </div>
    </section>
  );
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-text-muted">
      {icon}
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}
