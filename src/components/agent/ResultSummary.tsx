import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  GitPullRequest,
} from "lucide-react";
import type { RunResult, RunStatus } from "@/types";
import { cn } from "@/lib/utils";

function fmtDuration(ms: number) {
  const s = Math.round(ms / 100) / 10;
  return `${s.toFixed(1)}s`;
}

interface Props {
  status: RunStatus;
  result: RunResult;
}

export function ResultSummary({ status, result }: Props) {
  const failed = status === "failure";

  // Extract PR number from URL if present
  const prNumber = result.prUrl
    ? result.prUrl.match(/\/pull\/(\d+)/)?.[1]
    : null;
  const prRepo = result.prUrl
    ? result.prUrl.split("/").slice(-3, -2)[0]
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* Header band */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-5 py-3.5",
          failed
            ? "border-b border-error/20 bg-error/10"
            : "border-b border-success/20 bg-success/10",
        )}
      >
        <div className="flex items-center gap-2">
          {failed ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-error" strokeWidth={1.75} />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
          )}
          <span className="text-sm font-semibold">
            {failed ? "Agent task failed" : "Agent task completed successfully"}
          </span>
        </div>

        <ConfidenceBadge confidence={result.confidence} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 divide-x divide-border bg-surface-1 sm:grid-cols-4">
        {/* Tests */}
        <StatCell label="Tests">
          <span className="text-base font-semibold tabular-nums text-foreground">
            {result.testsPassed}
            <span className="ml-1 text-[13px] font-normal text-text-muted">passed</span>
          </span>
          {result.testsFailed > 0 && (
            <span className="mt-0.5 text-[12px] font-medium text-error">
              · {result.testsFailed} failed
            </span>
          )}
          {result.testsFailed === 0 && (
            <span className="mt-0.5 text-[12px] text-text-muted">· 0 failed</span>
          )}
        </StatCell>

        {/* Issues detected */}
        <StatCell label="Issues Detected">
          <span
            className={cn(
              "text-base font-semibold tabular-nums",
              result.issuesDetected > 0 ? "text-warning" : "text-foreground",
            )}
          >
            {result.issuesDetected}
          </span>
        </StatCell>

        {/* Issues fixed */}
        <StatCell label="Issues Fixed">
          <span className="text-base font-semibold tabular-nums text-foreground">
            {result.issuesFixed}
            {result.issuesDetected > 0 && (
              <span className="ml-1 text-[13px] font-normal text-text-muted">
                / {result.issuesDetected}
              </span>
            )}
          </span>
        </StatCell>

        {/* Duration */}
        <StatCell label="Duration">
          <span className="text-base font-semibold tabular-nums text-foreground">
            {fmtDuration(result.durationMs)}
          </span>
        </StatCell>
      </div>

      {/* PR row — only when a PR was generated */}
      {result.prUrl && prNumber && (
        <div className="border-t border-border bg-surface-1 px-5 py-3">
          <a
            href={result.prUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/10 px-3 py-1.5 transition-colors hover:bg-warning/15"
          >
            <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-warning">
              PR #{prNumber} opened
            </span>
            {prRepo && (
              <span className="text-[12px] text-warning/70">
                acme/{prRepo}
              </span>
            )}
            <ExternalLink className="h-3 w-3 shrink-0 text-warning/60" strokeWidth={1.75} />
          </a>
        </div>
      )}
    </div>
  );
}

function StatCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </span>
      <div className="flex flex-wrap items-baseline gap-1">{children}</div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: RunResult["confidence"] }) {
  if (confidence === "high") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">
        <Sparkles className="h-3 w-3" strokeWidth={1.75} />
        High confidence result
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning">
      <AlertTriangle className="h-3 w-3" strokeWidth={1.75} />
      Review recommended
    </span>
  );
}
