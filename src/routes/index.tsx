import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPOS, LANGUAGES } from "@/mock/repos";
import { RepoListRow } from "@/components/repos/RepoListRow";
import type { Health } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Repositories — Agentic Developer Portal" },
      { name: "description", content: "Browse repositories and trigger AI agent tasks." },
    ],
  }),
  component: RepoListPage,
});

function RepoListPage() {
  const [q, setQ] = useState("");
  const [lang, setLang] = useState<string>("all");
  const [health, setHealth] = useState<string>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return REPOS.filter((r) => {
      if (lang !== "all" && r.language !== lang) return false;
      if (health !== "all" && r.health !== (health as Health)) return false;
      if (!ql) return true;
      return (
        r.name.toLowerCase().includes(ql) ||
        r.description.toLowerCase().includes(ql) ||
        r.tags.some((t) => t.toLowerCase().includes(ql))
      );
    });
  }, [q, lang, health]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Repositories</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {REPOS.length} repositories &middot; select one to view insights and run an agent task.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
            strokeWidth={1.75}
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search repositories..."
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="h-9 w-[148px] text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {LANGUAGES.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={health} onValueChange={setHealth}>
            <SelectTrigger className="h-9 w-[138px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1/30">
        <div className="hidden grid-cols-12 gap-3 border-b border-border px-4 py-2.5 text-[10px] font-medium uppercase tracking-widest text-text-muted sm:grid">
          <div className="col-span-5">Repository</div>
          <div className="col-span-2">Language</div>
          <div className="col-span-2">Open PRs</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-1" />
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-14 text-center text-sm text-text-muted">
            No repositories match your filters.
          </div>
        ) : (
          filtered.map((r) => <RepoListRow key={r.id} repo={r} />)
        )}
      </div>
    </div>
  );
}
