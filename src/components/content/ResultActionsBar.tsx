import { useState } from "react";
import { Button } from "@/components/ui";
import { Copy, Save, Heart, Download, CalendarPlus, ChevronDown, FileText, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ResultActionsBar({
  onCopy,
  onSave,
  onFavorite,
  onExportText,
  onExportDocument,
  onSchedule,
  favorite,
  saved,
}: {
  onCopy: () => void;
  onSave: () => void;
  onFavorite: () => void;
  onExportText: () => void;
  onExportDocument: () => void;
  onSchedule: () => void;
  favorite: boolean;
  saved: boolean;
}) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="sticky bottom-4 z-10">
      <div className="glass-card rounded-2xl p-2 flex flex-wrap items-center gap-1.5 shadow-lg">
        <Button size="sm" variant="ghost" icon={<Copy className="size-3.5" />} onClick={onCopy}>
          Copiar
        </Button>
        <Button size="sm" variant={saved ? "secondary" : "ghost"} icon={<Save className="size-3.5" />} onClick={onSave}>
          {saved ? "Salvo" : "Salvar"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Heart className={cn("size-3.5", favorite && "fill-white text-white")} />}
          onClick={onFavorite}
        >
          Favoritar
        </Button>
        <div className="relative">
          <Button size="sm" variant="ghost" icon={<Download className="size-3.5" />} iconRight={<ChevronDown className="size-3" />} onClick={() => setExportOpen((o) => !o)}>
            Exportar
          </Button>
          {exportOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-44 glass-card rounded-xl p-1.5 shadow-lg z-20 animate-fade-up">
              <button
                onClick={() => {
                  onExportText();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
              >
                <FileText className="size-3.5" /> Arquivo de texto
              </button>
              <button
                onClick={() => {
                  onExportDocument();
                  setExportOpen(false);
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
              >
                <FileDown className="size-3.5" /> PDF / Documento
              </button>
            </div>
          )}
        </div>
        <Button size="sm" variant="ghost" icon={<CalendarPlus className="size-3.5" />} onClick={onSchedule}>
          Agendar
        </Button>
      </div>
    </div>
  );
}
