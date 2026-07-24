import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";
import { STATUS_LABEL } from "@/types";

export function Badge({ children, className, tone = "neutral" }: { children: ReactNode; className?: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const toneClasses = {
    neutral: "bg-ink-750 text-ink-100 border-ink-600",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    danger: "bg-danger/10 text-danger border-danger/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ProjectStatus, "neutral" | "success" | "warning"> = {
  idea: "neutral",
  producing: "warning",
  ready: "success",
  scheduled: "warning",
  published: "success",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
