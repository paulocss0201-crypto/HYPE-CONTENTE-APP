import { Modal, Button } from "@/components/ui";
import type { DesignVersion } from "@/types/design";
import { formatDateTime } from "@/lib/utils";
import { History, RotateCcw, Copy } from "lucide-react";

export function DesignVersionHistoryModal({
  open,
  onClose,
  versions,
  onRestore,
  onDuplicate,
}: {
  open: boolean;
  onClose: () => void;
  versions: DesignVersion[];
  onRestore: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Histórico de versões" size="lg">
      <div className="flex flex-col gap-2">
        {[...versions].reverse().map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900/60 p-3">
            <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
              <History className="size-4 text-ink-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{v.label}</p>
              <p className="text-xs text-ink-300">{formatDateTime(v.createdAt)} · {v.slides.length} slide{v.slides.length > 1 ? "s" : ""}</p>
            </div>
            <Button size="sm" variant="ghost" icon={<Copy className="size-3.5" />} onClick={() => onDuplicate(v.id)}>
              Duplicar
            </Button>
            <Button size="sm" variant="ghost" icon={<RotateCcw className="size-3.5" />} onClick={() => onRestore(v.id)}>
              Restaurar
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
