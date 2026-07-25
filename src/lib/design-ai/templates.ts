import type { DesignFormatKey } from "@/types/design";
import {
  layoutBoldStatement,
  layoutImageOverlay,
  layoutSplit,
  layoutQuoteCard,
  layoutNumbered,
  layoutMinimalFrame,
} from "./layouts";
import type { LayoutInput } from "./layouts";
import type { DesignPalette } from "./palette";
import type { FontPairing } from "./typography";
import { FONT_PAIRINGS } from "./typography";

export type TemplateCategory =
  | "Educativo"
  | "Autoridade"
  | "Venda"
  | "Storytelling"
  | "Prova social"
  | "Lista"
  | "Tutorial"
  | "Lançamento"
  | "Oferta"
  | "Minimalista"
  | "Corporativo"
  | "Futurista"
  | "Elegante"
  | "Criativo";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Educativo",
  "Autoridade",
  "Venda",
  "Storytelling",
  "Prova social",
  "Lista",
  "Tutorial",
  "Lançamento",
  "Oferta",
  "Minimalista",
  "Corporativo",
  "Futurista",
  "Elegante",
  "Criativo",
];

export interface DesignTemplate {
  id: string;
  category: TemplateCategory;
  name: string;
  layout: (input: LayoutInput) => { background: string; backgroundGradientTo?: string; elements: ReturnType<typeof layoutBoldStatement>["elements"] };
  palette: DesignPalette;
  fontPairing: FontPairing;
  formats: DesignFormatKey[];
}

const P = {
  mono: { bg: "#0a0a0a", bgTo: "#161616", accent: "#ffffff", text: "#ffffff" } as DesignPalette,
  soft: { bg: "#111111", accent: "#c9c9c9", text: "#ffffff" } as DesignPalette,
  contrast: { bg: "#0a0a0a", bgTo: "#242424", accent: "#a3a3a3", text: "#ffffff" } as DesignPalette,
  frame: { bg: "#161616", accent: "#ffffff", text: "#f5f5f5" } as DesignPalette,
};

// Maps each category to a curated font pairing so categories that share a
// layout function (e.g. Futurista/Corporativo/Venda/Lançamento all reuse
// layoutBoldStatement) still diverge visually instead of rendering identically.
const CATEGORY_FONT_PAIRING: Record<TemplateCategory, FontPairing> = {
  Educativo: FONT_PAIRINGS[3], // Editorial + Simples
  Autoridade: FONT_PAIRINGS[1], // Elegante + Minimalista
  Venda: FONT_PAIRINGS[0], // Título + Texto
  Storytelling: FONT_PAIRINGS[3],
  "Prova social": FONT_PAIRINGS[1],
  Lista: FONT_PAIRINGS[2], // Tecnológica + Neutra
  Tutorial: FONT_PAIRINGS[2],
  Lançamento: FONT_PAIRINGS[0],
  Oferta: FONT_PAIRINGS[0],
  Minimalista: FONT_PAIRINGS[4], // Minimalista
  Corporativo: FONT_PAIRINGS[2],
  Futurista: FONT_PAIRINGS[2],
  Elegante: FONT_PAIRINGS[1],
  Criativo: FONT_PAIRINGS[0],
};

const RAW_TEMPLATES: Omit<DesignTemplate, "fontPairing">[] = [
  { id: "educativo-split", category: "Educativo", name: "Educativo — Split", layout: layoutSplit, palette: P.soft, formats: ["post-quadrado", "carrossel-quadrado", "story"] },
  { id: "educativo-numerado", category: "Educativo", name: "Educativo — Numerado", layout: layoutNumbered, palette: P.contrast, formats: ["carrossel-quadrado", "carrossel-vertical"] },
  { id: "autoridade-quote", category: "Autoridade", name: "Autoridade — Citação", layout: layoutQuoteCard, palette: P.mono, formats: ["post-quadrado", "post-vertical", "story"] },
  { id: "autoridade-frame", category: "Autoridade", name: "Autoridade — Moldura", layout: layoutMinimalFrame, palette: P.frame, formats: ["post-quadrado", "capa-reels"] },
  { id: "venda-bold", category: "Venda", name: "Venda — Statement", layout: layoutBoldStatement, palette: P.mono, formats: ["post-quadrado", "post-vertical", "story", "capa-reels"] },
  { id: "venda-overlay", category: "Venda", name: "Venda — Overlay", layout: layoutImageOverlay, palette: P.contrast, formats: ["story", "capa-reels", "post-vertical"] },
  { id: "storytelling-quote", category: "Storytelling", name: "Storytelling — Narrativa", layout: layoutQuoteCard, palette: P.soft, formats: ["post-quadrado", "carrossel-quadrado"] },
  { id: "prova-social-split", category: "Prova social", name: "Prova social — Depoimento", layout: layoutSplit, palette: P.frame, formats: ["post-quadrado", "post-vertical"] },
  { id: "lista-numerado", category: "Lista", name: "Lista — Item numerado", layout: layoutNumbered, palette: P.mono, formats: ["carrossel-quadrado", "carrossel-vertical"] },
  { id: "tutorial-numerado", category: "Tutorial", name: "Tutorial — Passo a passo", layout: layoutNumbered, palette: P.soft, formats: ["carrossel-quadrado", "carrossel-vertical"] },
  { id: "lancamento-bold", category: "Lançamento", name: "Lançamento — Anúncio", layout: layoutBoldStatement, palette: P.contrast, formats: ["post-quadrado", "story", "capa-reels"] },
  { id: "oferta-overlay", category: "Oferta", name: "Oferta — Destaque", layout: layoutImageOverlay, palette: P.mono, formats: ["story", "post-vertical"] },
  { id: "minimalista-frame", category: "Minimalista", name: "Minimalista — Clean", layout: layoutMinimalFrame, palette: P.frame, formats: ["post-quadrado", "post-vertical", "story"] },
  { id: "corporativo-split", category: "Corporativo", name: "Corporativo — Institucional", layout: layoutSplit, palette: P.frame, formats: ["post-quadrado", "carrossel-quadrado"] },
  { id: "futurista-bold", category: "Futurista", name: "Futurista — Tech", layout: layoutBoldStatement, palette: P.contrast, formats: ["post-quadrado", "story", "capa-reels"] },
  { id: "elegante-quote", category: "Elegante", name: "Elegante — Sofisticado", layout: layoutQuoteCard, palette: P.frame, formats: ["post-quadrado", "post-vertical"] },
  { id: "criativo-overlay", category: "Criativo", name: "Criativo — Expressivo", layout: layoutImageOverlay, palette: P.soft, formats: ["story", "capa-reels", "post-vertical"] },
];

export const TEMPLATES: DesignTemplate[] = RAW_TEMPLATES.map((t) => ({ ...t, fontPairing: CATEGORY_FONT_PAIRING[t.category] }));

export function templatesForFormat(formatKey: DesignFormatKey): DesignTemplate[] {
  return TEMPLATES.filter((t) => t.formats.includes(formatKey));
}
