import { useState } from "react";
import { Button, Input, Select, Slider, Switch, Tooltip } from "@/components/ui";
import type { DesignElement, DesignSlide, TextElement, ImageElement, ShapeElement } from "@/types/design";
import { FONT_OPTIONS } from "@/types/design";
import { applyTextAIAction, TEXT_AI_ACTION_LABEL } from "@/lib/design-ai";
import type { TextAIAction } from "@/lib/design-ai";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  CaseUpper,
  Trash2,
  Copy,
  Lock,
  Unlock,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEXT_AI_ACTIONS: TextAIAction[] = ["melhorar-titulo", "headline-forte", "encurtar", "persuasivo", "profissional", "gramatica", "nova-versao", "adaptar-espaco"];

export function RightPropertiesPanel({
  slide,
  selected,
  onUpdate,
  onDelete,
  onDuplicate,
  onSlideBackground,
}: {
  slide: DesignSlide;
  selected: DesignElement[];
  onUpdate: (id: string, patch: Partial<DesignElement>) => void;
  onDelete: (ids: string[]) => void;
  onDuplicate: (ids: string[]) => void;
  onSlideBackground: (bg: string, bgTo?: string) => void;
}) {
  if (selected.length === 0) {
    return <SlidePropertiesPanel slide={slide} onSlideBackground={onSlideBackground} />;
  }

  if (selected.length > 1) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <p className="text-sm font-semibold">{selected.length} elementos selecionados</p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" icon={<Copy className="size-3.5" />} onClick={() => onDuplicate(selected.map((e) => e.id))}>
            Duplicar
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 className="size-3.5" />} onClick={() => onDelete(selected.map((e) => e.id))}>
            Excluir
          </Button>
        </div>
        <OpacityControl value={selected[0].opacity} onChange={(v) => selected.forEach((e) => onUpdate(e.id, { opacity: v }))} />
      </div>
    );
  }

  const el = selected[0];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-4 gap-1.5">
        <Tooltip content={el.locked ? "Desbloquear" : "Bloquear"}>
          <button onClick={() => onUpdate(el.id, { locked: !el.locked })} className="flex flex-col items-center gap-1 py-2 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800">
            {el.locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
          </button>
        </Tooltip>
        <Tooltip content="Duplicar">
          <button onClick={() => onDuplicate([el.id])} className="flex flex-col items-center gap-1 py-2 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800">
            <Copy className="size-4" />
          </button>
        </Tooltip>
        <Tooltip content="Excluir">
          <button onClick={() => onDelete([el.id])} className="flex flex-col items-center gap-1 py-2 rounded-lg text-ink-300 hover:text-danger hover:bg-danger/10">
            <Trash2 className="size-4" />
          </button>
        </Tooltip>
        {el.kind === "image" && (
          <>
            <Tooltip content="Espelhar horizontal">
              <button onClick={() => onUpdate(el.id, { flipX: !(el as ImageElement).flipX })} className="flex flex-col items-center gap-1 py-2 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800">
                <FlipHorizontal className="size-4" />
              </button>
            </Tooltip>
          </>
        )}
      </div>

      {el.kind === "text" && <TextProperties el={el} onUpdate={(patch) => onUpdate(el.id, patch)} />}
      {el.kind === "image" && <ImageProperties el={el} onUpdate={(patch) => onUpdate(el.id, patch)} />}
      {el.kind === "shape" && <ShapeProperties el={el} onUpdate={(patch) => onUpdate(el.id, patch)} />}
      {el.kind === "icon" && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-ink-300">Cor</label>
          <ColorInput value={el.color} onChange={(color) => onUpdate(el.id, { color })} />
        </div>
      )}

      <OpacityControl value={el.opacity} onChange={(v) => onUpdate(el.id, { opacity: v })} />
    </div>
  );
}

function OpacityControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <Slider label="Transparência" min={0} max={100} value={Math.round(value * 100)} onChange={(v) => onChange(v / 100)} />;
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-9 rounded-lg border border-ink-600 bg-transparent cursor-pointer" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
    </div>
  );
}

function SlidePropertiesPanel({ slide, onSlideBackground }: { slide: DesignSlide; onSlideBackground: (bg: string, bgTo?: string) => void }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm font-semibold">Fundo do slide</p>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-ink-300">Cor inicial</label>
        <ColorInput value={slide.background} onChange={(c) => onSlideBackground(c, slide.backgroundGradientTo)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-ink-300">Gradiente</label>
          <Switch checked={!!slide.backgroundGradientTo} onChange={(v) => onSlideBackground(slide.background, v ? "#242424" : undefined)} />
        </div>
        {slide.backgroundGradientTo && <ColorInput value={slide.backgroundGradientTo} onChange={(c) => onSlideBackground(slide.background, c)} />}
      </div>
      <p className="text-xs text-ink-400">Selecione um elemento no canvas para editar suas propriedades.</p>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs font-medium text-ink-300 mt-1">{children}</p>;
}

function TextProperties({ el, onUpdate }: { el: TextElement; onUpdate: (patch: Partial<TextElement>) => void }) {
  const [showMore, setShowMore] = useState(false);

  function ai(action: TextAIAction) {
    onUpdate({ content: applyTextAIAction(el.content, action, Math.floor((el.width / el.fontSize) * 2)) });
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Fonte</SectionLabel>
      <Select value={el.fontFamily} onChange={(e) => onUpdate({ fontFamily: e.target.value })}>
        {FONT_OPTIONS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-2">
        <Input type="number" label="Tamanho" value={el.fontSize} onChange={(e) => onUpdate({ fontSize: Number(e.target.value) || el.fontSize })} />
        <Select label="Peso" value={String(el.fontWeight)} onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}>
          {[300, 400, 500, 600, 700, 800, 900].map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </Select>
      </div>

      <ColorInput value={el.color} onChange={(color) => onUpdate({ color })} />

      <div className="flex items-center gap-1">
        {(["left", "center", "right"] as const).map((a) => {
          const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
          return (
            <button
              key={a}
              onClick={() => onUpdate({ align: a })}
              className={cn("flex-1 flex items-center justify-center py-2 rounded-lg border", el.align === a ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-300 hover:text-white")}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
        <button onClick={() => onUpdate({ fontWeight: el.fontWeight >= 700 ? 400 : 800 })} className={cn("flex-1 flex items-center justify-center py-2 rounded-lg border", el.fontWeight >= 700 ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-300 hover:text-white")}>
          <Bold className="size-4" />
        </button>
        <button onClick={() => onUpdate({ italic: !el.italic })} className={cn("flex-1 flex items-center justify-center py-2 rounded-lg border", el.italic ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-300 hover:text-white")}>
          <Italic className="size-4" />
        </button>
        <button onClick={() => onUpdate({ underline: !el.underline })} className={cn("flex-1 flex items-center justify-center py-2 rounded-lg border", el.underline ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-300 hover:text-white")}>
          <Underline className="size-4" />
        </button>
        <button onClick={() => onUpdate({ uppercase: !el.uppercase })} className={cn("flex-1 flex items-center justify-center py-2 rounded-lg border", el.uppercase ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-300 hover:text-white")}>
          <CaseUpper className="size-4" />
        </button>
      </div>

      <button onClick={() => setShowMore((s) => !s)} className="flex items-center justify-between text-xs font-medium text-ink-300 hover:text-white py-1">
        Espaçamento, efeitos e curva
        {showMore ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>

      {showMore && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <Slider label="Espaçamento entre letras" min={-5} max={30} value={el.letterSpacing} onChange={(v) => onUpdate({ letterSpacing: v })} />
          <Slider label="Espaçamento entre linhas" min={80} max={220} value={Math.round(el.lineHeight * 100)} onChange={(v) => onUpdate({ lineHeight: v / 100 })} />

          <Switch checked={el.shadow} onChange={(v) => onUpdate({ shadow: v })} label="Sombra" />
          <Switch checked={el.stroke} onChange={(v) => onUpdate({ stroke: v })} label="Contorno" />
          {el.stroke && <ColorInput value={el.strokeColor} onChange={(c) => onUpdate({ strokeColor: c })} />}
          <Switch checked={el.background} onChange={(v) => onUpdate({ background: v })} label="Fundo no texto" />
          {el.background && <ColorInput value={el.backgroundColor} onChange={(c) => onUpdate({ backgroundColor: c })} />}
          <Switch checked={el.gradient} onChange={(v) => onUpdate({ gradient: v })} label="Gradiente no texto" />
          {el.gradient && (
            <div className="grid grid-cols-2 gap-2">
              <ColorInput value={el.gradientFrom} onChange={(c) => onUpdate({ gradientFrom: c })} />
              <ColorInput value={el.gradientTo} onChange={(c) => onUpdate({ gradientTo: c })} />
            </div>
          )}
          <Switch checked={el.curved} onChange={(v) => onUpdate({ curved: v })} label="Curvar texto" />
          {el.curved && <Slider label="Curvatura" min={10} max={180} value={el.curveAmount} onChange={(v) => onUpdate({ curveAmount: v })} />}
        </div>
      )}

      <SectionLabel>Inteligência Artificial</SectionLabel>
      <div className="flex flex-wrap gap-1.5">
        {TEXT_AI_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => ai(action)}
            className="flex items-center gap-1 text-xs rounded-full border border-ink-600 px-2.5 py-1.5 text-ink-100 hover:border-ink-400 hover:text-white transition-colors"
          >
            <Sparkles className="size-3" /> {TEXT_AI_ACTION_LABEL[action]}
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageProperties({ el, onUpdate }: { el: ImageElement; onUpdate: (patch: Partial<ImageElement>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Ajustes</SectionLabel>
      <Slider label="Brilho" min={-50} max={50} value={Math.round(el.filters.brightness * 100)} onChange={(v) => onUpdate({ filters: { ...el.filters, brightness: v / 100 } })} />
      <Slider label="Contraste" min={-50} max={50} value={Math.round(el.filters.contrast)} onChange={(v) => onUpdate({ filters: { ...el.filters, contrast: v } })} />
      <Slider label="Saturação" min={-100} max={100} value={Math.round(el.filters.saturation * 50)} onChange={(v) => onUpdate({ filters: { ...el.filters, saturation: v / 50 } })} />
      <Slider label="Temperatura" min={-50} max={50} value={Math.round(el.filters.temperature)} onChange={(v) => onUpdate({ filters: { ...el.filters, temperature: v } })} />
      <Slider label="Desfoque" min={0} max={20} value={Math.round(el.filters.blur)} onChange={(v) => onUpdate({ filters: { ...el.filters, blur: v } })} />
      <Slider label="Cantos arredondados" min={0} max={200} value={el.cornerRadius} onChange={(v) => onUpdate({ cornerRadius: v })} />

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant={el.flipX ? "secondary" : "outline"} icon={<FlipHorizontal className="size-3.5" />} onClick={() => onUpdate({ flipX: !el.flipX })}>
          Espelhar H
        </Button>
        <Button size="sm" variant={el.flipY ? "secondary" : "outline"} icon={<FlipVertical className="size-3.5" />} onClick={() => onUpdate({ flipY: !el.flipY })}>
          Espelhar V
        </Button>
      </div>

      <SectionLabel>Inteligência Artificial</SectionLabel>
      <div className="flex flex-col gap-1.5">
        <Button size="sm" variant="outline" icon={<Sparkles className="size-3.5" />} onClick={() => onUpdate({ backgroundRemoved: !el.backgroundRemoved })}>
          {el.backgroundRemoved ? "Restaurar fundo" : "Remover fundo"}
        </Button>
        <Button size="sm" variant="outline" icon={<Sparkles className="size-3.5" />} onClick={() => onUpdate({ filters: { ...el.filters, brightness: 0.08, contrast: 8 } })}>
          Melhorar qualidade
        </Button>
        <Button size="sm" variant="outline" icon={<Sparkles className="size-3.5" />} onClick={() => onUpdate({ filters: { ...el.filters, brightness: el.filters.brightness + 0.1 } })}>
          Corrigir iluminação
        </Button>
      </div>
    </div>
  );
}

function ShapeProperties({ el, onUpdate }: { el: ShapeElement; onUpdate: (patch: Partial<ShapeElement>) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Preenchimento</SectionLabel>
      <ColorInput value={el.fill} onChange={(fill) => onUpdate({ fill })} />
      <SectionLabel>Contorno</SectionLabel>
      <div className="grid grid-cols-2 gap-2 items-center">
        <ColorInput value={el.stroke} onChange={(stroke) => onUpdate({ stroke })} />
        <Input type="number" min={0} value={el.strokeWidth} onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) || 0 })} />
      </div>
      {(el.shapeType === "rect" || el.shapeType === "frame") && <Slider label="Cantos arredondados" min={0} max={200} value={el.cornerRadius} onChange={(v) => onUpdate({ cornerRadius: v })} />}
    </div>
  );
}
