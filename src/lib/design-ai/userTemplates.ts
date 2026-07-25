import { uid } from "@/lib/utils";
import type { DesignElement, TextElement, UserTemplate } from "@/types/design";

// Re-applies a hand-built UserTemplate to new title/body/cta text, mirroring
// extractSlideTexts' font-size-rank mapping (largest = title, next = body,
// smallest = cta) so the round trip stays consistent with how built-in
// DesignTemplate layouts are re-applied elsewhere. Every other property
// (position, size, font, color, rotation...) is preserved exactly as the
// user placed it.
export function applyUserTemplate(
  template: UserTemplate,
  texts: { title: string; body?: string; cta?: string }
): { background: string; backgroundGradientTo?: string; elements: DesignElement[] } {
  const textEls = template.elements
    .filter((e): e is TextElement => e.kind === "text")
    .sort((a, b) => b.fontSize - a.fontSize);

  const contentByElementId = new Map<string, string>();
  if (textEls.length === 1) {
    contentByElementId.set(textEls[0].id, texts.title);
  } else if (textEls.length === 2) {
    contentByElementId.set(textEls[0].id, texts.title);
    if (texts.body) contentByElementId.set(textEls[1].id, texts.body);
  } else if (textEls.length >= 3) {
    contentByElementId.set(textEls[0].id, texts.title);
    if (texts.body) contentByElementId.set(textEls[1].id, texts.body);
    if (texts.cta) contentByElementId.set(textEls[textEls.length - 1].id, texts.cta);
  }

  const elements = template.elements.map((e) => {
    const newContent = contentByElementId.get(e.id);
    const clone = { ...e, id: uid("el") };
    return e.kind === "text" && newContent !== undefined ? { ...clone, content: newContent } : clone;
  });

  return { background: template.background, backgroundGradientTo: template.backgroundGradientTo, elements };
}
