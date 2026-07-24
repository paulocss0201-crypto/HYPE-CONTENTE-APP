import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Input, Textarea, ChipGroup, Select, Tabs, Badge } from "@/components/ui";
import type { ChecklistItem, ContentMetrics, Project } from "@/types";
import { PRIORITY_LABEL, KANBAN_STAGE_LABEL, SUGGESTED_LABELS } from "@/types";
import { useContentStore } from "@/store/contentStore";
import { useBrandStore } from "@/store/brandStore";
import { useUiStore } from "@/store/uiStore";
import { analyzeContentResults, newSalt } from "@/lib/ai";
import { formatDateTime, uid } from "@/lib/utils";
import { Plus, Trash2, Brush, Sparkles, History, CheckSquare, FileText, BarChart3 } from "lucide-react";

const TABS = [
  { key: "detalhes", label: "Detalhes" },
  { key: "checklist", label: "Checklist" },
  { key: "historico", label: "Histórico" },
  { key: "resultados", label: "Resultados" },
];

const METRIC_FIELDS: { key: keyof ContentMetrics; label: string }[] = [
  { key: "views", label: "Visualizações" },
  { key: "reach", label: "Alcance" },
  { key: "likes", label: "Curtidas" },
  { key: "comments", label: "Comentários" },
  { key: "shares", label: "Compartilhamentos" },
  { key: "saves", label: "Salvamentos" },
  { key: "newFollowers", label: "Novos seguidores" },
  { key: "clicks", label: "Cliques" },
  { key: "leads", label: "Leads" },
  { key: "sales", label: "Vendas" },
];

export function CardDetailPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const navigate = useNavigate();
  const updateProject = useContentStore((s) => s.updateProject);
  const brand = useBrandStore((s) => s.profile);
  const pushToast = useUiStore((s) => s.pushToast);

  const [tab, setTab] = useState("detalhes");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [metricsDraft, setMetricsDraft] = useState<ContentMetrics>(project.metrics ?? {});
  const [customLabel, setCustomLabel] = useState("");

  function patch(p: Partial<Project>) {
    updateProject(project.id, p);
  }

  function toggleChecklistItem(id: string) {
    const checklist = project.checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    patch({ checklist });
  }

  function removeChecklistItem(id: string) {
    patch({ checklist: project.checklist.filter((c) => c.id !== id) });
  }

  function addChecklistItem() {
    const text = newChecklistItem.trim();
    if (!text) return;
    const item: ChecklistItem = { id: uid("chk"), text, done: false };
    patch({ checklist: [...project.checklist, item] });
    setNewChecklistItem("");
  }

  function toggleLabel(label: string) {
    const labels = project.labels.includes(label) ? project.labels.filter((l) => l !== label) : [...project.labels, label];
    patch({ labels });
  }

  function addCustomLabel() {
    const value = customLabel.trim();
    if (value && !project.labels.includes(value)) patch({ labels: [...project.labels, value] });
    setCustomLabel("");
  }

  function handleAnalyze() {
    const analysis = analyzeContentResults(metricsDraft, project.content, brand, newSalt());
    patch({ metrics: metricsDraft, aiAnalysis: analysis, kanbanStage: "validado" });
    pushToast("Análise de resultados gerada", "success");
  }

  function handleCreateFromResult() {
    onClose();
    navigate("/create", { state: { theme: project.title } });
  }

  const content = project.content;
  const previewCaption = content.format === "reels" ? content.data.caption : content.format === "carousel" ? content.data.caption : content.format === "post" ? content.data.caption : content.data.stories[0]?.mainText ?? "";
  const previewCta = content.format === "stories" ? content.data.stories[content.data.stories.length - 1]?.cta ?? "" : content.data.cta;

  const checklistDone = project.checklist.filter((c) => c.done).length;

  return (
    <Modal open onClose={onClose} title={project.title} size="lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Badge>{KANBAN_STAGE_LABEL[project.kanbanStage]}</Badge>
        </div>

        {tab === "detalhes" && (
          <div className="flex flex-col gap-4">
            <Input label="Título" value={project.title} onChange={(e) => patch({ title: e.target.value })} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Objetivo" value={String(project.objective)} onChange={(e) => patch({ objective: e.target.value })} />
              <Input label="Responsável" value={project.responsible} onChange={(e) => patch({ responsible: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Select label="Plataforma" value={project.platform} onChange={(e) => patch({ platform: e.target.value })}>
                <option value="Instagram">Instagram</option>
                <option value="Instagram Reels">Instagram Reels</option>
                <option value="Instagram Stories">Instagram Stories</option>
              </Select>
              <Input label="Data prevista de publicação" type="date" value={project.scheduledDate ?? ""} onChange={(e) => patch({ scheduledDate: e.target.value })} />
            </div>
            <ChipGroup
              label="Prioridade"
              options={(["baixa", "media", "alta", "urgente"] as const).map((p) => ({ key: p, label: PRIORITY_LABEL[p] }))}
              value={project.priority}
              onChange={(v) => patch({ priority: v as Project["priority"] })}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-ink-100">Etiquetas</label>
              <ChipGroup options={SUGGESTED_LABELS.map((l) => ({ key: l, label: l }))} value={project.labels} onChange={toggleLabel} multi />
              <div className="flex gap-2">
                <Input placeholder="Etiqueta personalizada" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomLabel()} />
                <Button variant="outline" size="sm" onClick={addCustomLabel}>
                  Adicionar
                </Button>
              </div>
            </div>
            <Textarea label="Observações" rows={3} value={project.notes ?? ""} onChange={(e) => patch({ notes: e.target.value })} />

            <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-ink-300" />
                <p className="text-sm font-semibold">Prévia do conteúdo</p>
              </div>
              <p className="text-xs text-ink-300 line-clamp-3 whitespace-pre-line">{previewCaption}</p>
              {previewCta && <p className="text-xs text-ink-400">CTA: {previewCta}</p>}
              <Button
                size="sm"
                variant="outline"
                icon={<Brush className="size-3.5" />}
                className="self-start mt-1"
                onClick={() => {
                  onClose();
                  navigate(`/design/${project.id}`);
                }}
              >
                Abrir no Design de Posts
              </Button>
            </div>
          </div>
        )}

        {tab === "checklist" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-ink-300">
              <CheckSquare className="size-4" />
              {checklistDone}/{project.checklist.length} etapas concluídas
            </div>
            <div className="flex flex-col gap-1.5">
              {project.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-ink-850">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`size-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${item.done ? "bg-white border-white" : "border-ink-500"}`}
                  >
                    {item.done && <span className="block size-2 rounded-sm bg-ink-950" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.done ? "text-ink-400 line-through" : "text-ink-100"}`}>{item.text}</span>
                  <button onClick={() => removeChecklistItem(item.id)} className="text-ink-400 hover:text-danger p-1">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Novo item do checklist" value={newChecklistItem} onChange={(e) => setNewChecklistItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addChecklistItem()} />
              <Button variant="outline" size="sm" icon={<Plus className="size-3.5" />} onClick={addChecklistItem}>
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {tab === "historico" && (
          <div className="flex flex-col gap-2">
            {[...project.kanbanHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-700 px-3 py-2.5">
                <History className="size-4 text-ink-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white">{KANBAN_STAGE_LABEL[h.stage]}</p>
                  <p className="text-xs text-ink-400">{formatDateTime(h.at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "resultados" && (
          <div className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {METRIC_FIELDS.map((f) => (
                <Input
                  key={f.key}
                  label={f.label}
                  type="number"
                  min={0}
                  value={metricsDraft[f.key] ?? ""}
                  onChange={(e) => setMetricsDraft((m) => ({ ...m, [f.key]: e.target.value ? Number(e.target.value) : undefined }))}
                />
              ))}
            </div>
            <Textarea
              label="Observações"
              rows={2}
              value={metricsDraft.notes ?? ""}
              onChange={(e) => setMetricsDraft((m) => ({ ...m, notes: e.target.value }))}
            />
            <Button icon={<Sparkles className="size-4" />} onClick={handleAnalyze} className="self-start">
              {project.aiAnalysis ? "Reanalisar com IA" : "Salvar e analisar com IA"}
            </Button>

            {project.aiAnalysis && (
              <div className="flex flex-col gap-3 rounded-xl border border-ink-700 bg-ink-900/50 p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-ink-300" />
                  <p className="text-sm font-semibold">Análise da Inteligência Artificial</p>
                </div>
                <AnalysisRow label="O que funcionou" value={project.aiAnalysis.whatWorked} />
                <AnalysisRow label="O que pode ser melhorado" value={project.aiAnalysis.whatToImprove} />
                <AnalysisRow label="Principal gatilho" value={project.aiAnalysis.mainTrigger} />
                <AnalysisRow label="Elementos para reutilizar" value={project.aiAnalysis.elementsToReuse} />
                <div>
                  <p className="text-xs font-medium text-ink-300 mb-1">SUGESTÕES PARA NOVA VERSÃO</p>
                  <ul className="flex flex-col gap-1">
                    {project.aiAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-ink-100">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-300 mb-1">IDEIAS DE CONTEÚDOS SEMELHANTES</p>
                  <ul className="flex flex-col gap-1">
                    {project.aiAnalysis.similarIdeas.map((s, i) => (
                      <li key={i} className="text-sm text-ink-100">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="secondary" icon={<Sparkles className="size-4" />} onClick={handleCreateFromResult} className="self-start">
                  Criar novo conteúdo baseado neste resultado
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-ink-300 mb-1">{label.toUpperCase()}</p>
      <p className="text-sm text-ink-100">{value}</p>
    </div>
  );
}
