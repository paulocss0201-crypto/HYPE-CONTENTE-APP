import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
}

export function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-ink-850 border border-ink-700 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-ring",
            active === tab.key ? "bg-white text-ink-950" : "text-ink-200 hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
