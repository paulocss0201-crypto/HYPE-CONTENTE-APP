import { useState } from "react";
import { Select } from "@/components/ui";
import { TEMPLATE_CATEGORIES, templatesForFormat } from "@/lib/design-ai";
import type { DesignFormatKey } from "@/types/design";
import type { DesignTemplate } from "@/lib/design-ai";

export function TemplatesPanel({ format, onApply }: { format: DesignFormatKey; onApply: (template: DesignTemplate) => void }) {
  const [category, setCategory] = useState<string>("todas");
  const templates = templatesForFormat(format).filter((t) => category === "todas" || t.category === category);

  return (
    <div className="flex flex-col gap-3 p-3">
      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="todas">Todas as categorias</option>
        {TEMPLATE_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-2">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onApply(t)}
            className="rounded-xl border border-ink-700 overflow-hidden hover:border-ink-400 transition-colors text-left"
          >
            <div
              className="aspect-[4/5] flex items-end p-2"
              style={{ background: t.palette.bgTo ? `linear-gradient(160deg, ${t.palette.bg}, ${t.palette.bgTo})` : t.palette.bg }}
            >
              <div className="w-full h-2 rounded-full" style={{ background: t.palette.accent }} />
            </div>
            <p className="text-[11px] text-ink-200 px-2 py-1.5 truncate">{t.name}</p>
          </button>
        ))}
        {templates.length === 0 && <p className="col-span-2 text-xs text-ink-500 text-center py-8">Nenhum template para este formato ainda.</p>}
      </div>
    </div>
  );
}
