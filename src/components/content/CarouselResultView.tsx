import type { CarouselContent, CarouselSlide } from "@/types";
import { Card, Button } from "@/components/ui";
import { EditableText } from "./EditableText";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Plus, Hash } from "lucide-react";
import { uid } from "@/lib/utils";

const ROLE_LABEL: Record<CarouselSlide["role"], string> = {
  capa: "Capa",
  problema: "Problema",
  desenvolvimento: "Desenvolvimento",
  transformacao: "Transformação",
  cta: "Chamada para ação",
};

export function CarouselResultView({ content, onChange }: { content: CarouselContent; onChange: (content: CarouselContent) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = content.slides.findIndex((s) => s.id === active.id);
    const newIndex = content.slides.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(content.slides, oldIndex, newIndex).map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ ...content, slides: reordered });
  }

  function updateSlide(id: string, patch: Partial<CarouselSlide>) {
    onChange({ ...content, slides: content.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function removeSlide(id: string) {
    const filtered = content.slides.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ ...content, slides: filtered });
  }

  function duplicateSlide(id: string) {
    const idx = content.slides.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const copy = { ...content.slides[idx], id: uid("slide") };
    const slides = [...content.slides.slice(0, idx + 1), copy, ...content.slides.slice(idx + 1)].map((s, i) => ({ ...s, number: i + 1 }));
    onChange({ ...content, slides });
  }

  function addSlide() {
    const newSlide: CarouselSlide = {
      id: uid("slide"),
      number: content.slides.length + 1,
      role: "desenvolvimento",
      title: "Novo slide",
      body: "Edite o conteúdo deste slide.",
      visual: "Descreva a sugestão visual.",
      designNote: "Observação de design.",
    };
    onChange({ ...content, slides: [...content.slides, newSlide] });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-xs font-medium text-ink-300 mb-1">GANCHO DA LEGENDA</p>
        <p className="text-base font-medium text-white mb-3">{content.captionHook}</p>
        <p className="text-xs font-medium text-ink-300 mb-1">LEGENDA COMPLETA</p>
        <EditableText value={content.caption} onChange={(v) => onChange({ ...content, caption: v })} multiline />
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={content.slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {content.slides.map((slide) => (
              <SortableSlide key={slide.id} slide={slide} onUpdate={updateSlide} onRemove={removeSlide} onDuplicate={duplicateSlide} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" size="sm" icon={<Plus className="size-3.5" />} onClick={addSlide} className="self-start">
        Adicionar slide
      </Button>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Hashtags</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {content.hashtags.map((tag) => (
              <span key={tag} className="text-xs bg-ink-800 border border-ink-600 rounded-full px-2.5 py-1 text-ink-100">
                {tag}
              </span>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold mb-2">Alternativas</p>
          <p className="text-xs text-ink-300 mb-1">Título alternativo</p>
          <p className="text-sm text-ink-100 mb-3">{content.altTitle}</p>
          <p className="text-xs text-ink-300 mb-1">Capa alternativa</p>
          <p className="text-sm text-ink-100">{content.altCover}</p>
        </Card>
      </div>
    </div>
  );
}

function SortableSlide({
  slide,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  slide: CarouselSlide;
  onUpdate: (id: string, patch: Partial<CarouselSlide>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="glass-card rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 text-ink-400 hover:text-white cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <span className="text-xs font-semibold text-ink-200">
              Slide {slide.number} · {ROLE_LABEL[slide.role]}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => onDuplicate(slide.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors" aria-label="Duplicar slide">
                <Copy className="size-3.5" />
              </button>
              <button onClick={() => onRemove(slide.id)} className="p-1.5 rounded-lg text-ink-400 hover:text-danger hover:bg-danger/10 transition-colors" aria-label="Remover slide">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
          <EditableText value={slide.title} onChange={(v) => onUpdate(slide.id, { title: v })} textClassName="text-white font-medium" className="mb-2" />
          <EditableText value={slide.body} onChange={(v) => onUpdate(slide.id, { body: v })} multiline className="mb-2" />
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Sugestão visual</p>
              <EditableText value={slide.visual} onChange={(v) => onUpdate(slide.id, { visual: v })} multiline />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">Observação de design</p>
              <EditableText value={slide.designNote} onChange={(v) => onUpdate(slide.id, { designNote: v })} multiline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
