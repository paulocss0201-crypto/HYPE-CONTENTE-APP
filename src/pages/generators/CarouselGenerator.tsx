import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, Textarea, ChipGroup, Card, EmptyState, Switch } from "@/components/ui";
import { CarouselResultView, ContentToolbar, GenerationLoader, ResultActionsBar, ScheduleModal, VersionHistoryPanel } from "@/components/content";
import { useContentGenerator } from "@/hooks/useContentGenerator";
import { useBrandStore } from "@/store/brandStore";
import { useContentStore } from "@/store/contentStore";
import { useUiStore } from "@/store/uiStore";
import { OBJECTIVE_OPTIONS } from "@/types";
import type { ContentFormat, GenerationRequest, ProjectStatus } from "@/types";
import { newSalt, repurposeContent } from "@/lib/ai";
import { contentToText, copyToClipboard, downloadTextFile, exportAsDocument } from "@/lib/exportContent";
import { Layers, History } from "lucide-react";
import type { GeneratorNavState } from "./GeneratorNavState";

const SLIDE_COUNT_OPTIONS = [
  { key: "5", label: "5 slides" },
  { key: "7", label: "7 slides" },
  { key: "8", label: "8 slides" },
  { key: "10", label: "10 slides" },
];

export function CarouselGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as GeneratorNavState | null;

  const brand = useBrandStore((s) => s.profile);
  const pushToast = useUiStore((s) => s.pushToast);
  const createProject = useContentStore((s) => s.createProject);
  const updateProjectContent = useContentStore((s) => s.updateProjectContent);
  const toggleFavorite = useContentStore((s) => s.toggleFavorite);
  const addCalendarEntry = useContentStore((s) => s.addCalendarEntry);
  const updateProject = useContentStore((s) => s.updateProject);
  const projects = useContentStore((s) => s.projects);

  const { content, setContent, generating, generate, regenerateAll, refine } = useContentGenerator();

  const [theme, setTheme] = useState(navState?.theme ?? "");
  const [offer, setOffer] = useState(navState?.offer ?? brand.offer ?? "");
  const [objective, setObjective] = useState(navState?.objective ?? "educar");
  const [slideCount, setSlideCount] = useState("8");
  const [audience, setAudience] = useState(navState?.audience ?? "");
  const [cta, setCta] = useState(navState?.cta ?? "");
  const [extra, setExtra] = useState(navState?.extra ?? "");
  const [useBrandInfo, setUseBrandInfo] = useState(navState?.useBrandInfo ?? true);
  const [errors, setErrors] = useState<{ theme?: string; objective?: string }>({});

  const [projectId, setProjectId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const autoTriggered = useRef(false);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (navState?.transformedContent && navState.transformedContent.format === "carousel") {
      setContent(navState.transformedContent);
      setTheme(navState.transformedTitle ?? theme);
      pushToast("Conteúdo transformado em carrossel", "success");
      window.history.replaceState({}, "");
    } else if (navState?.autoGenerate && !autoTriggered.current) {
      autoTriggered.current = true;
      handleGenerate();
      window.history.replaceState({}, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildRequest(): GenerationRequest {
    return {
      format: "carousel",
      theme,
      offer,
      objective,
      audience,
      tone: brand.tone || "profissional",
      creativity: 60,
      cta,
      extra,
      useBrandInfo,
      slideCount: Number(slideCount),
    };
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!theme.trim()) e.theme = "Preencha o tema do conteúdo para continuar.";
    if (!objective) e.objective = "Selecione pelo menos um objetivo.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleGenerate() {
    if (!validate()) return;
    try {
      await generate(buildRequest());
      setProjectId(null);
    } catch {
      pushToast("Não foi possível gerar o conteúdo. Tente novamente.", "error");
    }
  }

  function handleSave() {
    if (!content) return;
    if (!projectId) {
      const p = createProject({ title: theme ? `Carrossel: ${theme}` : "Carrossel", format: "carousel", objective, content });
      setProjectId(p.id);
      pushToast("Projeto salvo", "success");
    } else {
      updateProjectContent(projectId, content, "Edição manual");
      pushToast("Nova versão criada", "success");
    }
  }

  function handleFavorite() {
    if (!projectId) {
      handleSave();
      setTimeout(() => pushToast("Adicionado aos favoritos", "success"), 50);
      return;
    }
    toggleFavorite(projectId);
    pushToast(project?.favorite ? "Removido dos favoritos" : "Adicionado aos favoritos", "success");
  }

  async function handleCopy() {
    if (!content) return;
    await copyToClipboard(contentToText(content, theme ? `Carrossel: ${theme}` : "Carrossel"));
    pushToast("Conteúdo copiado", "success");
  }

  function handleExportText() {
    if (!content) return;
    downloadTextFile(contentToText(content, theme), `carrossel-${Date.now()}.txt`);
  }

  function handleExportDocument() {
    if (!content) return;
    exportAsDocument(contentToText(content, theme), theme || "Carrossel");
  }

  function handleSchedule(data: { date: string; time: string; status: ProjectStatus; notes: string }) {
    if (!projectId) handleSave();
    addCalendarEntry({
      title: theme ? `Carrossel: ${theme}` : "Carrossel",
      format: "carousel",
      date: data.date,
      time: data.time,
      status: data.status,
      notes: data.notes,
      projectId: projectId ?? undefined,
    });
    if (projectId) updateProject(projectId, { status: data.status, scheduledDate: data.date, scheduledTime: data.time });
    pushToast("Publicação agendada no calendário", "success");
  }

  function handleRegenerateAll() {
    regenerateAll();
    if (projectId && content) updateProjectContent(projectId, content, "Regeneração completa");
  }

  function handleTransform(target: ContentFormat) {
    if (!content) return;
    const transformed = repurposeContent(content, target, brand, newSalt());
    navigate(`/create/${target}`, { state: { transformedContent: transformed, transformedTitle: theme } satisfies GeneratorNavState });
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader title="Carrosséis para Instagram" description="Transforme ideias em carrosséis educativos, persuasivos e prontos para publicar." />

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
        <Card className="p-5 lg:sticky lg:top-6 flex flex-col gap-4">
          <Input label="Tema do conteúdo" placeholder="Ex: como organizar as finanças" value={theme} onChange={(e) => setTheme(e.target.value)} error={errors.theme} />
          <Input label="Produto ou serviço relacionado" placeholder="Opcional" value={offer} onChange={(e) => setOffer(e.target.value)} />
          <ChipGroup label="Objetivo do conteúdo" options={OBJECTIVE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))} value={objective} onChange={setObjective} error={errors.objective} />
          <ChipGroup label="Quantidade de slides" options={SLIDE_COUNT_OPTIONS} value={slideCount} onChange={setSlideCount} />

          <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-3">
            <Switch checked={useBrandInfo} onChange={setUseBrandInfo} label="Usar informações salvas da minha marca" description="Preenche público e tom automaticamente" />
          </div>

          {!useBrandInfo && <Textarea label="Público-alvo" rows={2} value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Opcional" />}

          <Input label="Chamada para ação desejada" placeholder="Opcional" value={cta} onChange={(e) => setCta(e.target.value)} />
          <Textarea label="Informações adicionais" rows={2} value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Opcional" />

          <Button size="lg" onClick={handleGenerate} loading={generating} className="mt-2">
            Gerar conteúdo com IA
          </Button>
        </Card>

        <div className="flex flex-col gap-4 min-w-0">
          {generating ? (
            <Card>
              <GenerationLoader />
            </Card>
          ) : content && content.format === "carousel" ? (
            <>
              <ContentToolbar currentFormat="carousel" onRefine={refine} onRegenerateAll={handleRegenerateAll} onTransform={handleTransform} />
              <Button variant="ghost" size="sm" icon={<History className="size-3.5" />} onClick={() => setHistoryOpen(true)} className="self-end">
                Histórico de versões {project ? `(${project.versions.length})` : ""}
              </Button>
              <CarouselResultView content={content.data} onChange={(data) => setContent({ format: "carousel", data })} />
              <ResultActionsBar
                onCopy={handleCopy}
                onSave={handleSave}
                onFavorite={handleFavorite}
                onExportText={handleExportText}
                onExportDocument={handleExportDocument}
                onSchedule={() => setScheduleOpen(true)}
                favorite={!!project?.favorite}
                saved={!!projectId}
              />
            </>
          ) : (
            <Card>
              <EmptyState icon={<Layers className="size-6" />} title="Seu carrossel aparecerá aqui" description="Preencha o formulário ao lado e clique em “Gerar conteúdo com IA” para criar seu primeiro carrossel." />
            </Card>
          )}
        </div>
      </div>

      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} onConfirm={handleSchedule} />
      {project && (
        <VersionHistoryPanel
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          versions={project.versions}
          onRestore={(id) => useContentStore.getState().restoreVersion(project.id, id)}
          onDelete={(id) => useContentStore.getState().deleteVersion(project.id, id)}
          onRename={(id, label) => useContentStore.getState().renameVersion(project.id, id, label)}
        />
      )}
    </div>
  );
}
