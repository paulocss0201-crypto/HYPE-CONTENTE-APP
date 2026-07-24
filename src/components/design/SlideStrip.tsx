import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DesignSlide } from "@/types/design";
import { Plus, Copy, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui";

export function SlideStrip({
  slides,
  activeIndex,
  onSelect,
  onReorder,
  onAdd,
  onDuplicate,
  onDelete,
  onRedesignSlide,
}: {
  slides: DesignSlide[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onReorder: (fromId: string, toId: string) => void;
  onAdd: () => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onRedesignSlide: (index: number) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  }

  return (
    <div className="flex items-center gap-2 h-24 px-3 border-t border-ink-750 bg-ink-950 overflow-x-auto shrink-0">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
          {slides.map((slide, i) => (
            <SlideThumb
              key={slide.id}
              slide={slide}
              index={i}
              active={i === activeIndex}
              onSelect={() => onSelect(i)}
              onDuplicate={() => onDuplicate(i)}
              onDelete={() => onDelete(i)}
              onRedesign={() => onRedesignSlide(i)}
              canDelete={slides.length > 1}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={onAdd} className="flex flex-col items-center justify-center gap-1 w-14 h-16 rounded-xl border border-dashed border-ink-600 text-ink-400 hover:text-white hover:border-ink-400 transition-colors shrink-0">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function SlideThumb({
  slide,
  index,
  active,
  onSelect,
  onDuplicate,
  onDelete,
  onRedesign,
  canDelete,
}: {
  slide: DesignSlide;
  index: number;
  active: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRedesign: () => void;
  canDelete: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="relative shrink-0 group">
      <button
        {...attributes}
        {...listeners}
        onClick={onSelect}
        className={cn(
          "w-14 h-16 rounded-xl border-2 flex items-center justify-center text-xs font-semibold text-white overflow-hidden",
          active ? "border-white" : "border-ink-700 opacity-70 hover:opacity-100"
        )}
        style={{ background: slide.backgroundGradientTo ? `linear-gradient(160deg, ${slide.background}, ${slide.backgroundGradientTo})` : slide.background }}
      >
        {index + 1}
      </button>
      <div className="absolute -top-1 -right-1 hidden group-hover:flex items-center gap-0.5 bg-ink-900 border border-ink-600 rounded-lg p-0.5 z-10">
        <Tooltip content="Redesenhar com IA">
          <button onClick={onRedesign} className="p-1 text-ink-300 hover:text-white">
            <Sparkles className="size-3" />
          </button>
        </Tooltip>
        <Tooltip content="Duplicar slide">
          <button onClick={onDuplicate} className="p-1 text-ink-300 hover:text-white">
            <Copy className="size-3" />
          </button>
        </Tooltip>
        {canDelete && (
          <Tooltip content="Excluir slide">
            <button onClick={onDelete} className="p-1 text-ink-300 hover:text-danger">
              <Trash2 className="size-3" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
