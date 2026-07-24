import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Project, KanbanStage } from "@/types";
import { FORMAT_LABEL, KANBAN_STAGE_ORDER, KANBAN_STAGE_LABEL, PRIORITY_LABEL } from "@/types";
import { FORMAT_ICON } from "@/lib/formatIcons";
import { PRIORITY_DOT } from "./priorityMeta";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Brush, CalendarDays, Pencil, Eye, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Tooltip } from "@/components/ui";

export function KanbanCard({
  project,
  onOpenDesign,
  onOpenSchedule,
  onOpenEdit,
  onOpenView,
  onDuplicate,
  onDelete,
  onMoveStage,
  onToggleFavorite,
}: {
  project: Project;
  onOpenDesign: () => void;
  onOpenSchedule: () => void;
  onOpenEdit: () => void;
  onOpenView: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveStage: (stage: KanbanStage) => void;
  onToggleFavorite: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    data: { stage: project.kanbanStage },
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = FORMAT_ICON[project.format];

  const stageIndex = KANBAN_STAGE_ORDER.indexOf(project.kanbanStage);
  const checklistDone = project.checklist.filter((c) => c.done).length;
  const checklistTotal = project.checklist.length;
  const progress = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card rounded-xl p-3 flex flex-col gap-2.5 cursor-grab active:cursor-grabbing touch-manipulation"
      onClick={onOpenView}
      {...attributes}
      {...listeners}
    >
      <div className="h-14 rounded-lg bg-gradient-to-br from-ink-800 to-ink-900 border border-ink-700 flex items-center justify-center relative overflow-hidden">
        <Icon className="size-6 text-ink-400" />
        {project.favorite && <span className="absolute top-1.5 right-1.5 text-[10px]">★</span>}
      </div>

      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white leading-snug line-clamp-2">{project.title}</p>
        <span className={cn("size-2 rounded-full shrink-0 mt-1.5", PRIORITY_DOT[project.priority])} title={PRIORITY_LABEL[project.priority]} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] rounded-full bg-ink-800 border border-ink-600 px-2 py-0.5 text-ink-100">{FORMAT_LABEL[project.format]}</span>
        {project.labels.slice(0, 2).map((label) => (
          <span key={label} className="text-[10px] rounded-full bg-ink-800 border border-ink-600 px-2 py-0.5 text-ink-200">
            {label}
          </span>
        ))}
        {project.labels.length > 2 && <span className="text-[10px] text-ink-400">+{project.labels.length - 2}</span>}
      </div>

      <div className="flex items-center justify-between text-[11px] text-ink-400">
        <span>{formatDate(project.createdAt)}</span>
        {project.scheduledDate && <span>Prev: {formatDate(project.scheduledDate)}</span>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="size-5 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-[10px] font-semibold shrink-0">
            {(project.responsible || "?").charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] text-ink-300 truncate">{project.responsible || "Sem responsável"}</span>
        </div>
        <span className="text-[10px] text-ink-400 shrink-0">{project.platform}</span>
      </div>

      {checklistTotal > 0 && (
        <div>
          <div className="h-1 rounded-full bg-ink-750 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-ink-400 mt-1">{checklistDone}/{checklistTotal} etapas concluídas</p>
        </div>
      )}

      <div
        className="flex items-center justify-between pt-1 border-t border-ink-750"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5">
          <Tooltip content="Abrir no Design de Posts">
            <button onClick={onOpenDesign} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors">
              <Brush className="size-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Agendar publicação">
            <button onClick={onOpenSchedule} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors">
              <CalendarDays className="size-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Editar">
            <button onClick={onOpenEdit} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors">
              <Pencil className="size-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Visualizar">
            <button onClick={onOpenView} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors">
              <Eye className="size-3.5" />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => stageIndex > 0 && onMoveStage(KANBAN_STAGE_ORDER[stageIndex - 1])}
            disabled={stageIndex === 0}
            className="p-1 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Voltar etapa"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            onClick={() => stageIndex < KANBAN_STAGE_ORDER.length - 1 && onMoveStage(KANBAN_STAGE_ORDER[stageIndex + 1])}
            disabled={stageIndex === KANBAN_STAGE_ORDER.length - 1}
            className="p-1 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Avançar etapa"
          >
            <ChevronRight className="size-3.5" />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors">
              <MoreVertical className="size-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-44 glass-card rounded-xl p-1.5 shadow-lg z-30 animate-fade-up">
                <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-ink-400">Mover para</p>
                {KANBAN_STAGE_ORDER.filter((s) => s !== project.kanbanStage).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onMoveStage(s);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
                  >
                    {KANBAN_STAGE_LABEL[s]}
                  </button>
                ))}
                <div className="h-px bg-ink-700 my-1" />
                <button
                  onClick={() => {
                    onToggleFavorite();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
                >
                  {project.favorite ? "Remover dos favoritos" : "Favoritar"}
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-danger hover:bg-danger/10 transition-colors"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
