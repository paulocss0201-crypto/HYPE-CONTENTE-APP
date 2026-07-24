import type { StoriesContent, StorySlide } from "@/types";
import { Card, Button } from "@/components/ui";
import { EditableText } from "./EditableText";
import { STAGE_LABEL } from "@/lib/ai";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Plus, MousePointerClick } from "lucide-react";
import { uid } from "@/lib/utils";

export function StoriesResultView({ content, onChange }: { content: StoriesContent; onChange: (content: StoriesContent) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = content.stories.findIndex((s) => s.id === active.id);
    const newIndex = content.stories.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(content.stories, oldIndex, newIndex).map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ stories: reordered });
  }

  function updateStory(id: string, patch: Partial<StorySlide>) {
    onChange({ stories: content.stories.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function removeStory(id: string) {
    onChange({ stories: content.stories.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 })) });
  }

  function duplicateStory(id: string) {
    const idx = content.stories.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const copy = { ...content.stories[idx], id: uid("story") };
    const stories = [...content.stories.slice(0, idx + 1), copy, ...content.stories.slice(idx + 1)].map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ stories });
  }

  function addStory() {
    const newStory: StorySlide = {
      id: uid("story"),
      number: content.stories.length + 1,
      stage: "desenvolvimento",
      objective: "Novo objetivo",
      mainText: "Edite o texto principal.",
      supportText: "Texto de apoio.",
      visual: "Sugestão visual.",
      background: "Sugestão de fundo.",
      interactive: "Sem interação",
      cta: "",
    };
    onChange({ stories: [...content.stories, newStory] });
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={content.stories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {content.stories.map((story) => (
              <SortableStory key={story.id} story={story} onUpdate={updateStory} onRemove={removeStory} onDuplicate={duplicateStory} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" size="sm" icon={<Plus className="size-3.5" />} onClick={addStory} className="self-start">
        Adicionar Story
      </Button>
    </div>
  );
}

function SortableStory({
  story,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  story: StorySlide;
  onUpdate: (id: string, patch: Partial<StorySlide>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: story.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 text-ink-400 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <span className="text-xs font-semibold text-ink-200">
              Story {story.number} · {STAGE_LABEL[story.stage]}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => onDuplicate(story.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors" aria-label="Duplicar story">
                <Copy className="size-3.5" />
              </button>
              <button onClick={() => onRemove(story.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger hover:bg-danger/10 transition-colors" aria-label="Remover story">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Texto principal</p>
          <EditableText value={story.mainText} onChange={(v) => onUpdate(story.id, { mainText: v })} multiline textClassName="text-white font-medium" className="mb-2" />
          <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Texto de apoio</p>
          <EditableText value={story.supportText} onChange={(v) => onUpdate(story.id, { supportText: v })} className="mb-2" />
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Sugestão visual</p>
              <EditableText value={story.visual} onChange={(v) => onUpdate(story.id, { visual: v })} multiline />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Sugestão de fundo</p>
              <EditableText value={story.background} onChange={(v) => onUpdate(story.id, { background: v })} multiline />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-200 bg-ink-800 border border-ink-600 rounded-lg px-2.5 py-1.5 w-fit">
            <MousePointerClick className="size-3.5 text-ink-400" />
            {story.interactive}
          </div>
        </div>
      </div>
    </Card>
  );
}
