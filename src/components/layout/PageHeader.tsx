import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        {description && <p className="text-sm text-ink-300 mt-1.5 max-w-2xl text-balance">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
