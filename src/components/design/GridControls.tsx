import { useState } from "react";
import { Grid3x3 } from "lucide-react";
import { Switch } from "@/components/ui";
import { GRID_MODES } from "./toolTypes";
import type { GridMode } from "./toolTypes";
import { cn } from "@/lib/utils";

export function GridControls({
  mode,
  onModeChange,
  margin,
  onMarginChange,
  safeArea,
  onSafeAreaChange,
}: {
  mode: GridMode;
  onModeChange: (m: GridMode) => void;
  margin: number;
  onMarginChange: (v: number) => void;
  safeArea: boolean;
  onSafeAreaChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = mode !== "none" || safeArea;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={cn(
          "flex items-center gap-1.5 text-xs rounded-full border px-2.5 py-1 transition-colors",
          active ? "border-white/40 text-white" : "border-ink-700 text-ink-300 hover:text-white"
        )}
      >
        <Grid3x3 className="size-3.5" /> Grade
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 w-64 rounded-xl border border-ink-700 bg-ink-900 shadow-xl p-3 flex flex-col gap-3 z-20">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-ink-300">Tipo de grade</p>
            <div className="flex flex-wrap gap-1">
              {GRID_MODES.map((g) => (
                <button
                  key={g.key}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onModeChange(g.key)}
                  className={cn(
                    "text-xs rounded-full border px-2 py-1 transition-colors",
                    mode === g.key ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-200 hover:text-white"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-ink-300">
              <span>Margem</span>
              <span>{margin}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={margin}
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => onMarginChange(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          <Switch checked={safeArea} onChange={onSafeAreaChange} label="Área segura" description="Guia para manter elementos importantes longe das bordas" />

          <p className="text-[11px] text-ink-500">A grade é apenas um guia visual e não aparece na exportação.</p>
        </div>
      )}
    </div>
  );
}
