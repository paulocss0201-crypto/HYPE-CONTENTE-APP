import { useState } from "react";
import { Modal, Button, ChipGroup, Switch } from "@/components/ui";
import { AlertTriangle, Download } from "lucide-react";

export type ExportKind = "png" | "jpg" | "pdf-all" | "zip-all";

const FORMAT_OPTIONS: { key: ExportKind; label: string }[] = [
  { key: "png", label: "PNG (slide atual)" },
  { key: "jpg", label: "JPG (slide atual)" },
  { key: "pdf-all", label: "PDF com todos os slides" },
  { key: "zip-all", label: "Pasta compactada (.zip)" },
];

export function ExportModal({
  open,
  onClose,
  onExport,
  warnings,
}: {
  open: boolean;
  onClose: () => void;
  onExport: (kind: ExportKind, options: { highQuality: boolean; transparent: boolean }) => void;
  warnings: string[];
}) {
  const [kind, setKind] = useState<ExportKind>("png");
  const [highQuality, setHighQuality] = useState(true);
  const [transparent, setTransparent] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title="Exportar design">
      <div className="flex flex-col gap-4">
        <ChipGroup label="Formato de exportação" options={FORMAT_OPTIONS} value={kind} onChange={(v) => setKind(v as ExportKind)} />
        <Switch checked={highQuality} onChange={setHighQuality} label="Alta qualidade" description="Exporta em resolução 3x para impressão e telas de alta densidade" />
        {(kind === "png" || kind === "zip-all") && (
          <Switch checked={transparent} onChange={setTransparent} label="Fundo transparente" description="Remove a cor de fundo do slide na exportação" />
        )}

        {warnings.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-warning text-xs font-semibold">
              <AlertTriangle className="size-3.5" /> Antes de exportar, revise:
            </div>
            <ul className="flex flex-col gap-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-xs text-ink-200">
                  • {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button icon={<Download className="size-4" />} onClick={() => onExport(kind, { highQuality, transparent })}>
          Exportar
        </Button>
      </div>
    </Modal>
  );
}
