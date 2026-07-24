import type { DesignFormatSpec, DesignSlide } from "@/types/design";

export function validateDesign(slides: DesignSlide[], format: DesignFormatSpec): string[] {
  const warnings: string[] = [];

  slides.forEach((slide, i) => {
    slide.elements.forEach((el) => {
      if (el.hidden) return;
      const outOfBounds = el.x < -4 || el.y < -4 || el.x + el.width > format.width + 4 || el.y + el.height > format.height + 4;
      if (outOfBounds) warnings.push(`Slide ${i + 1}: um elemento está fora da área segura da imagem.`);
      if (el.kind === "text" && !el.content.trim()) warnings.push(`Slide ${i + 1}: há um texto vazio.`);
      if (el.kind === "image" && !el.src) warnings.push(`Slide ${i + 1}: uma imagem não foi carregada.`);
    });
    if (slide.elements.filter((e) => !e.hidden).length === 0) warnings.push(`Slide ${i + 1}: está vazio.`);
  });

  const ratio = format.width / format.height;
  if (Math.abs(ratio - 1) > 0.6 && Math.abs(ratio - 0.8) > 0.1 && Math.abs(ratio - 9 / 16) > 0.1) {
    warnings.push("Proporção do formato foge dos padrões recomendados pelo Instagram.");
  }

  return Array.from(new Set(warnings));
}
