import { cn } from "@/lib/utils";

interface Option {
  key: string;
  label: string;
}

interface ChipGroupProps {
  label?: string;
  options: Option[];
  value: string | string[];
  onChange: (value: string) => void;
  multi?: boolean;
  error?: string;
}

export function ChipGroup({ label, options, value, onChange, multi, error }: ChipGroupProps) {
  const isSelected = (key: string) => (multi ? (value as string[]).includes(key) : value === key);
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-ink-100">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = isSelected(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all focus-ring",
                active
                  ? "bg-white text-ink-950 border-white"
                  : "bg-ink-850 text-ink-200 border-ink-600 hover:border-ink-400 hover:text-white"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
