import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Tabs, Modal, Input, Select, Textarea, ChipGroup, Card, EmptyState, Badge } from "@/components/ui";
import { useContentStore } from "@/store/contentStore";
import { useBrandStore } from "@/store/brandStore";
import { useUiStore } from "@/store/uiStore";
import type { CalendarEntry, ContentFormat, ProjectStatus } from "@/types";
import { STATUS_LABEL, MAIN_GOAL_OPTIONS } from "@/types";
import { generateCalendarPlan, newSalt } from "@/lib/ai";
import { FORMAT_ICON } from "@/lib/formatIcons";
import { ChevronLeft, ChevronRight, Plus, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VIEW_TABS = [
  { key: "month", label: "Mensal" },
  { key: "week", label: "Semanal" },
  { key: "list", label: "Lista" },
];
const FORMAT_OPTIONS = [
  { key: "reels", label: "Reels" },
  { key: "carousel", label: "Carrossel" },
  { key: "stories", label: "Stories" },
];

export function CalendarPage() {
  const entries = useContentStore((s) => s.calendarEntries);
  const addEntry = useContentStore((s) => s.addCalendarEntry);
  const updateEntry = useContentStore((s) => s.updateCalendarEntry);
  const removeEntry = useContentStore((s) => s.removeCalendarEntry);
  const moveEntry = useContentStore((s) => s.moveCalendarEntry);
  const projects = useContentStore((s) => s.projects);
  const brand = useBrandStore((s) => s.profile);
  const pushToast = useUiStore((s) => s.pushToast);

  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date());
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [cursor]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  function openNewEntry(date?: string) {
    setEditingEntry(null);
    setPrefillDate(date);
    setEntryModalOpen(true);
  }

  function openEditEntry(entry: CalendarEntry) {
    setEditingEntry(entry);
    setPrefillDate(undefined);
    setEntryModalOpen(true);
  }

  function handleDrop(date: string) {
    if (draggingId) {
      moveEntry(draggingId, date);
      setDraggingId(null);
      pushToast("Publicação movida", "success");
    }
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader
        title="Calendário de conteúdo"
        description="Organize suas publicações, defina status e planeje sua semana ou mês com apoio da Inteligência Artificial."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<Sparkles className="size-4" />} onClick={() => setAiModalOpen(true)}>
              Gerar calendário com IA
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => openNewEntry()}>
              Nova publicação
            </Button>
          </div>
        }
      />

      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <Tabs tabs={VIEW_TABS} active={view} onChange={setView} />
        {view !== "list" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCursor((c) => (view === "month" ? subMonths(c, 1) : subWeeks(c, 1)))}
              className="p-2 rounded-lg border border-ink-600 hover:bg-ink-800 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-medium w-40 text-center capitalize">
              {view === "month" ? format(cursor, "MMMM yyyy", { locale: ptBR }) : `Semana de ${format(weekDays[0], "dd/MM")}`}
            </p>
            <button
              onClick={() => setCursor((c) => (view === "month" ? addMonths(c, 1) : addWeeks(c, 1)))}
              className="p-2 rounded-lg border border-ink-600 hover:bg-ink-800 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {view === "month" && (
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
            <div key={d} className="text-xs text-ink-400 font-medium px-1 hidden sm:block">
              {d}
            </div>
          ))}
          {monthDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEntries = entriesByDate[key] ?? [];
            return (
              <div
                key={key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(key)}
                className={cn(
                  "min-h-[92px] sm:min-h-[110px] rounded-xl border p-1.5 sm:p-2 flex flex-col gap-1",
                  isSameMonth(day, cursor) ? "border-ink-700 bg-ink-900/40" : "border-ink-800 bg-ink-950/40 opacity-40",
                  isToday(day) && "border-white/40"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs", isToday(day) ? "text-white font-semibold" : "text-ink-300")}>{format(day, "d")}</span>
                  <button onClick={() => openNewEntry(key)} className="text-ink-500 hover:text-white transition-colors">
                    <Plus className="size-3" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto">
                  {dayEntries.slice(0, 3).map((e) => (
                    <EntryChip key={e.id} entry={e} onClick={() => openEditEntry(e)} onDragStart={() => setDraggingId(e.id)} />
                  ))}
                  {dayEntries.length > 3 && <span className="text-[10px] text-ink-400">+{dayEntries.length - 3} mais</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "week" && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEntries = entriesByDate[key] ?? [];
            return (
              <div
                key={key}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(key)}
                className={cn("rounded-xl border p-3 flex flex-col gap-2 min-h-[160px]", isToday(day) ? "border-white/40" : "border-ink-700 bg-ink-900/40")}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">{format(day, "EEE dd", { locale: ptBR })}</p>
                  <button onClick={() => openNewEntry(key)} className="text-ink-500 hover:text-white transition-colors">
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {dayEntries.map((e) => (
                    <EntryChip key={e.id} entry={e} onClick={() => openEditEntry(e)} onDragStart={() => setDraggingId(e.id)} expanded />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "list" && (
        <Card className="p-4">
          {entries.length === 0 ? (
            <EmptyState title="Nenhuma publicação agendada" description="Crie uma publicação manualmente ou gere um calendário completo com IA." />
          ) : (
            <div className="flex flex-col divide-y divide-ink-800">
              {[...entries]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((e) => {
                  const Icon = FORMAT_ICON[e.format];
                  return (
                    <button key={e.id} onClick={() => openEditEntry(e)} className="flex items-center gap-3 py-3 text-left hover:bg-ink-850/50 transition-colors px-2 rounded-lg">
                      <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-ink-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        <p className="text-xs text-ink-300">{format(new Date(e.date + "T00:00:00"), "dd/MM/yyyy")} {e.time && `às ${e.time}`}</p>
                      </div>
                      <Badge tone={e.status === "published" || e.status === "ready" ? "success" : "neutral"}>{STATUS_LABEL[e.status]}</Badge>
                    </button>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      <EntryModal
        key={editingEntry?.id ?? prefillDate ?? "new"}
        open={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
        editingEntry={editingEntry}
        prefillDate={prefillDate}
        projects={projects}
        onSave={(data) => {
          if (editingEntry) {
            updateEntry(editingEntry.id, data);
            pushToast("Publicação atualizada", "success");
          } else {
            addEntry(data);
            pushToast("Publicação criada", "success");
          }
          setEntryModalOpen(false);
        }}
        onDelete={
          editingEntry
            ? () => {
                removeEntry(editingEntry.id);
                setEntryModalOpen(false);
                pushToast("Publicação removida", "success");
              }
            : undefined
        }
      />

      <AICalendarModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onGenerate={(plan) => {
          plan.forEach((e) => addEntry(e));
          setAiModalOpen(false);
          pushToast(`Calendário gerado com ${plan.length} publicações`, "success");
        }}
        brand={brand}
      />
    </div>
  );
}

function EntryChip({
  entry,
  onClick,
  onDragStart,
  expanded,
}: {
  entry: CalendarEntry;
  onClick: () => void;
  onDragStart: () => void;
  expanded?: boolean;
}) {
  const Icon = FORMAT_ICON[entry.format];
  return (
    <button
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg bg-ink-800 border border-ink-600 px-1.5 py-1 text-left hover:border-ink-400 transition-colors cursor-grab active:cursor-grabbing",
        expanded && "flex-col items-start gap-1 p-2"
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="size-3 text-ink-300 shrink-0" />
        <span className="text-[11px] text-white truncate">{entry.title}</span>
      </div>
      {expanded && (
        <div className="flex items-center gap-1.5">
          <Badge tone={entry.status === "published" || entry.status === "ready" ? "success" : "neutral"}>{STATUS_LABEL[entry.status]}</Badge>
          {entry.time && <span className="text-[10px] text-ink-400">{entry.time}</span>}
        </div>
      )}
    </button>
  );
}

function EntryModal({
  open,
  onClose,
  editingEntry,
  prefillDate,
  projects,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  editingEntry: CalendarEntry | null;
  prefillDate?: string;
  projects: ReturnType<typeof useContentStore.getState>["projects"];
  onSave: (data: Omit<CalendarEntry, "id">) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(editingEntry?.title ?? "");
  const [date, setDate] = useState(editingEntry?.date ?? prefillDate ?? "");
  const [time, setTime] = useState(editingEntry?.time ?? "12:00");
  const [format_, setFormat] = useState<ContentFormat>(editingEntry?.format ?? "reels");
  const [status, setStatus] = useState<ProjectStatus>(editingEntry?.status ?? "idea");
  const [notes, setNotes] = useState(editingEntry?.notes ?? "");
  const [projectId, setProjectId] = useState(editingEntry?.projectId ?? "");
  const [error, setError] = useState("");

  function handleSave() {
    if (!title.trim()) {
      setError("Dê um título para a publicação.");
      return;
    }
    if (!date) {
      setError("Selecione uma data.");
      return;
    }
    onSave({ title, date, time, format: format_, status, notes, projectId: projectId || undefined });
  }

  return (
    <Modal open={open} onClose={onClose} title={editingEntry ? "Editar publicação" : "Nova publicação"}>
      <div className="flex flex-col gap-4">
        <Input
          label="Título"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          error={error && !title.trim() ? error : undefined}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={error && !date ? error : undefined} />
          <Input label="Horário" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <ChipGroup label="Formato" options={FORMAT_OPTIONS} value={format_} onChange={(v) => setFormat(v as ContentFormat)} />
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
          {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select label="Associar a um projeto (opcional)" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Nenhum</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </Select>
        <Textarea label="Observações" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-between items-center mt-2">
          {onDelete ? (
            <Button variant="danger" size="sm" icon={<Trash2 className="size-3.5" />} onClick={onDelete}>
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AICalendarModal({
  open,
  onClose,
  onGenerate,
  brand,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (plan: Omit<CalendarEntry, "id">[]) => void;
  brand: ReturnType<typeof useBrandStore.getState>["profile"];
}) {
  const [segment, setSegment] = useState(brand.segment);
  const [objective, setObjective] = useState<string>(brand.mainGoal || "engajamento");
  const [postsPerWeek, setPostsPerWeek] = useState("3");
  const [formats, setFormats] = useState<string[]>(["reels", "carousel", "stories"]);
  const [weeks, setWeeks] = useState("4");
  const [offer, setOffer] = useState(brand.offer);
  const [generating, setGenerating] = useState(false);

  function toggleFormat(key: string) {
    setFormats((f) => (f.includes(key) ? f.filter((x) => x !== key) : [...f, key]));
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1600));
    const plan = generateCalendarPlan(
      {
        segment: segment || "seu segmento",
        objective,
        postsPerWeek: Number(postsPerWeek),
        formats: formats as ContentFormat[],
        weeks: Number(weeks),
        offer,
        startDate: new Date(),
      },
      newSalt()
    );
    setGenerating(false);
    onGenerate(plan.map(({ id: _id, ...rest }) => rest));
  }

  return (
    <Modal open={open} onClose={onClose} title="Gerar calendário com IA" size="lg">
      <div className="flex flex-col gap-4">
        <Input label="Segmento" value={segment} onChange={(e) => setSegment(e.target.value)} />
        <Input label="Produtos ou serviços que serão divulgados" value={offer} onChange={(e) => setOffer(e.target.value)} />
        <ChipGroup
          label="Objetivo"
          options={MAIN_GOAL_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
          value={objective}
          onChange={setObjective}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <Select label="Publicações por semana" value={postsPerWeek} onChange={(e) => setPostsPerWeek(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}x por semana
              </option>
            ))}
          </Select>
          <Select label="Período do planejamento" value={weeks} onChange={(e) => setWeeks(e.target.value)}>
            {[2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n} semanas
              </option>
            ))}
          </Select>
        </div>
        <ChipGroup label="Formatos desejados" options={FORMAT_OPTIONS} value={formats} onChange={toggleFormat} multi />
        <Button icon={<Sparkles className="size-4" />} onClick={handleGenerate} loading={generating}>
          Gerar calendário
        </Button>
      </div>
    </Modal>
  );
}
