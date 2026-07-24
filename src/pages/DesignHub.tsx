import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardHover, Input, Select, Textarea, EmptyState } from "@/components/ui";
import { useContentStore } from "@/store/contentStore";
import { useDesignStore } from "@/store/designStore";
import { useBrandStore } from "@/store/brandStore";
import { useUiStore } from "@/store/uiStore";
import type { DesignFormatKey } from "@/types/design";
import { DESIGN_FORMATS } from "@/types/design";
import { defaultFormatForContent, generateDesignFromContent, newSalt, TEMPLATES, templatesForFormat } from "@/lib/design-ai";
import { emptySlide } from "@/lib/design-ai";
import { FilePlus2, FolderOpen, Kanban as KanbanIcon, LayoutTemplate, Sparkles, ChevronLeft, Search } from "lucide-react";
import { FORMAT_ICON } from "@/lib/formatIcons";
import { FORMAT_LABEL } from "@/types";

type Step = "choose" | "pick-content" | "describe" | "pick-template";

export function DesignHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentProjectIdParam = searchParams.get("contentProjectId");

  const projects = useContentStore((s) => s.projects);
  const updateProject = useContentStore((s) => s.updateProject);
  const createDesign = useDesignStore((s) => s.createDesign);
  const findByContentProjectId = useDesignStore((s) => s.findByContentProjectId);
  const brand = useBrandStore((s) => s.profile);
  const pushToast = useUiStore((s) => s.pushToast);

  const [step, setStep] = useState<Step>("choose");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [formatKey, setFormatKey] = useState<DesignFormatKey>("post-quadrado");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (contentProjectIdParam) {
      const existing = findByContentProjectId(contentProjectIdParam);
      if (existing) {
        navigate(`/design/studio/${existing.id}`, { replace: true });
        return;
      }
      const project = projects.find((p) => p.id === contentProjectIdParam);
      if (project) {
        setSelectedProjectId(project.id);
        setFormatKey(defaultFormatForContent(project.content));
        setStep("describe");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentProjectIdParam]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  const filteredProjects = useMemo(() => projects.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())), [projects, search]);

  function startFromScratch() {
    const design = createDesign({ name: "Novo design", format: formatKey, slides: [emptySlide()] });
    navigate(`/design/studio/${design.id}`);
  }

  function pickProjectAndDescribe(projectId: string) {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setSelectedProjectId(projectId);
    setFormatKey(defaultFormatForContent(project.content));
    setStep("describe");
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1600));
    const content = selectedProject?.content ?? null;
    const slides = generateDesignFromContent(content, formatKey, prompt, selectedProject?.title ?? "Novo design", newSalt());
    const design = createDesign({
      name: selectedProject?.title ?? "Novo design",
      format: formatKey,
      slides,
      contentProjectId: selectedProject?.id,
    });
    if (selectedProject) updateProject(selectedProject.id, { designId: design.id });
    setGenerating(false);
    pushToast("Design gerado com IA", "success");
    navigate(`/design/studio/${design.id}`);
  }

  function applyTemplateAndOpen(templateId: string) {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const format = DESIGN_FORMATS.find((f) => f.key === formatKey) ?? DESIGN_FORMATS[0];
    const built = template.layout({ title: "Seu título aqui", body: "Escreva o texto de apoio deste slide.", cta: "Chamada para ação", palette: template.palette, format });
    const design = createDesign({ name: template.name, format: formatKey, slides: [{ id: `slide_${Date.now()}`, background: built.background, backgroundGradientTo: built.backgroundGradientTo, elements: built.elements }] });
    navigate(`/design/studio/${design.id}`);
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-5xl mx-auto">
      {step !== "choose" && (
        <button onClick={() => setStep("choose")} className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-white transition-colors mb-4">
          <ChevronLeft className="size-4" /> Voltar
        </button>
      )}

      <PageHeader title="Design de Posts" description="Transforme um conteúdo escrito em uma peça visual profissional, direto na plataforma." />

      {step === "choose" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <EntryCard icon={FilePlus2} title="Criar do zero" description="Comece com uma tela em branco." onClick={startFromScratch} />
          <EntryCard icon={FolderOpen} title="Selecionar conteúdo salvo" description="Use um Reels, carrossel, Stories ou post já criado." onClick={() => setStep("pick-content")} />
          <EntryCard icon={KanbanIcon} title="Importar do Kanban" description="Escolha um card da Organização de Conteúdo." onClick={() => setStep("pick-content")} />
          <EntryCard icon={LayoutTemplate} title="Escolher um template" description="Comece a partir de um layout profissional pronto." onClick={() => setStep("pick-template")} />
          <EntryCard icon={Sparkles} title="Gerar com Inteligência Artificial" description="Descreva o estilo e deixe a IA montar a primeira versão." onClick={() => setStep("pick-content")} />
        </div>
      )}

      {step === "pick-content" && (
        <Card className="p-5 flex flex-col gap-4">
          <Input icon={<Search className="size-4" />} placeholder="Buscar conteúdo por título..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {filteredProjects.length === 0 ? (
            <EmptyState title="Nenhum conteúdo encontrado" description="Crie um conteúdo primeiro em “Criar conteúdo” ou continue sem selecionar nenhum." action={<Button onClick={() => setStep("describe")}>Continuar sem conteúdo</Button>} />
          ) : (
            <div className="flex flex-col divide-y divide-ink-800 max-h-[420px] overflow-y-auto">
              {filteredProjects.map((p) => {
                const Icon = FORMAT_ICON[p.format];
                return (
                  <button key={p.id} onClick={() => pickProjectAndDescribe(p.id)} className="flex items-center gap-3 py-3 text-left hover:bg-ink-850/50 transition-colors px-2 rounded-lg">
                    <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-ink-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-ink-300">{FORMAT_LABEL[p.format]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {step === "pick-template" && (
        <div className="flex flex-col gap-4">
          <Select value={formatKey} onChange={(e) => setFormatKey(e.target.value as DesignFormatKey)} className="max-w-sm">
            {DESIGN_FORMATS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </Select>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {templatesForFormat(formatKey).map((t) => (
              <CardHover key={t.id} className="p-0 overflow-hidden cursor-pointer" onClick={() => applyTemplateAndOpen(t.id)}>
                <div className="aspect-[4/5] flex items-end p-3" style={{ background: t.palette.bgTo ? `linear-gradient(160deg, ${t.palette.bg}, ${t.palette.bgTo})` : t.palette.bg }}>
                  <div className="w-full h-2 rounded-full" style={{ background: t.palette.accent }} />
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-ink-400">{t.category}</p>
                  <p className="text-sm text-white truncate">{t.name}</p>
                </div>
              </CardHover>
            ))}
          </div>
        </div>
      )}

      {step === "describe" && (
        <Card className="p-6 flex flex-col gap-4 max-w-xl">
          {selectedProject && (
            <div className="rounded-xl border border-ink-700 bg-ink-900/50 p-3">
              <p className="text-xs text-ink-400 mb-0.5">Conteúdo selecionado</p>
              <p className="text-sm font-medium text-white">{selectedProject.title}</p>
            </div>
          )}
          <Select label="Formato do design" value={formatKey} onChange={(e) => setFormatKey(e.target.value as DesignFormatKey)}>
            {DESIGN_FORMATS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </Select>
          <Textarea
            label="Descreva como você quer o seu design"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Crie um carrossel premium, com fundo preto, tipografia branca, detalhes em cinza, imagens futuristas e uma composição minimalista."
          />
          <p className="text-xs text-ink-400">
            Marca: <span className="text-ink-200">{brand.brandName || "não configurada"}</span> · Tom: <span className="text-ink-200">{brand.tone || "—"}</span>
          </p>
          <Button size="lg" icon={<Sparkles className="size-4" />} onClick={handleGenerate} loading={generating}>
            Gerar design com IA
          </Button>
        </Card>
      )}
    </div>
  );
}

function EntryCard({ icon: Icon, title, description, onClick }: { icon: typeof FilePlus2; title: string; description: string; onClick: () => void }) {
  return (
    <CardHover className="p-6 flex flex-col gap-3 cursor-pointer" onClick={onClick}>
      <div className="size-11 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
        <Icon className="size-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-white mb-1">{title}</p>
        <p className="text-sm text-ink-300">{description}</p>
      </div>
    </CardHover>
  );
}
