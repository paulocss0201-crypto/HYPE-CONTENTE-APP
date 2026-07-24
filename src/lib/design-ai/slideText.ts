import type { DesignSlide } from "@/types/design";

export function extractSlideTexts(slide: DesignSlide): { title: string; body?: string; cta?: string } {
  const texts = slide.elements.filter((e) => e.kind === "text").sort((a, b) => b.fontSize - a.fontSize);
  if (texts.length === 0) return { title: "Seu título aqui" };
  if (texts.length === 1) return { title: texts[0].content };
  if (texts.length === 2) return { title: texts[0].content, body: texts[1].content };
  return { title: texts[0].content, body: texts[1].content, cta: texts[texts.length - 1].content };
}
