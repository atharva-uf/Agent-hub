import type { Repo } from "@/types";
import {
  Star,
  Users,
  ShieldCheck,
  CircleDot,
  Rocket,
  GitMerge,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  repo: Repo;
}

function fmtNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function fmtHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function InsightCards({ repo }: Props) {
  const ins = repo.insights;

  const cards: {
    icon: React.ReactNode;
    label: string;
    value: string;
    bar?: number;
    sub?: string;
  }[] = [
    {
      icon: <Star className="h-3.5 w-3.5" />,
      label: "Stars",
      value: fmtNum(ins.stars),
      sub: "github stars",
    },
    {
      icon: <Users className="h-3.5 w-3.5" />,
      label: "Contributors",
      value: String(ins.contributors),
      sub: "active last 90d",
    },
    {
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
      label: "Test Coverage",
      value: ins.testCoverage > 0 ? `${ins.testCoverage}%` : "N/A",
      bar: ins.testCoverage > 0 ? ins.testCoverage : undefined,
    },
    {
      icon: <CircleDot className="h-3.5 w-3.5" />,
      label: "Open Issues",
      value: String(repo.openIssues),
      sub: `${Math.ceil(repo.openIssues * 0.2)} high priority`,
    },
    {
      icon: <Rocket className="h-3.5 w-3.5" />,
      label: `Deploys`,
      value: String(ins.deploys),
      sub: "last 30 days",
    },
    {
      icon: <GitMerge className="h-3.5 w-3.5" />,
      label: "Avg. PR Time",
      value: fmtHours(ins.avgMergeHours),
      sub: "rolling 14d",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className="group rounded-xl border border-border bg-surface-1 p-4 transition-all duration-200 hover:-translate-y-px hover:border-border/60 hover:bg-surface-1/80"
        >
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-text-muted">
            {c.icon}
            {c.label}
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground">
            {c.value}
          </div>
          {c.bar !== undefined && (
            <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-background/80">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  c.bar >= 80 ? "bg-success" : c.bar >= 60 ? "bg-warning" : "bg-error",
                )}
                style={{ width: `${c.bar}%` }}
              />
            </div>
          )}
          {c.sub && c.bar === undefined && (
            <div className="mt-1.5 text-[11px] text-text-muted">{c.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
