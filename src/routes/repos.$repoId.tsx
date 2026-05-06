import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { REPOS } from "@/mock/repos";
import { RepoHeader } from "@/components/repo/RepoHeader";
import { InsightCards } from "@/components/repo/InsightCards";
import { AgentPanel } from "@/components/agent/AgentPanel";

export const Route = createFileRoute("/repos/$repoId")({
  loader: ({ params }) => {
    const repo = REPOS.find((r) => r.id === params.repoId);
    if (!repo) throw notFound();
    return { repo };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.repo.name} — Agentic Developer Portal` },
          { name: "description", content: loaderData.repo.description },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Repository not found</h1>
      <p className="mt-2 text-sm text-text-secondary">It may have been removed or renamed.</p>
      <Link to="/" className="mt-6 inline-block text-sm text-primary hover:underline">Back to repositories</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-text-secondary">{error.message}</p>
      <button onClick={reset} className="mt-6 text-sm text-primary hover:underline">Try again</button>
    </div>
  ),
  component: RepoOverviewPage,
});

function RepoOverviewPage() {
  const { repo } = Route.useLoaderData();
  const agentRef = useRef<HTMLDivElement>(null);

  const triggerRun = () => {
    agentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new CustomEvent("agent:open-task-modal"));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> All repositories
      </Link>

      <RepoHeader repo={repo} onRun={triggerRun} />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            Insights
          </h2>
          <span className="text-[11px] text-text-muted">last 30 days</span>
        </div>
        <InsightCards repo={repo} />
      </div>

      <div ref={agentRef}>
        <AgentPanel repo={repo} />
      </div>
    </div>
  );
}
