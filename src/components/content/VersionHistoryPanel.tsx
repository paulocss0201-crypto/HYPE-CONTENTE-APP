import { useState } from "react";
import type { ContentVersion } from "@/types";
import { Modal, Button, Input } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { History, RotateCcw, Trash2, Pencil } from "lucide-react";

export function VersionHistoryPanel({
  open,
  onClose,
  versions,
  onRestore,
  onDelete,
  onRename,
}: {
  open: boolean;
  onClose: () => void;
  versions: ContentVersion[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, label: string) => void;
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Histórico de versões" size="lg">
      <div className="flex flex-col gap-2">
        {[...versions].reverse().map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/60 p-3">
            <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
              <History className="size-4 text-ink-300" />
            </div>
            <div className="flex-1 min-w-0">
              {renamingId === v.id ? (
                <Input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onRename(v.id, draft);
                      setRenamingId(null);
                    }
                  }}
                  className="max-w-xs"
                />
              ) : (
                <p className="text-sm font-medium text-white truncate">{v.label}</p>
              )}
              <p className="text-xs text-ink-300">{formatDateTime(v.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                icon={<Pencil className="size-3.5" />}
                onClick={() => {
                  setRenamingId(v.id);
                  setDraft(v.label);
                }}
              />
              <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" />} onClick={() => onRestore(v.id)}>
                Restaurar
              </Button>
              {versions.length > 1 && (
                <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5 text-danger" />} onClick={() => onDelete(v.id)} />
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
