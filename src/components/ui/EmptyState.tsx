import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-3">
      {icon && <div className="size-12 rounded-2xl bg-ink-800 border border-ink-600 flex items-center justify-center text-ink-200 mb-1">{icon}</div>}
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-ink-300 max-w-sm text-balance">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
