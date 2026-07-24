import { PALETTES } from "@/lib/design-ai/palette";

const SOLID_SWATCHES = ["#0a0a0a", "#161616", "#242424", "#3a3a3a", "#7a7a7a", "#ededed", "#ffffff"];

export function BackgroundsToolPanel({ onApply }: { onApply: (bg: string, bgTo?: string) => void }) {
  return (
    <div className="flex flex-col gap-4 p-3">
      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Cores sólidas</p>
        <div className="grid grid-cols-6 gap-2">
          {SOLID_SWATCHES.map((c) => (
            <button key={c} onClick={() => onApply(c, undefined)} className="aspect-square rounded-lg border border-ink-600 hover:scale-105 transition-transform" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Gradientes premium</p>
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map((p, i) => (
            <button
              key={i}
              onClick={() => onApply(p.bg, p.bgTo)}
              className="h-14 rounded-lg border border-ink-600 hover:border-ink-400 transition-colors"
              style={{ background: p.bgTo ? `linear-gradient(180deg, ${p.bg}, ${p.bgTo})` : p.bg }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
