import { useState } from "react";
import { Input, Tabs } from "@/components/ui";
import type { DesignElement } from "@/types/design";
import { makeShapeElement, makeIconElement } from "@/lib/design-ai";
import { ICON_KEYS } from "@/lib/design-ai/iconPaths";
import { IconGroupNode } from "../canvas/IconGroupNode";
import { Stage, Layer } from "react-konva";
import { Square, Circle, Minus, MoveRight, RectangleHorizontal } from "lucide-react";

const SHAPE_OPTIONS = [
  { key: "rect", label: "Retângulo", icon: Square },
  { key: "circle", label: "Círculo", icon: Circle },
  { key: "line", label: "Linha", icon: Minus },
  { key: "arrow", label: "Seta", icon: MoveRight },
  { key: "frame", label: "Moldura", icon: RectangleHorizontal },
] as const;

export function ElementsToolPanel({ initialTab = "shapes", onAdd }: { initialTab?: "shapes" | "icons"; onAdd: (el: DesignElement) => void }) {
  const [tab, setTab] = useState<string>(initialTab);
  const [search, setSearch] = useState("");

  const filteredIcons = ICON_KEYS.filter((k) => k.includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-3 p-3">
      <Tabs tabs={[{ key: "shapes", label: "Formas" }, { key: "icons", label: "Ícones" }]} active={tab} onChange={setTab} />

      {tab === "shapes" && (
        <div className="grid grid-cols-3 gap-2">
          {SHAPE_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => onAdd(makeShapeElement(s.key, { x: 120, y: 120 }))}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-ink-700 py-4 text-ink-200 hover:border-ink-400 hover:text-white hover:bg-ink-850 transition-colors"
            >
              <s.icon className="size-5" />
              <span className="text-[10px]">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {tab === "icons" && (
        <div className="flex flex-col gap-3">
          <Input placeholder="Pesquisar ícones..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="grid grid-cols-5 gap-2 max-h-[420px] overflow-y-auto">
            {filteredIcons.map((icon) => (
              <button
                key={icon}
                onClick={() => onAdd(makeIconElement(icon, { x: 120, y: 120 }))}
                title={icon}
                className="flex items-center justify-center rounded-xl border border-ink-700 aspect-square hover:border-ink-400 hover:bg-ink-850 transition-colors"
              >
                <Stage width={28} height={28} listening={false}>
                  <Layer>
                    <IconGroupNode icon={icon} color="#e5e5e5" width={28} height={28} />
                  </Layer>
                </Stage>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
