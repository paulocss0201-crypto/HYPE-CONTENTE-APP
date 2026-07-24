import type { GridMode } from "../toolTypes";

const COLUMNS_BY_MODE: Record<GridMode, number> = { none: 0, "2": 2, "3": 3, "4": 4, "6": 6, modular: 6, editorial: 2 };

export function GridOverlay({
  width,
  height,
  scale,
  mode,
  margin,
  safeArea,
}: {
  width: number;
  height: number;
  scale: number;
  mode: GridMode;
  margin: number;
  safeArea: boolean;
}) {
  if (mode === "none" && !safeArea) return null;

  const w = width * scale;
  const h = height * scale;
  const m = margin * scale;
  const columns = COLUMNS_BY_MODE[mode];

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  if (columns > 0) {
    const innerW = w - m * 2;
    const colWidth = innerW / columns;
    lines.push({ x1: m, y1: 0, x2: m, y2: h }, { x1: w - m, y1: 0, x2: w - m, y2: h });
    for (let i = 1; i < columns; i++) {
      const x = m + colWidth * i;
      lines.push({ x1: x, y1: 0, x2: x, y2: h });
    }
  }

  if (mode === "modular") {
    const innerH = h - m * 2;
    const rowHeight = innerH / columns;
    lines.push({ x1: 0, y1: m, x2: w, y2: m }, { x1: 0, y1: h - m, x2: w, y2: h - m });
    for (let i = 1; i < columns; i++) {
      const y = m + rowHeight * i;
      lines.push({ x1: 0, y1: y, x2: w, y2: y });
    }
  }

  if (mode === "editorial") {
    const y = m + (h - m * 2) * 0.28;
    lines.push({ x1: 0, y1: y, x2: w, y2: y });
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width: w, height: h }}>
      <svg width={w} height={h} className="absolute inset-0">
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="4 4" />
        ))}
      </svg>
      {safeArea && (
        <div
          className="absolute border border-dashed rounded-sm"
          style={{ borderColor: "rgba(236,72,153,0.6)", left: w * 0.08, top: h * 0.08, width: w * 0.84, height: h * 0.84 }}
        />
      )}
    </div>
  );
}
