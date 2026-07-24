import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { KanbanStage, Project } from "@/types";
import { KANBAN_STAGE_LABEL } from "@/types";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";

export function KanbanColumn({
  stage,
  projects,
  cardHandlers,
}: {
  stage: KanbanStage;
  projects: Project[];
  cardHandlers: (project: Project) => {
    onOpenDesign: () => void;
    onOpenSchedule: () => void;
    onOpenEdit: () => void;
    onOpenView: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onMoveStage: (stage: KanbanStage) => void;
    onToggleFavorite: () => void;
  };
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${stage}` });

  return (
    <div className="flex flex-col w-[280px] sm:w-[300px] shrink-0 max-h-full">
      <div className="flex items-center justify-between px-1 mb-3">
        <p className="text-sm font-semibold text-white">{KANBAN_STAGE_LABEL[stage]}</p>
        <span className="text-xs text-ink-400 bg-ink-800 border border-ink-600 rounded-full px-2 py-0.5">{projects.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-2.5 rounded-2xl border border-dashed p-2 min-h-[140px] overflow-y-auto transition-colors",
          isOver ? "border-ink-400 bg-ink-900/60" : "border-ink-750 bg-ink-950/40"
        )}
      >
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <KanbanCard key={project.id} project={project} {...cardHandlers(project)} />
          ))}
        </SortableContext>
        {projects.length === 0 && <p className="text-xs text-ink-500 text-center py-6">Nenhum card aqui ainda</p>}
      </div>
    </div>
  );
}
