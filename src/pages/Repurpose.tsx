import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Textarea, ChipGroup, Card, EmptyState } from "@/components/ui";
import { GenerationLoader, ReelResultView, CarouselResultView, StoriesResultView, ResultActionsBar } from "@/components/content";
import { useBrandStore } from "@/store/brandStore";
import { useContentStore } from "@/store/contentStore";
import { useUiStore } from "@/store/uiStore";
import type { ContentFormat, GeneratedContent } from "@/types";
import { newSalt, repurposeFromText } from "@/lib/ai";
import { contentToText, copyToClipboard, downloadTextFile, exportAsDocument } from "@/lib/exportContent";
import { Repeat, Sparkles } from "lucide-react";

const FORMAT_OPTIONS = [
  { key: "reels", label: "Roteiro de Reels" },
  { key: "carousel", label: "Carrossel" },
  { key: "stories", label: "Sequência de Stories" },
];

export function Repurpose() {
  const brand = useBrandStore((s) => s.profile);
  const pushToast = useUiStore((s) => s.pushToast);
  const createProject = useContentStore((s) => s.createProject);
  const toggleFavorite = useContentStore((s) => s.toggleFavorite);
  const projects = useContentStore((s) => s.projects);

  const [rawText, setRawText] = useState("");
  const [target, setTarget] = useState<ContentFormat>("carousel");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId);

  async function handleTransform() {
    if (!rawText.trim()) {
      setError("Cole um conteúdo existente para continuar.");
      return;
    }
    setError("");
    setGenerating(true);
    setProjectId(null);
    await new Promise((r) => setTimeout(r, 2600));
    const result = repurposeFromText(rawText, target, brand, newSalt());
    setContent(result);
    setGenerating(false);
  }

  function handleSave() {
    if (!content) return;
    if (!projectId) {
      const p = createProject({ title: "Conteúdo reaproveitado", format: content.format, objective: "engajar", content });
      setProjectId(p.id);
      pushToast("Projeto salvo", "success");
    }
  }

  function handleFavorite() {
    if (!projectId) {
      handleSave();
      setTimeout(() => pushToast("Adicionado aos favoritos", "success"), 50);
      return;
    }
    toggleFavorite(projectId);
    pushToast("Adicionado aos favoritos", "success");
  }

  async function handleCopy() {
    if (!content) return;
    await copyToClipboard(contentToText(content, "Conteúdo reaproveitado"));
    pushToast("Conteúdo copiado", "success");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader
        title="Reaproveitar conteúdo"
        description="Cole um conteúdo já existente e transforme-o em outro formato — de Reels para carrossel, de carrossel para Stories, e muito mais."
      />

      <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
        <Card className="p-5 lg:sticky lg:top-6 flex flex-col gap-4">
          <Textarea
            label="Cole o conteúdo existente"
            rows={10}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setError("");
            }}
            error={error}
            placeholder="Cole aqui um roteiro, legenda, texto ou ideia que você já tem..."
          />
          <ChipGroup label="Transformar em" options={FORMAT_OPTIONS} value={target} onChange={(v) => setTarget(v as ContentFormat)} />
          <Button size="lg" icon={<Repeat className="size-4" />} onClick={handleTransform} loading={generating}>
            Transformar conteúdo
          </Button>
        </Card>

        <div className="flex flex-col gap-4 min-w-0">
          {generating ? (
            <Card>
              <GenerationLoader />
            </Card>
          ) : content ? (
            <>
              {content.format === "reels" && <ReelResultView content={content.data} onChange={(data) => setContent({ format: "reels", data })} />}
              {content.format === "carousel" && <CarouselResultView content={content.data} onChange={(data) => setContent({ format: "carousel", data })} />}
              {content.format === "stories" && <StoriesResultView content={content.data} onChange={(data) => setContent({ format: "stories", data })} />}
              <ResultActionsBar
                onCopy={handleCopy}
                onSave={handleSave}
                onFavorite={handleFavorite}
                onExportText={() => downloadTextFile(contentToText(content, "conteudo-reaproveitado"), `reaproveitado-${Date.now()}.txt`)}
                onExportDocument={() => exportAsDocument(contentToText(content, "Conteúdo reaproveitado"), "Conteúdo reaproveitado")}
                onSchedule={() => pushToast("Salve o projeto para agendá-lo no calendário", "default")}
                favorite={!!project?.favorite}
                saved={!!projectId}
              />
            </>
          ) : (
            <Card>
              <EmptyState
                icon={<Sparkles className="size-6" />}
                title="Seu novo formato aparecerá aqui"
                description="Cole um conteúdo já existente, escolha o novo formato e clique em “Transformar conteúdo”."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
