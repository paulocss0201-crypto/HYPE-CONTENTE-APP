import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Select, Tabs, Card, EmptyState, StatusBadge, Badge } from "@/components/ui";
import { KanbanBoard, ManualCardModal, AIPlanningModal, CardDetailPanel } from "@/components/kanban";
import { ScheduleModal } from "@/components/content";
import { useContentStore } from "@/store/contentStore";
import { useBrandStore } from "@/store/brandStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import type { KanbanStage, Priority, Project } from "@/types";
import { FORMAT_LABEL, PRIORITY_LABEL, KANBAN_STAGE_LABEL } from "@/types";
import { FORMAT_ICON } from "@/lib/formatIcons";
import { formatDate } from "@/lib/utils";
import { Search, Plus, Sparkles, Kanban as KanbanIcon, LayoutList } from "lucide-react";

const VIEW_TABS = [
  { key: "kanban", label: "Kanban" },
  { key: "lista", label: "Lista" },
];

const SORT_OPTIONS = [
  { key: "personalizada", label: "Ordem personalizada" },
  { key: "criacao", label: "Data de criação" },
  { key: "publicacao", label: "Data de publicação" },
  { key: "prioridade", label: "Prioridade" },
  { key: "atualizacao", label: "Última atualização" },
];

const PRIORITY_RANK: Record<Priority, number> = { urgente: 3, alta: 2, media: 1, baixa: 0 };

export function KanbanPage() {
  const navigate = useNavigate();
  const projects = useContentStore((s) => s.projects);
  const moveKanbanStage = useContentStore((s) => s.moveKanbanStage);
  const reorderKanbanColumn = useContentStore((s) => s.reorderKanbanColumn);
  const duplicateProject = useContentStore((s) => s.duplicateProject);
  const removeProject = useContentStore((s) => s.removeProject);
  const toggleFavorite = useContentStore((s) => s.toggleFavorite);
  const updateProject = useContentStore((s) => s.updateProject);
  const addCalendarEntry = useContentStore((s) => s.addCalendarEntry);
  const brand = useBrandStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const pushToast = useUiStore((s) => s.pushToast);

  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todos");
  const [labelFilter, setLabelFilter] = useState("todos");
  const [responsibleFilter, setResponsibleFilter] = useState("todos");
  const [sort, setSort] = useState("personalizada");

  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [scheduleProjectId, setScheduleProjectId] = useState<string | null>(null);

  const allLabels = useMemo(() => Array.from(new Set(projects.flatMap((p) => p.labels))), [projects]);
  const allResponsibles = useMemo(() => Array.from(new Set(projects.map((p) => p.responsible).filter(Boolean))), [projects]);

  const filtered = useMemo(() => {
    let list = projects.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (formatFilter !== "todos" && p.format !== formatFilter) return false;
      if (priorityFilter !== "todos" && p.priority !== priorityFilter) return false;
      if (labelFilter !== "todos" && !p.labels.includes(labelFilter)) return false;
      if (responsibleFilter !== "todos" && p.responsible !== responsibleFilter) return false;
      return true;
    });

    if (sort === "criacao") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "publicacao") list = [...list].sort((a, b) => (b.scheduledDate ?? "").localeCompare(a.scheduledDate ?? ""));
    else if (sort === "prioridade") list = [...list].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
    else if (sort === "atualizacao") list = [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return list;
  }, [projects, search, formatFilter, priorityFilter, labelFilter, responsibleFilter, sort]);

  const detailProject = projects.find((p) => p.id === detailProjectId) ?? null;
  const scheduleProject = projects.find((p) => p.id === scheduleProjectId) ?? null;

  function handleMoveStage(id: string, stage: KanbanStage) {
    moveKanbanStage(id, stage);
    pushToast("Status do conteúdo atualizado.", "success");
  }

  function cardHandlers(project: Project) {
    return {
      onOpenDesign: () => navigate(`/design?contentProjectId=${project.id}`),
      onOpenSchedule: () => setScheduleProjectId(project.id),
      onOpenEdit: () => setDetailProjectId(project.id),
      onOpenView: () => setDetailProjectId(project.id),
      onDuplicate: () => {
        duplicateProject(project.id);
        pushToast("Card duplicado", "success");
      },
      onDelete: () => {
        removeProject(project.id);
        pushToast("Card excluído", "success");
      },
      onMoveStage: (stage: KanbanStage) => handleMoveStage(project.id, stage),
      onToggleFavorite: () => toggleFavorite(project.id),
    };
  }

  function handleManualCreate(data: {
    title: string;
    format: import("@/types").ContentFormat;
    objective: string;
    priority: Priority;
    responsible: string;
    platform: string;
    labels: string[];
    dueDate: string;
    notes: string;
  }) {
    useContentStore.getState().createProject({
      title: data.title,
      format: data.format,
      objective: data.objective || "engajar",
      priority: data.priority,
      responsible: data.responsible || user?.name || "",
      platform: data.platform,
      labels: data.labels,
      scheduledDate: data.dueDate || undefined,
      content: { format: "post", data: { title: data.title, caption: "", cta: "", notes: data.notes } },
    });
    pushToast("Card criado em Conteúdo Escrito", "success");
  }

  function handleAiPlan(cards: { title: string; format: import("@/types").ContentFormat; dueDate: string; notes: string }[]) {
    cards.forEach((c) => {
      useContentStore.getState().createProject({
        title: c.title,
        format: c.format,
        objective: "engajar",
        responsible: user?.name || "",
        scheduledDate: c.dueDate,
        content: { format: "post", data: { title: c.title, caption: "", cta: "", notes: c.notes } },
      });
    });
    pushToast(`${cards.length} cards criados com o planejamento de IA`, "success");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Organização de Conteúdo"
        description="Acompanhe todo o processo de produção — do roteiro à validação dos resultados — em um quadro Kanban."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" icon={<Sparkles className="size-4" />} onClick={() => setAiModalOpen(true)}>
              Gerar planejamento com IA
            </Button>
            <Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => setManualModalOpen(true)}>
              Adicionar card manualmente
            </Button>
            <Button icon={<Sparkles className="size-4" />} onClick={() => navigate("/create")}>
              Criar conteúdo
            </Button>
          </div>
        }
      />

      <Card className="p-4 mb-6 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input icon={<Search className="size-4" />} placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} className="min-w-[150px]">
            <option value="todos">Todo formato</option>
            <option value="reels">{FORMAT_LABEL.reels}</option>
            <option value="carousel">{FORMAT_LABEL.carousel}</option>
            <option value="stories">{FORMAT_LABEL.stories}</option>
            <option value="post">{FORMAT_LABEL.post}</option>
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="min-w-[150px]">
            <option value="todos">Toda prioridade</option>
            {(["urgente", "alta", "media", "baixa"] as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </Select>
          <Select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)} className="min-w-[140px]">
            <option value="todos">Toda etiqueta</option>
            {allLabels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <Select value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)} className="min-w-[160px]">
            <option value="todos">Todo responsável</option>
            {allResponsibles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="min-w-[180px]">
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Tabs tabs={VIEW_TABS} active={view} onChange={setView} />
          <span className="text-xs text-ink-400 hidden sm:flex items-center gap-1.5 ml-2">
            {view === "kanban" ? <KanbanIcon className="size-3.5" /> : <LayoutList className="size-3.5" />}
            {filtered.length} conteúdo{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<KanbanIcon className="size-6" />}
            title="Nenhum conteúdo por aqui ainda"
            description="Crie um conteúdo ou adicione um card manualmente para começar a organizar sua produção."
          />
        </Card>
      ) : view === "kanban" ? (
        <KanbanBoard projects={filtered} onMoveStage={handleMoveStage} onReorderColumn={reorderKanbanColumn} cardHandlers={cardHandlers} />
      ) : (
        <Card className="p-4">
          <div className="flex flex-col divide-y divide-ink-800">
            {filtered.map((p) => {
              const Icon = FORMAT_ICON[p.format];
              return (
                <button
                  key={p.id}
                  onClick={() => setDetailProjectId(p.id)}
                  className="flex items-center gap-3 py-3 text-left hover:bg-ink-850/50 transition-colors px-2 rounded-lg"
                >
                  <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-ink-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-ink-300">
                      {FORMAT_LABEL[p.format]} · {formatDate(p.createdAt)} · {p.responsible || "Sem responsável"}
                    </p>
                  </div>
                  <Badge>{PRIORITY_LABEL[p.priority]}</Badge>
                  <Badge>{KANBAN_STAGE_LABEL[p.kanbanStage]}</Badge>
                  <StatusBadge status={p.status} />
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <ManualCardModal open={manualModalOpen} onClose={() => setManualModalOpen(false)} onCreate={handleManualCreate} />
      <AIPlanningModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onGenerate={handleAiPlan} brand={brand} />
      {detailProject && <CardDetailPanel project={detailProject} onClose={() => setDetailProjectId(null)} />}
      {scheduleProject && (
        <ScheduleModal
          open
          onClose={() => setScheduleProjectId(null)}
          onConfirm={(data) => {
            addCalendarEntry({
              title: scheduleProject.title,
              format: scheduleProject.format,
              date: data.date,
              time: data.time,
              status: data.status,
              notes: data.notes,
              projectId: scheduleProject.id,
            });
            updateProject(scheduleProject.id, { status: data.status, scheduledDate: data.date, scheduledTime: data.time });
            pushToast("Publicação agendada no calendário", "success");
          }}
        />
      )}
    </div>
  );
}
