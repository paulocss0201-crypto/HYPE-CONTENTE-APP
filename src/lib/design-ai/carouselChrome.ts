import type { DesignFormatSpec, DesignSlide } from "@/types/design";
import { makeShapeElement, makeTextElement } from "./elementFactory";
import { bestContrastColor } from "./contrast";
import { MARGIN } from "./layoutConstants";

// Appends a small, consistently-placed "n/total" indicator to a carousel
// slide, adapting pill/text color to stay legible against the slide's own
// background. No-op for single-slide designs.
export function addCarouselChrome(slide: DesignSlide, index: number, total: number, format: DesignFormatSpec): DesignSlide {
  if (total <= 1) return slide;

  const w = format.width;
  const h = format.height;
  const isLightBg = bestContrastColor(slide.background) === "#0a0a0a";
  const pillFill = isLightBg ? "rgba(255,255,255,0.65)" : "rgba(10,10,10,0.5)";
  const textColor = isLightBg ? "#0a0a0a" : "#ffffff";

  const pillWidth = w * 0.115;
  const pillHeight = h * 0.032;
  const x = w * (1 - MARGIN) - pillWidth;
  const y = h * (1 - MARGIN * 0.85) - pillHeight;
  const fontSize = Math.round(pillHeight * 0.5);
  const zBase = slide.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);

  const pill = makeShapeElement("rect", {
    x,
    y,
    width: pillWidth,
    height: pillHeight,
    fill: pillFill,
    cornerRadius: 999,
    locked: true,
    name: "Indicador de carrossel",
    zIndex: zBase + 1,
  });
  const label = makeTextElement({
    content: `${index + 1}/${total}`,
    x,
    y: y + (pillHeight - fontSize * 1.2) / 2,
    width: pillWidth,
    height: pillHeight,
    fontFamily: "Inter",
    fontSize,
    fontWeight: 600,
    color: textColor,
    align: "center",
    lineHeight: 1.2,
    locked: true,
    name: "Indicador de carrossel",
    zIndex: zBase + 2,
  });

  return { ...slide, elements: [...slide.elements, pill, label] };
}
