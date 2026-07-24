import type { DesignSlide, TextElement } from "@/types/design";
import { contrastRatio, MIN_SAFE_CONTRAST } from "./contrast";
import { computeDensity } from "./designIntelligence";

export interface DesignScoreResult {
  score: number;
  subScores: {
    hierarquia: number;
    legibilidade: number;
    consistencia: number;
    impacto: number;
    identidadeDeMarca: number;
    clarezaDaMensagem: number;
  };
  suggestions: string[];
}

export function analyzeDesignScore(slide: DesignSlide, brandColors: string[] = [], brandFonts: string[] = []): DesignScoreResult {
  const texts = slide.elements.filter((e): e is TextElement => e.kind === "text" && !e.hidden);
  const suggestions: string[] = [];

  // Hierarquia: at least two distinct font sizes among texts, largest clearly dominant.
  const sizes = Array.from(new Set(texts.map((t) => t.fontSize))).sort((a, b) => b - a);
  let hierarquia = 60;
  if (sizes.length >= 2 && sizes[0] >= sizes[1] * 1.3) hierarquia = 92;
  else if (sizes.length >= 2) hierarquia = 74;
  else if (texts.length > 1) {
    hierarquia = 45;
    suggestions.push("Dê mais destaque ao título — os textos estão todos com o mesmo peso visual.");
  }

  // Legibilidade: contrast of every text vs slide background.
  const lowContrast = texts.filter((t) => contrastRatio(t.color, slide.background) < MIN_SAFE_CONTRAST);
  const legibilidade = texts.length === 0 ? 70 : Math.round(((texts.length - lowContrast.length) / texts.length) * 100);
  if (lowContrast.length > 0) suggestions.push("Aumente o contraste do título — o texto pode estar difícil de ler sobre o fundo atual.");

  // Consistência: font family variety (fewer distinct families = more consistent).
  const families = new Set(texts.map((t) => t.fontFamily));
  let consistencia = families.size <= 2 ? 90 : families.size === 3 ? 70 : 45;
  if (families.size > 2) suggestions.push("Reduza a quantidade de fontes diferentes para manter consistência visual.");
  if (brandFonts.length > 0 && texts.some((t) => !brandFonts.includes(t.fontFamily))) {
    consistencia = Math.min(consistencia, 65);
  }

  // Impacto: is there a short, bold, high-contrast CTA-like text on the slide?
  const ctaCandidate = texts.find((t) => t.fontWeight >= 600 && t.content.length <= 40);
  let impacto = 65;
  if (ctaCandidate && contrastRatio(ctaCandidate.color, slide.background) >= MIN_SAFE_CONTRAST) impacto = 85;
  else suggestions.push("A chamada para ação precisa de mais destaque visual.");

  // Identidade de marca: uses brand colors somewhere.
  const usesBrandColor = brandColors.length === 0 || texts.some((t) => brandColors.includes(t.color)) || brandColors.includes(slide.background);
  const identidadeDeMarca = brandColors.length === 0 ? 70 : usesBrandColor ? 88 : 50;
  if (brandColors.length > 0 && !usesBrandColor) suggestions.push("Aplique as cores da sua marca para reforçar a identidade visual.");

  // Clareza da mensagem: density check.
  const density = computeDensity(slide);
  let clareza = density.level === "limpo" ? 88 : density.level === "equilibrado" ? 78 : 50;
  if (density.level === "carregado") suggestions.push("Reduza a quantidade de texto ou elementos — a composição está visualmente sobrecarregada.");

  const subScores = { hierarquia, legibilidade, consistencia, impacto, identidadeDeMarca, clarezaDaMensagem: clareza };
  const score = Math.round(Object.values(subScores).reduce((a, b) => a + b, 0) / Object.values(subScores).length);

  if (suggestions.length === 0) suggestions.push("A composição está equilibrada — bom trabalho.");

  return { score, subScores, suggestions: Array.from(new Set(suggestions)) };
}
