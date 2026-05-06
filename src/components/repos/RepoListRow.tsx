import { Link } from "@tanstack/react-router";
import { GitPullRequest, ChevronRight } from "lucide-react";
import type { Repo } from "@/types";
import { HealthBadge } from "@/components/repo/HealthBadge";
import { formatRel } from "@/lib/format";

interface Props {
  repo: Repo;
}

export function RepoListRow({ repo }: Props) {
  return (
    <Link
      to="/repos/$repoId"
      params={{ repoId: repo.id }}
      className="group grid grid-cols-12 items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-surface-1/50"
    >
      {/* Repository — col 1-5 */}
      <div className="col-span-12 min-w-0 sm:col-span-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{repo.owner}/</span>
          <span className="truncate text-sm font-medium text-foreground">{repo.name}</span>
          <HealthBadge health={repo.health} />
        </div>
        <div className="mt-0.5 truncate text-[12px] text-text-muted">{repo.description}</div>
      </div>

      {/* Language — col 6-7 */}
      <div className="hidden items-center gap-1.5 text-xs text-text-secondary sm:flex sm:col-span-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: repo.languageColor }}
        />
        {repo.language}
      </div>

      {/* Open PRs — col 8-9 */}
      <div className="hidden items-center gap-1.5 text-xs text-text-secondary sm:flex sm:col-span-2">
        <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={1.75} />
        {repo.openPRs} PRs
      </div>

      {/* Updated — col 10-11 */}
      <div className="col-span-2 hidden text-xs text-text-secondary sm:block">
        {formatRel(repo.lastUpdated)}
      </div>

      {/* Chevron — col 12 */}
      <div className="col-span-1 hidden justify-end sm:flex">
        <ChevronRight
          className="h-4 w-4 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-secondary"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}
