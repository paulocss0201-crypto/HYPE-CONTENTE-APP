import { useMemo } from "react";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { KanbanStage, Project } from "@/types";
import { KANBAN_STAGE_ORDER } from "@/types";
import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard({
  projects,
  onMoveStage,
  onReorderColumn,
  cardHandlers,
}: {
  projects: Project[];
  onMoveStage: (id: string, stage: KanbanStage) => void;
  onReorderColumn: (orderedIds: string[]) => void;
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = useMemo(() => {
    const grouped: Record<KanbanStage, Project[]> = { escrito: [], produzido: [], postado: [], validado: [] };
    projects.forEach((p) => grouped[p.kanbanStage].push(p));
    KANBAN_STAGE_ORDER.forEach((stage) => grouped[stage].sort((a, b) => a.kanbanOrder - b.kanbanOrder));
    return grouped;
  }, [projects]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeProject = projects.find((p) => p.id === active.id);
    if (!activeProject) return;

    const overId = String(over.id);
    const destinationStage: KanbanStage = overId.startsWith("column-")
      ? (overId.replace("column-", "") as KanbanStage)
      : projects.find((p) => p.id === overId)?.kanbanStage ?? activeProject.kanbanStage;

    if (destinationStage !== activeProject.kanbanStage) {
      onMoveStage(activeProject.id, destinationStage);
      return;
    }

    if (overId !== String(active.id)) {
      const columnIds = columns[activeProject.kanbanStage].map((p) => p.id);
      const oldIndex = columnIds.indexOf(String(active.id));
      const newIndex = columnIds.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderColumn(arrayMove(columnIds, oldIndex, newIndex));
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
        {KANBAN_STAGE_ORDER.map((stage) => (
          <KanbanColumn key={stage} stage={stage} projects={columns[stage]} cardHandlers={cardHandlers} />
        ))}
      </div>
    </DndContext>
  );
}
