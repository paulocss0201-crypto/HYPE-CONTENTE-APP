let measureCtx: CanvasRenderingContext2D | null | undefined;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureCtx !== undefined) return measureCtx;
  if (typeof document === "undefined") {
    measureCtx = null;
    return measureCtx;
  }
  measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx;
}

function countWrappedLines(ctx: CanvasRenderingContext2D, content: string, maxWidth: number): number {
  let totalLines = 0;
  for (const paragraph of content.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      totalLines += 1;
      continue;
    }
    let line = "";
    let lines = 0;
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines += 1;
        line = word;
      } else {
        line = candidate;
      }
    }
    totalLines += lines + 1;
  }
  return totalLines;
}

export function measureWrappedTextHeight(content: string, fontSize: number, fontFamily: string, fontWeight: number, width: number, lineHeight: number): number {
  const ctx = getMeasureContext();
  if (!ctx) return fontSize * lineHeight * Math.max(1, Math.ceil(content.length / 20));
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return countWrappedLines(ctx, content, width) * fontSize * lineHeight;
}

// Shrinks fontSize (in steps of 2px, down to minFontSize) until the wrapped
// content fits within the given box height, preventing overflow on long
// AI-generated titles/bodies without ever growing the text past maxFontSize.
export function fitFontSize({
  content,
  fontFamily,
  fontWeight,
  width,
  height,
  lineHeight,
  maxFontSize,
  minFontSize = 14,
}: {
  content: string;
  fontFamily: string;
  fontWeight: number;
  width: number;
  height: number;
  lineHeight: number;
  maxFontSize: number;
  minFontSize?: number;
}): number {
  let fontSize = maxFontSize;
  while (fontSize > minFontSize) {
    if (measureWrappedTextHeight(content, fontSize, fontFamily, fontWeight, width, lineHeight) <= height) break;
    fontSize -= 2;
  }
  return Math.round(fontSize);
}
