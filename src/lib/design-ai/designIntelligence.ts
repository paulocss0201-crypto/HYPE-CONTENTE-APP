import type { DesignElement, DesignFormatSpec, DesignSlide, TextElement } from "@/types/design";
import { redesignSlide } from "./generateDesign";
import { extractSlideTexts } from "./slideText";
import { newSalt } from "@/lib/ai/helpers";

export type DensityLevel = "limpo" | "equilibrado" | "carregado";

export function computeDensity(slide: DesignSlide): { level: DensityLevel; score: number } {
  const visible = slide.elements.filter((e) => !e.hidden);
  const textChars = visible.filter((e): e is TextElement => e.kind === "text").reduce((sum, e) => sum + e.content.length, 0);
  const score = visible.length * 8 + textChars * 0.15;
  const level: DensityLevel = score < 60 ? "limpo" : score < 140 ? "equilibrado" : "carregado";
  return { level, score };
}

// Reassigns a canonical size/weight scale to text elements based on their current relative
// size, so the largest stays the headline and the rest step down — without touching content.
export function improveHierarchy(slide: DesignSlide): DesignSlide {
  const texts = slide.elements.filter((e): e is TextElement => e.kind === "text" && !e.hidden);
  if (texts.length === 0) return slide;

  const sorted = [...texts].sort((a, b) => b.fontSize - a.fontSize);
  const scale = [
    { fontSize: 64, fontWeight: 800 },
    { fontSize: 36, fontWeight: 600 },
    { fontSize: 24, fontWeight: 500 },
    { fontSize: 20, fontWeight: 400 },
  ];

  const updates = new Map<string, Partial<TextElement>>();
  sorted.forEach((t, i) => {
    const rung = scale[Math.min(i, scale.length - 1)];
    updates.set(t.id, rung);
  });

  return {
    ...slide,
    elements: slide.elements.map((e) => (e.kind === "text" && updates.has(e.id) ? { ...e, ...updates.get(e.id) } : e)),
  };
}

export function adaptSlideToFormat(slide: DesignSlide, format: DesignFormatSpec): DesignSlide {
  const texts = extractSlideTexts(slide);
  return redesignSlide("generic", slide, texts.title, texts.body, texts.cta, format.key, "", newSalt());
}

export function reduceDensity(slide: DesignSlide): DesignSlide {
  // Drop purely decorative shape/icon elements first, keep text and images intact.
  const decorative = slide.elements.filter((e) => e.kind === "shape" || e.kind === "icon");
  if (decorative.length === 0) return slide;
  const toRemove = new Set(decorative.slice(Math.ceil(decorative.length / 2)).map((e) => e.id));
  return { ...slide, elements: slide.elements.filter((e: DesignElement) => !toRemove.has(e.id)) };
}
