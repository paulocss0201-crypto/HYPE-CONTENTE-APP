import { LayoutTemplate, Type, Image, Shapes, Square, Smile, PaintBucket, Upload, Building2, Sparkles, Layers } from "lucide-react";
import type { ToolKey } from "./toolTypes";
import { TOOLS } from "./toolTypes";
import { cn } from "@/lib/utils";

const ICONS: Record<ToolKey, typeof LayoutTemplate> = {
  templates: LayoutTemplate,
  text: Type,
  images: Image,
  elements: Shapes,
  shapes: Square,
  icons: Smile,
  backgrounds: PaintBucket,
  uploads: Upload,
  brand: Building2,
  ai: Sparkles,
  layers: Layers,
};

export function LeftRail({ active, onSelect }: { active: ToolKey | null; onSelect: (tool: ToolKey) => void }) {
  return (
    <div className="hidden md:flex flex-col items-center w-[76px] shrink-0 border-r border-ink-750 bg-ink-950 py-3 gap-1 overflow-y-auto">
      {TOOLS.map((tool) => {
        const Icon = ICONS[tool.key];
        const isActive = active === tool.key;
        return (
          <button
            key={tool.key}
            onClick={() => onSelect(tool.key)}
            className={cn(
              "flex flex-col items-center gap-1 w-16 py-2.5 rounded-xl transition-colors",
              isActive ? "bg-ink-800 text-white" : "text-ink-400 hover:text-white hover:bg-ink-850"
            )}
          >
            <Icon className="size-[18px]" />
            <span className="text-[10px] leading-none">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
}
