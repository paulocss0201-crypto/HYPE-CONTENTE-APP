import type { DesignElement, DesignSlide } from "@/types/design";
import { Eye, EyeOff, Lock, Unlock, Type, Image as ImageIcon, Square, Smile, ArrowUp, ArrowDown, Group, Ungroup } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<DesignElement["kind"], typeof Type> = { text: Type, image: ImageIcon, shape: Square, icon: Smile };

function labelFor(el: DesignElement): string {
  if (el.name) return el.name;
  if (el.kind === "text") return el.content.slice(0, 24) || "Texto";
  if (el.kind === "image") return "Imagem";
  if (el.kind === "shape") return `Forma (${el.shapeType})`;
  return `Ícone (${el.icon})`;
}

export function LayersPanel({
  slide,
  selectedIds,
  onSelectIds,
  onUpdate,
  onReorder,
  onGroup,
  onUngroup,
}: {
  slide: DesignSlide;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onUpdate: (id: string, patch: Partial<DesignElement>) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  onGroup: () => void;
  onUngroup: () => void;
}) {
  const sorted = [...slide.elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={onGroup}
          disabled={selectedIds.length < 2}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs rounded-lg border border-ink-600 py-1.5 text-ink-200 hover:text-white hover:border-ink-400 disabled:opacity-30"
        >
          <Group className="size-3.5" /> Agrupar
        </button>
        <button
          onClick={onUngroup}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs rounded-lg border border-ink-600 py-1.5 text-ink-200 hover:text-white hover:border-ink-400"
        >
          <Ungroup className="size-3.5" /> Desagrupar
        </button>
      </div>
      {sorted.length === 0 && <p className="text-xs text-ink-500 text-center py-6">Nenhum elemento neste slide ainda.</p>}
      {sorted.map((el) => {
        const Icon = KIND_ICON[el.kind];
        const isSelected = selectedIds.includes(el.id);
        return (
          <div
            key={el.id}
            onClick={() => onSelectIds([el.id])}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer border",
              isSelected ? "bg-ink-800 border-ink-500" : "border-transparent hover:bg-ink-850"
            )}
          >
            <Icon className="size-3.5 text-ink-400 shrink-0" />
            <span className="text-xs text-ink-100 truncate flex-1">{labelFor(el)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReorder(el.id, "up");
              }}
              className="p-1 text-ink-400 hover:text-white"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReorder(el.id, "down");
              }}
              className="p-1 text-ink-400 hover:text-white"
            >
              <ArrowDown className="size-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(el.id, { hidden: !el.hidden });
              }}
              className="p-1 text-ink-400 hover:text-white"
            >
              {el.hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(el.id, { locked: !el.locked });
              }}
              className="p-1 text-ink-400 hover:text-white"
            >
              {el.locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
