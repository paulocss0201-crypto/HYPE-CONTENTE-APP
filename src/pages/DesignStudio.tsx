import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type Konva from "konva";
import { useDesignStore } from "@/store/designStore";
import { useContentStore } from "@/store/contentStore";
import { useUiStore } from "@/store/uiStore";
import type { DesignElement, DesignSlide, SaveState } from "@/types/design";
import { DESIGN_FORMATS } from "@/types/design";
import { DesignCanvas } from "@/components/design/canvas";
import {
  TopBar,
  LeftRail,
  RightPropertiesPanel,
  LayersPanel,
  SlideStrip,
  ImageGenModal,
  PromptAssistantModal,
  ExportModal,
  DesignVersionHistoryModal,
  DesignScoreModal,
  DesignCommandBar,
  ShortcutsModal,
  GridControls,
  useDesignHistory,
} from "@/components/design";
import type { ExportKind } from "@/components/design";
import type { ToolKey, EditMode, GridMode } from "@/components/design/toolTypes";
import { EDIT_MODES } from "@/components/design/toolTypes";
import { TemplatesPanel, TextToolPanel, ElementsToolPanel, BackgroundsToolPanel, UploadsToolPanel, BrandKitPanel, ImagesToolPanel, AIToolPanel } from "@/components/design/panels";
import {
  makeImageElement,
  generateDesignFromContent,
  redesignSlide,
  newSalt,
  extractSlideTexts,
  emptySlide,
  withZIndex,
  applyTextAIAction,
  parseDesignCommand,
  analyzeDesignScore,
  improveHierarchy,
  adaptSlideToFormat,
  reduceDensity,
  computeDensity,
  contrastRatio,
  bestContrastColor,
  MIN_SAFE_CONTRAST,
} from "@/lib/design-ai";
import type { DesignTemplate, DesignScoreResult } from "@/lib/design-ai";
import { validateDesign } from "@/lib/design-ai/validateDesign";
import { downloadDataUrl, exportSlidesAsPdf, exportSlidesAsZip } from "@/lib/design-ai/exportDesign";
import { ScheduleModal } from "@/components/content";
import { EmptyState, Card, Button, Tooltip } from "@/components/ui";
import { uid, cn } from "@/lib/utils";
import { FileQuestion, ZoomIn, ZoomOut, CheckSquare2, Gauge } from "lucide-react";

export function DesignStudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const design = useDesignStore((s) => s.designs.find((d) => d.id === id));
  const updateDesign = useDesignStore((s) => s.updateDesign);
  const updateSlides = useDesignStore((s) => s.updateSlides);
  const pushVersion = useDesignStore((s) => s.pushVersion);
  const restoreVersion = useDesignStore((s) => s.restoreVersion);
  const duplicateVersion = useDesignStore((s) => s.duplicateVersion);
  const brandKit = useDesignStore((s) => s.brandKit);
  const contentProject = useContentStore((s) => s.projects.find((p) => p.id === design?.contentProjectId));
  const moveKanbanStage = useContentStore((s) => s.moveKanbanStage);
  const createProject = useContentStore((s) => s.createProject);
  const updateProject = useContentStore((s) => s.updateProject);
  const addCalendarEntry = useContentStore((s) => s.addCalendarEntry);
  const pushToast = useUiStore((s) => s.pushToast);

  const history = useDesignHistory(design?.slides ?? [emptySlide()]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<ToolKey | null>("templates");
  const [zoom, setZoom] = useState(0.4);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [promptAssistantOpen, setPromptAssistantOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [generatingDesign, setGeneratingDesign] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreResult, setScoreResult] = useState<DesignScoreResult | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>("avancado");
  const [gridMode, setGridMode] = useState<GridMode>("none");
  const [gridMargin, setGridMargin] = useState(32);
  const [showSafeArea, setShowSafeArea] = useState(false);

  const stageRef = useRef<Konva.Stage | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const prevSelectionKeyRef = useRef<string>("");

  useEffect(() => {
    if (design && loadedIdRef.current !== design.id) {
      loadedIdRef.current = design.id;
      history.loadSlides(design.slides);
      setActiveSlideIndex(0);
      setSelectedIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design?.id]);

  // Commit any pending edits when the selection changes; start a fresh gesture for the new one.
  useEffect(() => {
    const key = selectedIds.join(",");
    if (prevSelectionKeyRef.current !== key) {
      history.commit();
      if (selectedIds.length > 0) history.beginGesture();
      prevSelectionKeyRef.current = key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  // Autosave (debounced) whenever slides change.
  useEffect(() => {
    if (!design) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        updateSlides(design.id, history.slides);
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
      } catch {
        setSaveState("error");
      }
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.slides, design?.id]);

  const format = useMemo(() => DESIGN_FORMATS.find((f) => f.key === design?.format) ?? DESIGN_FORMATS[0], [design?.format]);
  const slide = history.slides[activeSlideIndex] ?? history.slides[0];
  const selectedElements = slide ? slide.elements.filter((e) => selectedIds.includes(e.id)) : [];

  // Global keyboard shortcuts (skipped while typing in an input/textarea/select or editing text on canvas).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
      if (isTyping || editingTextId) {
        if (e.key === "Escape") target.blur?.();
        return;
      }
      const meta = e.metaKey || e.ctrlKey;

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (design) {
          updateSlides(design.id, history.slides);
          pushVersion(design.id);
          pushToast("Projeto salvo", "success");
        }
        return;
      }
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
        return;
      }
      if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedIds.length > 0) duplicateElements(selectedIds);
        return;
      }
      if (meta && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (e.shiftKey) ungroupSelected();
        else groupSelected();
        return;
      }
      if (e.key === "Escape") {
        setSelectedIds([]);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault();
        deleteElements(selectedIds);
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        selectedIds.forEach((id) => {
          const el = slide?.elements.find((e2) => e2.id === id);
          if (el) updateElementLive(id, { x: el.x + dx, y: el.y + dy });
        });
        history.commit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, editingTextId, slide, design?.id]);

  function setSlideAt(index: number, newSlide: DesignSlide) {
    const next = history.slides.map((s, i) => (i === index ? newSlide : s));
    history.setSlides(next);
  }

  function applyAtomic(mutator: (slides: DesignSlide[]) => DesignSlide[]) {
    history.beginGesture();
    history.setSlides(mutator(history.slides));
    history.commit();
  }

  function updateElementLive(id: string, patch: Partial<DesignElement>) {
    if (!slide) return;
    const elements = slide.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as DesignElement) : e));
    setSlideAt(activeSlideIndex, { ...slide, elements });
  }

  function addElement(el: DesignElement) {
    if (!slide) return;
    applyAtomic((slides) =>
      slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: withZIndex([...s.elements, el]) } : s))
    );
    setSelectedIds([el.id]);
  }

  function deleteElements(ids: string[]) {
    applyAtomic((slides) => slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.filter((e) => !ids.includes(e.id)) } : s)));
    setSelectedIds([]);
  }

  function duplicateElements(ids: string[]) {
    if (!slide) return;
    const copies = slide.elements.filter((e) => ids.includes(e.id)).map((e) => ({ ...e, id: uid("el"), x: e.x + 24, y: e.y + 24 }));
    applyAtomic((slides) => slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: withZIndex([...s.elements, ...copies]) } : s)));
    setSelectedIds(copies.map((c) => c.id));
  }

  function reorderLayer(id: string, direction: "up" | "down") {
    if (!slide) return;
    const sorted = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((e) => e.id === id);
    const swapWith = direction === "up" ? idx + 1 : idx - 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    [sorted[idx], sorted[swapWith]] = [sorted[swapWith], sorted[idx]];
    const reindexed = withZIndex(sorted);
    applyAtomic((slides) => slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: reindexed } : s)));
  }

  function groupSelected() {
    if (selectedIds.length < 2) return;
    const groupId = uid("group");
    applyAtomic((slides) =>
      slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.map((e) => (selectedIds.includes(e.id) ? { ...e, groupId } : e)) } : s))
    );
  }

  function ungroupSelected() {
    applyAtomic((slides) =>
      slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.map((e) => (selectedIds.includes(e.id) ? { ...e, groupId: undefined } : e)) } : s))
    );
  }

  function handleSlideBackground(bg: string, bgTo?: string) {
    setSlideAt(activeSlideIndex, { ...slide, background: bg, backgroundGradientTo: bgTo });
  }

  function handleAddSlide() {
    applyAtomic((slides) => [...slides, emptySlide()]);
    setActiveSlideIndex(history.slides.length);
  }

  function handleDuplicateSlide(index: number) {
    const copy: DesignSlide = { ...history.slides[index], id: uid("slide"), elements: history.slides[index].elements.map((e) => ({ ...e, id: uid("el") })) };
    applyAtomic((slides) => [...slides.slice(0, index + 1), copy, ...slides.slice(index + 1)]);
  }

  function handleDeleteSlide(index: number) {
    if (history.slides.length <= 1) return;
    applyAtomic((slides) => slides.filter((_, i) => i !== index));
    setActiveSlideIndex((i) => Math.max(0, Math.min(i, history.slides.length - 2)));
  }

  function handleReorderSlides(fromId: string, toId: string) {
    const fromIdx = history.slides.findIndex((s) => s.id === fromId);
    const toIdx = history.slides.findIndex((s) => s.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    applyAtomic((slides) => {
      const next = [...slides];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  function handleRedesignSlide(index: number) {
    if (!design) return;
    const target = history.slides[index];
    const texts = extractSlideTexts(target);
    const rebuilt = redesignSlide("generic", target, texts.title, texts.body, texts.cta, design.format, "", newSalt());
    applyAtomic((slides) => slides.map((s, i) => (i === index ? rebuilt : s)));
    pushToast("Slide redesenhado com IA", "success");
  }

  async function handleGenerateDesign(prompt: string) {
    if (!design) return;
    setGeneratingDesign(true);
    await new Promise((r) => setTimeout(r, 1600));
    const newSlides = generateDesignFromContent(contentProject?.content ?? null, design.format, prompt, design.name, newSalt());
    history.beginGesture();
    history.setSlides(newSlides);
    history.commit();
    pushVersion(design.id, "Antes da geração com IA");
    setGeneratingDesign(false);
    setActiveSlideIndex(0);
    setSelectedIds([]);
    pushToast("Design gerado com IA", "success");
  }

  function handleApplyTemplate(template: DesignTemplate) {
    if (!slide) return;
    const texts = extractSlideTexts(slide);
    const built = template.layout({ title: texts.title, body: texts.body, cta: texts.cta, palette: template.palette, format });
    setSlideAt(activeSlideIndex, { ...slide, background: built.background, backgroundGradientTo: built.backgroundGradientTo, elements: withZIndex(built.elements) });
    history.commit();
    pushToast("Template aplicado", "success");
  }

  function handleApplyBrandIdentity() {
    if (brandKit.colors.length === 0 && brandKit.fonts.length === 0) {
      pushToast("Cadastre cores e fontes no Kit de Marca primeiro", "error");
      return;
    }
    const primaryColor = brandKit.colors[0];
    const font = brandKit.fonts[0];
    applyAtomic((slides) =>
      slides.map((s) => ({
        ...s,
        elements: s.elements.map((e) => {
          if (e.kind === "text") return { ...e, color: primaryColor ?? e.color, fontFamily: font ?? e.fontFamily };
          if (e.kind === "shape" && e.fill !== "transparent") return { ...e, fill: primaryColor ?? e.fill };
          return e;
        }),
      }))
    );
    pushToast("Identidade da marca aplicada a todos os slides", "success");
  }

  function handleApplyToAll(kind: "layout" | "color" | "font") {
    if (!slide) return;
    if (kind === "color" || kind === "font") {
      const refText = slide.elements.find((e): e is Extract<DesignElement, { kind: "text" }> => e.kind === "text");
      applyAtomic((slides) =>
        slides.map((s, i) => {
          if (i === activeSlideIndex) return s;
          return {
            ...s,
            background: kind === "color" ? slide.background : s.background,
            backgroundGradientTo: kind === "color" ? slide.backgroundGradientTo : s.backgroundGradientTo,
            elements: s.elements.map((e) => {
              if (e.kind === "text" && kind === "font" && refText) return { ...e, fontFamily: refText.fontFamily };
              return e;
            }),
          };
        })
      );
    }
    pushToast(`Aplicado a todos os slides`, "success");
  }

  function handleAnalyzeDesign() {
    if (!slide) return;
    const result = analyzeDesignScore(slide, brandKit.colors, brandKit.fonts);
    setScoreResult(result);
    setScoreOpen(true);
  }

  function handleAutoFixFromScore() {
    if (!slide) return;
    const hierarchyFixed = improveHierarchy(slide);
    const contrastFixed = {
      ...hierarchyFixed,
      elements: hierarchyFixed.elements.map((e) =>
        e.kind === "text" && contrastRatio(e.color, hierarchyFixed.background) < MIN_SAFE_CONTRAST ? { ...e, color: bestContrastColor(hierarchyFixed.background) } : e
      ),
    };
    setSlideAt(activeSlideIndex, contrastFixed);
    history.commit();
    setScoreOpen(false);
    pushToast("Ajustes automáticos aplicados", "success");
  }

  function handleDesignCommand(raw: string) {
    if (!slide) return;
    const action = parseDesignCommand(raw);
    switch (action.type) {
      case "background":
        handleSlideBackground(action.color);
        pushToast("Fundo atualizado", "success");
        break;
      case "accent-color":
        applyAtomic((slides) =>
          slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.map((e) => (e.kind === "shape" && e.fill !== "transparent" ? { ...e, fill: action.color } : e)) } : s))
        );
        pushToast("Cor de destaque atualizada", "success");
        break;
      case "increase-title":
      case "decrease-title": {
        const texts = slide.elements.filter((e): e is Extract<DesignElement, { kind: "text" }> => e.kind === "text");
        const title = [...texts].sort((a, b) => b.fontSize - a.fontSize)[0];
        if (title) {
          const delta = action.type === "increase-title" ? 12 : -12;
          updateElementLive(title.id, { fontSize: Math.max(16, title.fontSize + delta) });
          history.commit();
        }
        break;
      }
      case "center-all":
        applyAtomic((slides) =>
          slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.map((e) => (e.kind === "text" ? { ...e, align: "center" } : e)) } : s))
        );
        pushToast("Textos centralizados", "success");
        break;
      case "reduce-text":
        applyAtomic((slides) =>
          slides.map((s, i) =>
            i === activeSlideIndex
              ? { ...s, elements: s.elements.map((e) => (e.kind === "text" ? { ...e, content: applyTextAIAction(e.content, "encurtar", Math.floor((e.width / e.fontSize) * 2)) } : e)) }
              : s
          )
        );
        pushToast("Texto reduzido", "success");
        break;
      case "simplify":
        setSlideAt(activeSlideIndex, reduceDensity(slide));
        history.commit();
        pushToast("Design simplificado", "success");
        break;
      case "improve-hierarchy":
        setSlideAt(activeSlideIndex, improveHierarchy(slide));
        history.commit();
        pushToast("Hierarquia visual melhorada", "success");
        break;
      case "modern-font":
        applyAtomic((slides) =>
          slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.map((e) => (e.kind === "text" ? { ...e, fontFamily: "Space Grotesk" } : e)) } : s))
        );
        pushToast("Fonte moderna aplicada", "success");
        break;
      case "adapt-format": {
        const targetFormat = DESIGN_FORMATS.find((f) => f.key === action.format);
        if (targetFormat) {
          setSlideAt(activeSlideIndex, adaptSlideToFormat(slide, targetFormat));
          history.commit();
          pushToast(`Slide adaptado para ${targetFormat.label}`, "success");
        }
        break;
      }
      case "generate-image":
        setImageGenOpen(true);
        break;
      case "apply-brand":
        handleApplyBrandIdentity();
        break;
      case "more-premium": {
        const improved = improveHierarchy(slide);
        setSlideAt(activeSlideIndex, { ...improved, elements: improved.elements.map((e) => (e.kind === "text" ? { ...e, letterSpacing: Math.max(e.letterSpacing, 0.5) } : e)) });
        history.commit();
        pushToast("Estilo mais premium aplicado", "success");
        break;
      }
      case "analyze":
        handleAnalyzeDesign();
        break;
      default:
        pushToast("Não entendi esse comando. Tente outra forma de dizer.", "error");
    }
  }

  async function captureActiveStage(): Promise<string> {
    await new Promise((r) => setTimeout(r, 30));
    if (!stageRef.current) return "";
    return stageRef.current.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
  }

  async function captureAllSlides(): Promise<string[]> {
    const originalIndex = activeSlideIndex;
    const results: string[] = [];
    for (let i = 0; i < history.slides.length; i++) {
      setActiveSlideIndex(i);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const src = await captureActiveStage();
      results.push(src);
    }
    setActiveSlideIndex(originalIndex);
    return results;
  }

  async function handleExport(kind: ExportKind, options: { highQuality: boolean; transparent: boolean }) {
    if (!design || !stageRef.current) return;
    setExportOpen(false);
    const pixelRatio = options.highQuality ? 3 : 1;
    if (kind === "png" || kind === "jpg") {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio, mimeType: kind === "jpg" ? "image/jpeg" : "image/png" });
      downloadDataUrl(dataUrl, `${design.name}.${kind}`);
      pushToast("Design exportado", "success");
      return;
    }
    pushToast("Preparando exportação de todos os slides...", "default");
    const images = await captureAllSlides();
    if (kind === "pdf-all") exportSlidesAsPdf(images, design.name);
    if (kind === "zip-all") await exportSlidesAsZip(images, design.name);
    pushToast("Exportação concluída", "success");
  }

  function handleMarkAsProduced() {
    if (!design) return;
    if (contentProject) {
      moveKanbanStage(contentProject.id, "produzido");
      updateProject(contentProject.id, { designId: design.id });
      pushToast("Card movido para Conteúdo Produzido", "success");
    } else {
      const created = createProject({
        title: design.name,
        format: "post",
        objective: "engajar",
        kanbanStage: "produzido",
        content: { format: "post", data: { title: design.name, caption: "", cta: "", notes: "" } },
      });
      updateProject(created.id, { designId: design.id });
      updateDesign(design.id, { contentProjectId: created.id });
      pushToast("Novo card criado em Conteúdo Produzido", "success");
    }
  }

  if (!design) {
    return (
      <div className="px-4 sm:px-8 py-10 max-w-2xl mx-auto">
        <Card>
          <EmptyState icon={<FileQuestion className="size-6" />} title="Design não encontrado" description="Esse design pode ter sido removido." action={<Button onClick={() => navigate("/design")}>Voltar</Button>} />
        </Card>
      </div>
    );
  }

  const warnings = validateDesign(history.slides, format);
  const isCarousel = design.format.startsWith("carrossel");
  const density = slide ? computeDensity(slide) : null;
  const DENSITY_LABEL: Record<string, string> = { limpo: "Limpo", equilibrado: "Equilibrado", carregado: "Carregado" };
  const DENSITY_COLOR: Record<string, string> = { limpo: "text-success", equilibrado: "text-warning", carregado: "text-danger" };

  return (
    <div className="fixed inset-0 lg:left-64 flex flex-col bg-ink-950 z-10">
      <TopBar
        name={design.name}
        onRename={(name) => updateDesign(design.id, { name })}
        saveState={saveState}
        onSave={() => {
          updateSlides(design.id, history.slides);
          pushVersion(design.id);
          pushToast("Projeto salvo", "success");
        }}
        onUndo={history.undo}
        onRedo={history.redo}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onPreview={() => window.open(stageRef.current?.toDataURL({ pixelRatio: 1 }), "_blank")}
        onShare={() => pushToast("Link de compartilhamento copiado (simulado)", "success")}
        onExport={() => setExportOpen(true)}
        backTo="/organizacao"
      />

      <div className="flex-1 flex min-h-0">
        <LeftRail active={leftPanel} onSelect={(t) => setLeftPanel(leftPanel === t ? null : t)} />

        {leftPanel && (
          <div className="hidden md:block w-[300px] shrink-0 border-r border-ink-750 bg-ink-950/90 backdrop-blur-md overflow-y-auto">
            {leftPanel === "templates" && <TemplatesPanel format={design.format} onApply={handleApplyTemplate} />}
            {leftPanel === "text" && <TextToolPanel onAdd={addElement} />}
            {(leftPanel === "elements" || leftPanel === "shapes" || leftPanel === "icons") && (
              <ElementsToolPanel initialTab={leftPanel === "icons" ? "icons" : "shapes"} onAdd={addElement} />
            )}
            {leftPanel === "images" && (
              <ImagesToolPanel onAddImage={(src) => addElement(makeImageElement({ src, x: 100, y: 100 }))} onOpenGenerator={() => setImageGenOpen(true)} />
            )}
            {leftPanel === "backgrounds" && <BackgroundsToolPanel onApply={handleSlideBackground} />}
            {leftPanel === "uploads" && <UploadsToolPanel onAddImage={(src) => addElement(makeImageElement({ src, x: 100, y: 100 }))} />}
            {leftPanel === "brand" && <BrandKitPanel onApplyIdentity={handleApplyBrandIdentity} />}
            {leftPanel === "ai" && (
              <AIToolPanel
                generating={generatingDesign}
                onGenerateDesign={handleGenerateDesign}
                onOpenImageGenerator={() => setImageGenOpen(true)}
                onOpenPromptAssistant={() => setPromptAssistantOpen(true)}
              />
            )}
            {leftPanel === "layers" && (
              <LayersPanel
                slide={slide}
                selectedIds={selectedIds}
                onSelectIds={setSelectedIds}
                onUpdate={updateElementLive}
                onReorder={reorderLayer}
                onGroup={groupSelected}
                onUngroup={ungroupSelected}
              />
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-ink-750 bg-ink-950/80 backdrop-blur-md gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <button onClick={() => setZoom((z) => Math.max(0.15, z - 0.05))} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800">
                  <ZoomOut className="size-4" />
                </button>
                <span className="text-xs text-ink-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.2, z + 0.05))} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800">
                  <ZoomIn className="size-4" />
                </button>
              </div>
              {density && (
                <Tooltip content="Densidade visual do slide atual">
                  <span className={cn("hidden md:inline-flex items-center gap-1.5 text-xs rounded-full border border-ink-700 px-2.5 py-1", DENSITY_COLOR[density.level])}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {DENSITY_LABEL[density.level]}
                  </span>
                </Tooltip>
              )}
              <GridControls
                mode={gridMode}
                onModeChange={setGridMode}
                margin={gridMargin}
                onMarginChange={setGridMargin}
                safeArea={showSafeArea}
                onSafeAreaChange={setShowSafeArea}
              />
              <div className="hidden xl:flex items-center rounded-full border border-ink-700 p-0.5">
                {EDIT_MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setEditMode(m.key);
                      if (m.key === "ia") setLeftPanel("ai");
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full transition-colors",
                      editMode === m.key ? "bg-white text-ink-950 font-medium shadow-[0_0_12px_rgba(255,255,255,0.25)]" : "text-ink-300 hover:text-white"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <DesignCommandBar onCommand={handleDesignCommand} />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" icon={<Gauge className="size-3.5" />} onClick={handleAnalyzeDesign}>
                Analisar design
              </Button>
              <Button size="sm" variant="outline" onClick={() => setScheduleOpen(true)}>
                Agendar publicação
              </Button>
              <Button size="sm" variant="secondary" icon={<CheckSquare2 className="size-3.5" />} onClick={handleMarkAsProduced}>
                Marcar como produzido
              </Button>
            </div>
          </div>

          {isCarousel && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 border-b border-ink-750 bg-ink-950/80 backdrop-blur-md">
              <Button size="sm" variant="ghost" onClick={() => handleApplyToAll("layout")}>
                Aplicar layout em todos
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleApplyToAll("color")}>
                Aplicar cores em todos
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleApplyToAll("font")}>
                Aplicar fonte em todos
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-auto flex items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:16px_16px] p-8">
            {slide && (
              <DesignCanvas
                slide={slide}
                format={format}
                scale={zoom}
                selectedIds={selectedIds}
                onSelectIds={setSelectedIds}
                onUpdateElement={updateElementLive}
                onCommit={() => history.commit()}
                editingTextId={editingTextId}
                onStartEditText={setEditingTextId}
                onFinishEditText={(elId, text) => {
                  applyAtomic((slides) => slides.map((s, i) => (i === activeSlideIndex ? { ...s, elements: s.elements.map((e) => (e.id === elId ? { ...e, content: text } as DesignElement : e)) } : s)));
                  setEditingTextId(null);
                }}
                stageRef={(node) => {
                  stageRef.current = node;
                }}
                gridMode={gridMode}
                gridMargin={gridMargin}
                showSafeArea={showSafeArea}
              />
            )}
          </div>

          {(design.format.startsWith("carrossel") || history.slides.length > 1) && (
            <SlideStrip
              slides={history.slides}
              activeIndex={activeSlideIndex}
              onSelect={setActiveSlideIndex}
              onReorder={handleReorderSlides}
              onAdd={handleAddSlide}
              onDuplicate={handleDuplicateSlide}
              onDelete={handleDeleteSlide}
              onRedesignSlide={handleRedesignSlide}
            />
          )}
        </div>

        <div className="hidden lg:block w-[280px] shrink-0 border-l border-ink-750 bg-ink-950/90 backdrop-blur-md overflow-y-auto">
          {slide && (
            <RightPropertiesPanel
              slide={slide}
              selected={selectedElements}
              onUpdate={updateElementLive}
              onDelete={deleteElements}
              onDuplicate={duplicateElements}
              onSlideBackground={handleSlideBackground}
              mode={editMode}
            />
          )}
        </div>
      </div>

      <ImageGenModal open={imageGenOpen} onClose={() => setImageGenOpen(false)} onAddToDesign={(src) => addElement(makeImageElement({ src, x: 100, y: 100 }))} />
      <PromptAssistantModal open={promptAssistantOpen} onClose={() => setPromptAssistantOpen(false)} onUsePrompt={() => setImageGenOpen(true)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} onExport={handleExport} warnings={warnings} />
      <DesignVersionHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={design.versions}
        onRestore={(vid) => {
          restoreVersion(design.id, vid);
          const restored = useDesignStore.getState().designs.find((d) => d.id === design.id);
          if (restored) history.loadSlides(restored.slides);
          setHistoryOpen(false);
        }}
        onDuplicate={(vid) => duplicateVersion(design.id, vid)}
      />
      <DesignScoreModal open={scoreOpen} onClose={() => setScoreOpen(false)} result={scoreResult} onAutoFix={handleAutoFixFromScore} />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      {contentProject && (
        <ScheduleModal
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          onConfirm={(data) => {
            addCalendarEntry({ title: contentProject.title, format: contentProject.format, date: data.date, time: data.time, status: data.status, notes: data.notes, projectId: contentProject.id });
            updateProject(contentProject.id, { status: data.status, scheduledDate: data.date, scheduledTime: data.time });
            pushToast("Publicação agendada no calendário", "success");
          }}
        />
      )}
    </div>
  );
}
