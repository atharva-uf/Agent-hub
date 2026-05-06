import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Health } from "@/types";

const map = {
  healthy: { label: "Healthy", icon: CheckCircle2, cls: "border-success/30 bg-success/10 text-success" },
  warning: { label: "Warning", icon: AlertTriangle, cls: "border-warning/30 bg-warning/10 text-warning" },
  critical: { label: "Critical", icon: XCircle, cls: "border-error/30 bg-error/10 text-error" },
} as const;

export function HealthBadge({ health }: { health: Health }) {
  const m = map[health];
  const Icon = m.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", m.cls)}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}
