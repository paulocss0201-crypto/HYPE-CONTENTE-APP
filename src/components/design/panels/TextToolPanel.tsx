import { Type } from "lucide-react";
import type { TextElement } from "@/types/design";
import { makeTextElement } from "@/lib/design-ai";

export function TextToolPanel({ onAdd }: { onAdd: (el: TextElement) => void }) {
  const presets: { label: string; sample: string; fontSize: number; fontWeight: number }[] = [
    { label: "Adicionar título", sample: "Título de impacto", fontSize: 64, fontWeight: 800 },
    { label: "Adicionar subtítulo", sample: "Subtítulo de apoio", fontSize: 36, fontWeight: 600 },
    { label: "Adicionar texto", sample: "Texto do parágrafo aqui", fontSize: 26, fontWeight: 400 },
  ];

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-medium text-ink-300 mb-1">Adicionar texto</p>
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={() =>
            onAdd(
              makeTextElement({
                content: p.sample,
                fontSize: p.fontSize,
                fontWeight: p.fontWeight,
                x: 100,
                y: 100,
                width: 500,
                height: p.fontSize * 1.6,
              })
            )
          }
          className="flex items-center gap-2.5 rounded-xl border border-ink-700 px-3 py-3 text-left hover:border-ink-400 hover:bg-ink-850 transition-colors"
        >
          <Type className="size-4 text-ink-300 shrink-0" />
          <span className="text-sm text-white" style={{ fontWeight: p.fontWeight, fontSize: Math.min(p.fontSize / 2.4, 20) }}>
            {p.label}
          </span>
        </button>
      ))}
    </div>
  );
}
