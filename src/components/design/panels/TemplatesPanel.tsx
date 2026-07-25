import { useState } from "react";
import { Select, Button, Input, Tooltip } from "@/components/ui";
import { TEMPLATE_CATEGORIES, templatesForFormat } from "@/lib/design-ai";
import type { DesignFormatKey, UserTemplate } from "@/types/design";
import type { DesignTemplate } from "@/lib/design-ai";
import { BookmarkPlus, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplatesPanel({
  format,
  onApply,
  userTemplates,
  onApplyUserTemplate,
  onSaveCurrentAsTemplate,
  onDeleteUserTemplate,
}: {
  format: DesignFormatKey;
  onApply: (template: DesignTemplate) => void;
  userTemplates: UserTemplate[];
  onApplyUserTemplate: (template: UserTemplate) => void;
  onSaveCurrentAsTemplate: (name: string) => void;
  onDeleteUserTemplate: (id: string) => void;
}) {
  const [tab, setTab] = useState<"prontos" | "meus">("prontos");
  const [category, setCategory] = useState<string>("todas");
  const [saving, setSaving] = useState(false);
  const [draftName, setDraftName] = useState("");
  const templates = templatesForFormat(format).filter((t) => category === "todas" || t.category === category);
  const myTemplates = userTemplates.filter((t) => t.format === format);

  function confirmSave() {
    const name = draftName.trim() || `Meu template ${myTemplates.length + 1}`;
    onSaveCurrentAsTemplate(name);
    setDraftName("");
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center rounded-full border border-ink-700 p-0.5 shrink-0">
        <button onClick={() => setTab("prontos")} className={tabClass(tab === "prontos")}>
          Prontos
        </button>
        <button onClick={() => setTab("meus")} className={tabClass(tab === "meus")}>
          Meus templates
        </button>
      </div>

      {tab === "prontos" && (
        <>
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
        </>
      )}

      {tab === "meus" && (
        <>
          {saving ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                placeholder="Nome do template"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmSave();
                  if (e.key === "Escape") setSaving(false);
                }}
                className="!py-1.5 flex-1"
              />
              <Tooltip content="Salvar">
                <button onClick={confirmSave} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 shrink-0">
                  <Check className="size-4" />
                </button>
              </Tooltip>
              <Tooltip content="Cancelar">
                <button onClick={() => setSaving(false)} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 shrink-0">
                  <X className="size-4" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <Button size="sm" variant="secondary" icon={<BookmarkPlus className="size-3.5" />} onClick={() => setSaving(true)} className="w-full">
              Salvar slide atual como template
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {myTemplates.map((t) => (
              <div key={t.id} className="relative rounded-xl border border-ink-700 overflow-hidden hover:border-ink-400 transition-colors group">
                <button onClick={() => onApplyUserTemplate(t)} className="block w-full text-left">
                  <div
                    className="aspect-[4/5] bg-ink-900"
                    style={!t.thumbnail ? { background: t.backgroundGradientTo ? `linear-gradient(160deg, ${t.background}, ${t.backgroundGradientTo})` : t.background } : undefined}
                  >
                    {t.thumbnail && <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />}
                  </div>
                  <p className="text-[11px] text-ink-200 px-2 py-1.5 truncate">{t.name}</p>
                </button>
                <Tooltip content="Excluir template">
                  <button
                    onClick={() => onDeleteUserTemplate(t.id)}
                    className="absolute top-1 right-1 hidden group-hover:flex p-1 rounded-lg bg-ink-900/90 border border-ink-600 text-ink-300 hover:text-danger transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </Tooltip>
              </div>
            ))}
            {myTemplates.length === 0 && !saving && (
              <p className="col-span-2 text-xs text-ink-500 text-center py-8">
                Nenhum template salvo para este formato ainda. Desenhe um slide do seu jeito e clique em "Salvar slide atual como template".
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function tabClass(active: boolean) {
  return cn("flex-1 text-xs px-2.5 py-1 rounded-full transition-colors text-center", active ? "bg-white text-ink-950 font-medium" : "text-ink-300 hover:text-white");
}
