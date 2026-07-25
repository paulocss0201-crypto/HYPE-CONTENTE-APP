import type { DesignSlide, ShapeElement, TextElement } from "@/types/design";
import { bestContrastColor, contrastRatio, MIN_SAFE_CONTRAST } from "./contrast";

export interface DesignPalette {
  bg: string;
  bgTo?: string;
  accent: string;
  text: string;
}

export const PALETTES: DesignPalette[] = [
  { bg: "#0a0a0a", bgTo: "#161616", accent: "#ffffff", text: "#ffffff" },
  { bg: "#111111", accent: "#e5e5e5", text: "#ffffff" },
  { bg: "#0a0a0a", bgTo: "#242424", accent: "#a3a3a3", text: "#ffffff" },
  { bg: "#161616", accent: "#ffffff", text: "#f5f5f5" },
  { bg: "#f5f5f5", bgTo: "#e8e8e8", accent: "#0a0a0a", text: "#0a0a0a" },
  { bg: "#ffffff", accent: "#242424", text: "#111111" },
  { bg: "#ece7dd", bgTo: "#ddd5c5", accent: "#1a1a1a", text: "#1a1a1a" },
];

const KEYWORD_COLORS: { pattern: RegExp; color: string }[] = [
  { pattern: /preto|escuro|dark/i, color: "#0a0a0a" },
  { pattern: /branc/i, color: "#ffffff" },
  { pattern: /cinza|grafite/i, color: "#a3a3a3" },
  { pattern: /azul/i, color: "#3b82f6" },
  { pattern: /verde/i, color: "#22c55e" },
  { pattern: /vermelh/i, color: "#ef4444" },
  { pattern: /dourad|ouro|gold/i, color: "#d4af37" },
  { pattern: /rosa|pink/i, color: "#ec4899" },
  { pattern: /roxo|lilás|neon/i, color: "#a855f7" },
];

// Guarantees a palette is legible before it's ever handed to a layout: any
// accent/text color that fails MIN_SAFE_CONTRAST against the background is
// swapped for the best available contrast color, so generation never
// proactively ships an unreadable combination.
function finalizePalette(base: DesignPalette, accentOverride?: string): DesignPalette {
  let accent = accentOverride ?? base.accent;
  let text = base.text;
  if (contrastRatio(accent, base.bg) < MIN_SAFE_CONTRAST) accent = bestContrastColor(base.bg);
  if (contrastRatio(text, base.bg) < MIN_SAFE_CONTRAST) text = bestContrastColor(base.bg);
  return { ...base, accent, text };
}

export function paletteFromPrompt(prompt: string, salt: number): DesignPalette {
  const found = KEYWORD_COLORS.filter((k) => k.pattern.test(prompt)).map((k) => k.color);
  const base = PALETTES[Math.floor(salt) % PALETTES.length];
  if (found.length === 0) return finalizePalette(base);
  const accent = found.find((c) => c !== "#0a0a0a" && c !== "#ffffff") ?? found[0];
  return finalizePalette(base, accent);
}

// Derives a palette from a slide's own current colors instead of sampling a
// fresh random base — used when redesigning a single carousel slide so it
// doesn't visually diverge from the rest of the carousel.
export function paletteFromSlide(slide: DesignSlide): DesignPalette {
  const texts = slide.elements.filter((e): e is TextElement => e.kind === "text");
  const shapes = slide.elements.filter((e): e is ShapeElement => e.kind === "shape" && e.fill !== "transparent");
  const text = texts[0]?.color ?? bestContrastColor(slide.background);
  const accent = shapes.find((s) => s.fill !== slide.background)?.fill ?? texts.find((t) => t.color !== text)?.color ?? text;
  return finalizePalette({ bg: slide.background, bgTo: slide.backgroundGradientTo, accent, text });
}
