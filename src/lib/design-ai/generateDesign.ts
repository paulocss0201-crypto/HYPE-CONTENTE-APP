import type { GeneratedContent } from "@/types";
import type { DesignFormatKey, DesignSlide } from "@/types/design";
import { DESIGN_FORMATS } from "@/types/design";
import { buildSlide } from "./layouts";
import type { SlideRole, LayoutInput } from "./layouts";
import { paletteFromPrompt } from "./palette";
import { withZIndex } from "./elementFactory";

export function defaultFormatForContent(content: GeneratedContent | null): DesignFormatKey {
  if (!content) return "post-quadrado";
  if (content.format === "reels") return "capa-reels";
  if (content.format === "stories") return "story";
  if (content.format === "carousel") return "carrossel-quadrado";
  return "post-quadrado";
}

interface SlideText {
  role: SlideRole;
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: string;
}

function extractSlideTexts(content: GeneratedContent | null, fallbackTitle: string): SlideText[] {
  if (!content) return [{ role: "capa", title: fallbackTitle }];

  if (content.format === "reels") {
    return [{ role: "capa", title: content.data.hook || content.data.title, cta: content.data.cta }];
  }

  if (content.format === "carousel") {
    return content.data.slides.map((s, i) => ({
      role: s.role === "capa" ? "capa" : s.role === "problema" ? "problema" : s.role === "transformacao" ? "transformacao" : s.role === "cta" ? "cta" : "desenvolvimento",
      eyebrow: String(i + 1).padStart(2, "0"),
      title: s.title,
      body: s.body,
    }));
  }

  if (content.format === "stories") {
    return content.data.stories.map((s) => ({
      role: s.stage === "gancho" ? "capa" : s.stage === "cta" ? "cta" : s.stage === "solucao" ? "transformacao" : s.stage === "identificacao" ? "problema" : "desenvolvimento",
      title: s.mainText,
      body: s.supportText,
      cta: s.cta || undefined,
    }));
  }

  return [{ role: "capa", title: content.data.title || fallbackTitle, body: content.data.caption, cta: content.data.cta || undefined }];
}

export function generateDesignFromContent(
  content: GeneratedContent | null,
  formatKey: DesignFormatKey,
  visualPrompt: string,
  fallbackTitle: string,
  salt: number
): DesignSlide[] {
  const format = DESIGN_FORMATS.find((f) => f.key === formatKey) ?? DESIGN_FORMATS[0];
  const palette = paletteFromPrompt(visualPrompt, salt);
  const texts = extractSlideTexts(content, fallbackTitle);

  return texts.map((t, i) => {
    const input: LayoutInput = { eyebrow: t.eyebrow, title: t.title, body: t.body, cta: t.cta, palette, format };
    const slide = buildSlide(t.role, input, salt + i * 7);
    return { ...slide, id: `slide_${i}_${Date.now()}_${Math.floor(Math.random() * 9999)}`, elements: withZIndex(slide.elements) };
  });
}

export function redesignSlide(
  role: SlideRole,
  currentSlide: DesignSlide,
  title: string,
  body: string | undefined,
  cta: string | undefined,
  formatKey: DesignFormatKey,
  visualPrompt: string,
  salt: number
): DesignSlide {
  const format = DESIGN_FORMATS.find((f) => f.key === formatKey) ?? DESIGN_FORMATS[0];
  const palette = paletteFromPrompt(visualPrompt, salt);
  const slide = buildSlide(role, { title, body, cta, palette, format }, salt);
  return { ...slide, id: currentSlide.id, elements: withZIndex(slide.elements) };
}
