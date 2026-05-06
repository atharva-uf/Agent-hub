import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Github,
  Slack,
  GitlabIcon,
  Zap,
  BarChart3,
  Bell,
  CheckCircle2,
  Plus,
  Settings,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Agentic Developer Portal" },
      { name: "description", content: "Connect your tools and services to the Agentic portal." },
    ],
  }),
  component: IntegrationsPage,
});

type Category = "scm" | "notifications" | "cicd" | "monitoring" | "project";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: Category;
  connected: boolean;
  connectedLabel?: string;
  icon: React.ReactNode;
  docs?: string;
}

const CATEGORY_LABEL: Record<Category, string> = {
  scm: "Source Control",
  notifications: "Notifications",
  cicd: "CI / CD",
  monitoring: "Monitoring",
  project: "Project Management",
};

const INTEGRATIONS: Integration[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect repositories, pull request data, and webhook events from GitHub.",
    category: "scm",
    connected: true,
    connectedLabel: "acme-org",
    icon: <Github className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    id: "gitlab",
    name: "GitLab",
    description: "Sync GitLab projects and merge requests alongside your GitHub repos.",
    category: "scm",
    connected: false,
    icon: <GitlabIcon className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receive agent run notifications and alerts directly in your Slack channels.",
    category: "notifications",
    connected: true,
    connectedLabel: "#eng-agent-alerts",
    icon: <Slack className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    description: "Trigger agent tasks from CI workflows and surface results back to pull requests.",
    category: "cicd",
    connected: true,
    connectedLabel: "acme-org",
    icon: <Zap className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Forward agent metrics and run telemetry to your Datadog dashboards.",
    category: "monitoring",
    connected: false,
    icon: <BarChart3 className="h-5 w-5" strokeWidth={1.75} />,
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    description: "Route critical agent failures to on-call escalation policies automatically.",
    category: "notifications",
    connected: false,
    icon: <Bell className="h-5 w-5" strokeWidth={1.75} />,
  },
];

const CATEGORIES = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));

function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const filtered =
    activeCategory === "all"
      ? INTEGRATIONS
      : INTEGRATIONS.filter((i) => i.category === activeCategory);

  const connectedCount = INTEGRATIONS.filter((i) => i.connected).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {connectedCount} of {INTEGRATIONS.length} connected &middot; extend the portal with your existing tools.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          Browse catalog
        </Button>
      </div>

      {/* Category filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterPill
          label="All"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            label={CATEGORY_LABEL[cat]}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Integration grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-text-muted">
        Need a custom integration?{" "}
        <span className="cursor-pointer text-primary hover:underline">Contact support</span>
      </p>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border bg-transparent text-text-muted hover:border-border/80 hover:text-text-secondary",
      )}
    >
      {label}
    </button>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      toast.success(`${integration.name} connected`, {
        description: "Integration is active and ready to use.",
      });
    }, 1800);
  };

  const handleDisconnect = () => {
    toast(`${integration.name} disconnected`, {
      description: "You can reconnect at any time.",
    });
  };

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-surface-1 p-5 transition-all duration-200 hover:border-border/60">
      {/* Card header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60 text-text-secondary">
            {integration.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{integration.name}</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
              {CATEGORY_LABEL[integration.category]}
            </div>
          </div>
        </div>

        {integration.connected && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
            Connected
          </span>
        )}
      </div>

      {/* Description */}
      <p className="flex-1 text-[13px] leading-relaxed text-text-secondary">
        {integration.description}
      </p>

      {/* Connected label */}
      {integration.connected && integration.connectedLabel && (
        <div className="mt-3 rounded-md border border-border bg-background/50 px-3 py-1.5 font-mono text-[11px] text-text-muted">
          {integration.connectedLabel}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {integration.connected ? (
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" strokeWidth={1.75} />
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-text-muted hover:text-error"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={handleConnect}
            disabled={connecting}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            {connecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    </div>
  );
}
