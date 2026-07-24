import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Tooltip } from "@/components/ui";
import { ChevronLeft, Undo2, Redo2, History, Eye, Share2, Download, Save, Check, Loader2, AlertCircle, Keyboard } from "lucide-react";
import type { SaveState } from "@/types/design";
import { cn } from "@/lib/utils";

export function TopBar({
  name,
  onRename,
  saveState,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenHistory,
  onPreview,
  onShare,
  onExport,
  onOpenShortcuts,
  backTo,
}: {
  name: string;
  onRename: (name: string) => void;
  saveState: SaveState;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenHistory: () => void;
  onPreview: () => void;
  onShare: () => void;
  onExport: () => void;
  onOpenShortcuts: () => void;
  backTo: string;
}) {
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <div className="flex items-center gap-3 h-14 px-3 sm:px-4 border-b border-ink-750 bg-ink-950/90 backdrop-blur-md shrink-0">
      <button onClick={() => navigate(backTo)} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors shrink-0">
        <ChevronLeft className="size-4" />
      </button>

      {editingName ? (
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onRename(draft || "Sem título");
            setEditingName(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="max-w-[220px] !py-1.5"
        />
      ) : (
        <button onClick={() => setEditingName(true)} className="text-sm font-medium text-white truncate max-w-[160px] sm:max-w-[240px] hover:text-ink-200 transition-colors">
          {name}
        </button>
      )}

      <div className="flex items-center gap-1 shrink-0">
        <Tooltip content="Desfazer">
          <button onClick={onUndo} disabled={!canUndo} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
            <Undo2 className="size-4" />
          </button>
        </Tooltip>
        <Tooltip content="Refazer">
          <button onClick={onRedo} disabled={!canRedo} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
            <Redo2 className="size-4" />
          </button>
        </Tooltip>
        <Tooltip content="Histórico de versões">
          <button onClick={onOpenHistory} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors">
            <History className="size-4" />
          </button>
        </Tooltip>
        <Tooltip content="Atalhos de teclado">
          <button onClick={onOpenShortcuts} className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors">
            <Keyboard className="size-4" />
          </button>
        </Tooltip>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <SaveIndicator state={saveState} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" icon={<Eye className="size-3.5" />} onClick={onPreview} className="hidden sm:inline-flex">
          Visualizar
        </Button>
        <Button size="sm" variant="ghost" icon={<Share2 className="size-3.5" />} onClick={onShare} className="hidden sm:inline-flex">
          Compartilhar
        </Button>
        <Button size="sm" variant="secondary" icon={<Save className="size-3.5" />} onClick={onSave}>
          Salvar
        </Button>
        <Button size="sm" icon={<Download className="size-3.5" />} onClick={onExport}>
          Exportar
        </Button>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-300">
        <Loader2 className="size-3.5 animate-spin" /> Salvando…
      </span>
    );
  if (state === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-400 animate-fade-in">
        <Check className="size-3.5" /> Alterações salvas
      </span>
    );
  if (state === "error")
    return (
      <span className="flex items-center gap-1.5 text-xs text-danger">
        <AlertCircle className="size-3.5" /> Erro ao salvar. Tente novamente.
      </span>
    );
  return <span className={cn("text-xs text-ink-500")}>&nbsp;</span>;
}
