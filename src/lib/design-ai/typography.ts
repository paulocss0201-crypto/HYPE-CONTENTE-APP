import type { DesignSlide, TextElement } from "@/types/design";

export type FontCategory = "sans" | "serif" | "display" | "editorial" | "tecnologica" | "elegante" | "minimalista" | "manuscrita";

export const FONT_CATEGORY_LABEL: Record<FontCategory, string> = {
  sans: "Sans serif",
  serif: "Serif",
  display: "Display",
  editorial: "Editorial",
  tecnologica: "Tecnológica",
  elegante: "Elegante",
  minimalista: "Minimalista",
  manuscrita: "Manuscrita",
};

export interface FontEntry {
  name: string;
  category: FontCategory;
}

export const FONT_CATALOG: FontEntry[] = [
  { name: "Inter", category: "sans" },
  { name: "Manrope", category: "sans" },
  { name: "DM Sans", category: "minimalista" },
  { name: "Space Grotesk", category: "tecnologica" },
  { name: "Playfair Display", category: "editorial" },
  { name: "Bebas Neue", category: "display" },
];

export interface FontPairing {
  label: string;
  title: string;
  body: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  { label: "Título + Texto", title: "Bebas Neue", body: "Inter" },
  { label: "Elegante + Minimalista", title: "Playfair Display", body: "DM Sans" },
  { label: "Tecnológica + Neutra", title: "Space Grotesk", body: "Manrope" },
  { label: "Editorial + Simples", title: "Playfair Display", body: "Inter" },
  { label: "Minimalista", title: "DM Sans", body: "DM Sans" },
];

// Deterministic pick so a whole generation (e.g. every slide in a carousel)
// shares the same title/body font pairing instead of each slide falling
// back to the factory default (Inter) independently.
export function fontPairingFromSalt(salt: number): FontPairing {
  return FONT_PAIRINGS[Math.floor(salt) % FONT_PAIRINGS.length];
}

// Infers the pairing already in use on a slide (by matching its largest
// text's fontFamily against a pairing's title font) so redesigning that
// slide doesn't silently switch fonts away from the rest of the carousel.
export function fontPairingFromSlide(slide: DesignSlide): FontPairing {
  const texts = slide.elements.filter((e): e is TextElement => e.kind === "text").sort((a, b) => b.fontSize - a.fontSize);
  const titleFont = texts[0]?.fontFamily;
  return FONT_PAIRINGS.find((p) => p.title === titleFont) ?? FONT_PAIRINGS[0];
}

export interface TextStylePreset {
  key: string;
  label: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  lineHeight: number;
  uppercase: boolean;
}

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  { key: "titulo-principal", label: "Título principal", fontSize: 64, fontWeight: 800, letterSpacing: 0, lineHeight: 1.08, uppercase: false },
  { key: "titulo-secundario", label: "Título secundário", fontSize: 44, fontWeight: 700, letterSpacing: 0, lineHeight: 1.15, uppercase: false },
  { key: "subtitulo", label: "Subtítulo", fontSize: 30, fontWeight: 600, letterSpacing: 0, lineHeight: 1.25, uppercase: false },
  { key: "paragrafo", label: "Parágrafo", fontSize: 22, fontWeight: 400, letterSpacing: 0, lineHeight: 1.45, uppercase: false },
  { key: "destaque", label: "Destaque", fontSize: 28, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.2, uppercase: false },
  { key: "citacao", label: "Citação", fontSize: 34, fontWeight: 500, letterSpacing: 0, lineHeight: 1.3, uppercase: false },
  { key: "legenda", label: "Legenda", fontSize: 16, fontWeight: 400, letterSpacing: 0.3, lineHeight: 1.3, uppercase: false },
  { key: "cta", label: "Chamada para ação", fontSize: 24, fontWeight: 700, letterSpacing: 1.5, lineHeight: 1.1, uppercase: true },
];
