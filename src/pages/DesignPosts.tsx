import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, EmptyState } from "@/components/ui";
import {
  ReelResultView,
  CarouselResultView,
  StoriesResultView,
  PostResultView,
  ResultActionsBar,
  ScheduleModal,
  VersionHistoryPanel,
} from "@/components/content";
import { useContentStore } from "@/store/contentStore";
import { useBrandStore } from "@/store/brandStore";
import { useUiStore } from "@/store/uiStore";
import { FORMAT_LABEL } from "@/types";
import { contentToText, copyToClipboard, downloadTextFile, exportAsDocument } from "@/lib/exportContent";
import { ChevronLeft, Palette, History } from "lucide-react";

export function DesignPosts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useContentStore((s) => s.projects.find((p) => p.id === id));
  const updateProject = useContentStore((s) => s.updateProject);
  const updateProjectContent = useContentStore((s) => s.updateProjectContent);
  const toggleFavorite = useContentStore((s) => s.toggleFavorite);
  const addCalendarEntry = useContentStore((s) => s.addCalendarEntry);
  const brand = useBrandStore((s) => s.profile);
  const pushToast = useUiStore((s) => s.pushToast);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!project) {
    return (
      <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
        <Card>
          <EmptyState title="Conteúdo não encontrado" description="Esse card pode ter sido removido." action={<Button onClick={() => navigate("/organizacao")}>Voltar para Organização</Button>} />
        </Card>
      </div>
    );
  }

  const content = project.content;
  const slideCount = content.format === "carousel" ? content.data.slides.length : content.format === "reels" ? content.data.scenes.length : content.format === "stories" ? content.data.stories.length : undefined;

  function handleChange(newContent: typeof content) {
    updateProject(project!.id, { content: newContent });
  }

  async function handleCopy() {
    await copyToClipboard(contentToText(content, project!.title));
    pushToast("Conteúdo copiado", "success");
  }

  function handleSave() {
    updateProjectContent(project!.id, content, "Edição no Design de Posts");
    pushToast("Projeto salvo", "success");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <button onClick={() => navigate("/organizacao")} className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white transition-colors mb-4">
        <ChevronLeft className="size-4" /> Voltar para Organização de Conteúdo
      </button>

      <PageHeader title="Design de Posts" description={`Editando: ${project.title}`} />

      <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <Card className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-ink-300" />
              <p className="text-sm font-semibold">Identidade visual da marca</p>
            </div>
            <MetaRow label="Marca" value={brand.brandName || "—"} />
            <MetaRow label="Tom de voz" value={brand.tone || "—"} />
            <MetaRow label="Segmento" value={brand.segment || "—"} />
            <MetaRow label="Palavras a usar" value={brand.wordsToUse || "—"} />
            <MetaRow label="Palavras a evitar" value={brand.wordsToAvoid || "—"} />
            <Button variant="ghost" size="sm" onClick={() => navigate("/brand")} className="self-start !px-0">
              Editar perfil da marca
            </Button>
          </Card>

          <Card className="p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold">Resumo do conteúdo</p>
            <MetaRow label="Formato" value={FORMAT_LABEL[project.format]} />
            <MetaRow label="Objetivo" value={String(project.objective)} />
            {slideCount !== undefined && <MetaRow label="Quantidade de itens" value={String(slideCount)} />}
            <MetaRow label="Chamada para ação" value={"cta" in content.data ? content.data.cta : ""} />
          </Card>

          <Button variant="outline" size="sm" icon={<History className="size-3.5" />} onClick={() => setHistoryOpen(true)}>
            Histórico de versões ({project.versions.length})
          </Button>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          {content.format === "reels" && <ReelResultView content={content.data} onChange={(data) => handleChange({ format: "reels", data })} />}
          {content.format === "carousel" && <CarouselResultView content={content.data} onChange={(data) => handleChange({ format: "carousel", data })} />}
          {content.format === "stories" && <StoriesResultView content={content.data} onChange={(data) => handleChange({ format: "stories", data })} />}
          {content.format === "post" && <PostResultView content={content.data} onChange={(data) => handleChange({ format: "post", data })} />}

          <ResultActionsBar
            onCopy={handleCopy}
            onSave={handleSave}
            onFavorite={() => toggleFavorite(project.id)}
            onExportText={() => downloadTextFile(contentToText(content, project.title), `${project.title}.txt`)}
            onExportDocument={() => exportAsDocument(contentToText(content, project.title), project.title)}
            onSchedule={() => setScheduleOpen(true)}
            favorite={project.favorite}
            saved
          />
        </div>
      </div>

      <ScheduleModal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(data) => {
          addCalendarEntry({ title: project.title, format: project.format, date: data.date, time: data.time, status: data.status, notes: data.notes, projectId: project.id });
          updateProject(project.id, { status: data.status, scheduledDate: data.date, scheduledTime: data.time });
          pushToast("Publicação agendada no calendário", "success");
        }}
      />
      <VersionHistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={project.versions}
        onRestore={(vid) => useContentStore.getState().restoreVersion(project.id, vid)}
        onDelete={(vid) => useContentStore.getState().deleteVersion(project.id, vid)}
        onRename={(vid, label) => useContentStore.getState().renameVersion(project.id, vid, label)}
      />
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
      <p className="text-sm text-ink-100">{value || "—"}</p>
    </div>
  );
}
